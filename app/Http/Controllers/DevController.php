<?php

namespace App\Http\Controllers;

use App\Services\ODKDataAggregator;
use App\SpiSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DevController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function timelineCheck()
    {
        return view('dev/timeline_check');
    }

    public function mflCheck()
    {
        return view('dev/mfl_check');
    }

    public function bulkCorrection()
    {
        return view('dev/bulk_correction');
    }

    public function getFacilityTimeline(Request $request)
    {
        try {
            $mfl = trim($request->input('mfl', ''));
            if (empty($mfl)) {
                return response()->json(['error' => 'MFL code is required'], 422);
            }

            $agg = new ODKDataAggregator();
            $rows = $agg->getFacilityTimeline($mfl);

            return response()->json(['data' => $rows, 'count' => count($rows)]);
        } catch (\Exception $ex) {
            Log::error($ex);
            return response()->json(['error' => $ex->getMessage()], 500);
        }
    }

    public function fixSubmissionStage(Request $request)
    {
        $request->validate([
            'uuid'             => 'required|string|max:64',
            'target_stage'     => 'required|string|max:40',
            'previous_stage'   => 'nullable|string|max:40',
            'mfl'              => 'nullable|string|max:20',
            'mysites_facility' => 'nullable|string|max:255',
            'mysites'          => 'nullable|string|max:60',
        ]);

        $uuid        = $request->input('uuid');
        $targetStage = $request->input('target_stage');

        // Resolve the submission_defs row via submissions.instanceId
        $row = DB::connection('odk_central')
            ->select(
                'SELECT sd.id, sd.xml
                 FROM submission_defs sd
                 JOIN submissions s ON sd."submissionId" = s.id
                 WHERE s."instanceId" = ?
                 ORDER BY sd.id DESC
                 LIMIT 1',
                [$uuid]
            );

        if (empty($row)) {
            return response()->json(['error' => 'Submission not found: ' . $uuid], 404);
        }

        $defId      = $row[0]->id;
        $originalXml = $row[0]->xml;
        $newXml      = $this->rewriteStageXml($originalXml, $targetStage);

        if ($newXml === $originalXml) {
            return response()->json(['error' => 'XML unchanged — stage may already be correct or pattern not matched'], 422);
        }

        DB::connection('odk_central')
            ->statement('UPDATE submission_defs SET xml = ? WHERE id = ?', [$newXml, $defId]);

        // Persist the correction locally so re-ingest cannot overwrite it
        DB::table('spi_submissions')
            ->where('submission_uuid', $uuid)
            ->update(['stage_override' => $targetStage, 'updated_at' => now()]);

        // Audit log
        DB::table('submission_stage_audit_log')->insert([
            'uuid'             => $uuid,
            'mfl'              => $request->input('mfl'),
            'mysites_facility' => $request->input('mysites_facility'),
            'mysites'          => $request->input('mysites'),
            'previous_stage'   => $request->input('previous_stage'),
            'applied_stage'    => $targetStage,
            'action'           => 'stage_fix',
            'applied_by'       => auth()->id(),
            'applied_at'       => now(),
        ]);

        Log::info('submission_stage_fix', [
            'uuid'         => $uuid,
            'target_stage' => $targetStage,
            'def_id'       => $defId,
            'user'         => auth()->id(),
        ]);

        return response()->json(['ok' => true, 'def_id' => $defId]);
    }

    public function softDeleteSubmission(Request $request)
    {
        $request->validate([
            'uuid'             => 'required|string|max:64',
            'previous_stage'   => 'nullable|string|max:40',
            'mfl'              => 'nullable|string|max:20',
            'mysites_facility' => 'nullable|string|max:255',
            'mysites'          => 'nullable|string|max:60',
        ]);

        $uuid = $request->input('uuid');

        $affected = DB::connection('odk_central')
            ->statement('UPDATE submissions SET "deletedAt" = NOW() WHERE "instanceId" = ? AND "deletedAt" IS NULL', [$uuid]);

        if (!$affected) {
            // Check if it exists at all
            $exists = DB::connection('odk_central')
                ->select('SELECT id FROM submissions WHERE "instanceId" = ?', [$uuid]);
            if (empty($exists)) {
                return response()->json(['error' => 'Submission not found: ' . $uuid], 404);
            }
            // Already deleted — treat as success
        }

        // Mirror the soft-delete locally so re-ingest cannot resurrect the record
        DB::table('spi_submissions')
            ->where('submission_uuid', $uuid)
            ->update(['is_soft_deleted' => true, 'updated_at' => now()]);

        DB::table('submission_stage_audit_log')->insert([
            'uuid'             => $uuid,
            'mfl'              => $request->input('mfl'),
            'mysites_facility' => $request->input('mysites_facility'),
            'mysites'          => $request->input('mysites'),
            'previous_stage'   => $request->input('previous_stage'),
            'applied_stage'    => null,
            'action'           => 'soft_delete',
            'applied_by'       => auth()->id(),
            'applied_at'       => now(),
        ]);

        Log::info('submission_soft_delete', [
            'uuid' => $uuid,
            'user' => auth()->id(),
        ]);

        return response()->json(['ok' => true]);
    }

    public function triggerOdkFetch(Request $request)
    {
        $request->validate([
            'county'    => 'required|string|max:100',
            'checklist' => 'required|in:spi,hts',
        ]);

        $county    = $request->input('county');
        $checklist = $request->input('checklist');

        $artisan = base_path('artisan');
        $logFile = storage_path('logs/odk_fetch.log');

        $cmd = PHP_BINARY
            . ' ' . escapeshellarg($artisan)
            . ' fetchodkdata'
            . ' --county=' . escapeshellarg($county)
            . ' --checklist=' . escapeshellarg($checklist)
            . ' --force'
            . ' >> ' . escapeshellarg($logFile)
            . ' 2>&1 &';

        exec($cmd);

        Log::info('odk_fetch_triggered', [
            'county'       => $county,
            'checklist'    => $checklist,
            'triggered_by' => auth()->id(),
        ]);

        return response()->json([
            'ok'      => true,
            'message' => "ODK fetch triggered for county \"{$county}\" (checklist: {$checklist})",
        ]);
    }

    // -----------------------------------------------------------------------
    // Bulk mismatch summary
    // -----------------------------------------------------------------------

    public function getMismatchSummary(Request $request): JsonResponse
    {
        $countyFilter = $request->input('county') ? trim($request->input('county')) : null;

        $query = SpiSubmission::where('is_soft_deleted', false)
            ->orderBy('mysites_county')
            ->orderBy('mysites_subcounty')
            ->orderBy('mysites_facility')
            ->orderBy('mysites_site')
            ->orderBy('submission_date')
            ->select([
                'submission_uuid', 'mysites_county', 'mysites_subcounty',
                'mysites_facility', 'mysites_mfl', 'mysites_site',
                'submission_date', 'computed_stage', 'stage_override',
                'reported_baselinefollowup', 'reported_followup',
            ]);

        if ($countyFilter) {
            $query->where('mysites_county', 'like', "%{$countyFilter}%");
        }

        $rows = $query->get();

        // Build county → subcounty → facility+site → records
        $tree = [];
        foreach ($rows as $row) {
            $county  = $row->mysites_county ?: '(unknown)';
            $sub     = $row->mysites_subcounty ?: '(unknown)';
            $facKey  = ($row->mysites_facility ?? '') . '|' . ($row->mysites_site ?? '');

            $effective  = $row->effective_stage;
            $reported   = $this->deriveReportedStage($row);
            $isMismatch = $effective !== $reported;

            $tree[$county][$sub][$facKey]['meta'] ??= [
                'mfl'      => $row->mysites_mfl,
                'facility' => $row->mysites_facility,
                'site'     => $row->mysites_site,
            ];
            $tree[$county][$sub][$facKey]['records'][] = [
                'uuid'            => $row->submission_uuid,
                'submission_date' => $row->submission_date ? $row->submission_date->format('Y-m-d') : null,
                'reported_stage'  => $reported,
                'effective_stage' => $effective,
                'has_override'    => $row->stage_override !== null,
                'is_mismatch'     => $isMismatch,
                'is_soft_delete_candidate' => false,
            ];
        }

        // Annotate soft-delete candidates within each facility group (mismatch < 87 days before next record)
        foreach ($tree as &$subs) {
            foreach ($subs as &$facilities) {
                foreach ($facilities as &$fac) {
                    $n = count($fac['records']);
                    for ($i = 0; $i < $n - 1; $i++) {
                        if (!$fac['records'][$i]['is_mismatch'] || !$fac['records'][$i]['submission_date']) continue;
                        $next = $fac['records'][$i + 1];
                        if (!$next['submission_date']) continue;
                        $diff = (strtotime($next['submission_date']) - strtotime($fac['records'][$i]['submission_date'])) / 86400;
                        if ($diff >= 0 && $diff < 87) {
                            $fac['records'][$i]['is_soft_delete_candidate'] = true;
                        }
                    }
                }
            }
        }
        unset($subs, $facilities, $fac);

        // Collapse into response structure with stats
        $countyResult = [];
        foreach ($tree as $county => $subs) {
            $cStats = ['total' => 0, 'matched' => 0, 'mismatches' => 0, 'soft_deletes' => 0];
            $subResult = [];

            foreach ($subs as $sub => $facilities) {
                $sStats = ['total' => 0, 'matched' => 0, 'mismatches' => 0, 'soft_deletes' => 0];
                $facResult = [];

                foreach ($facilities as $fac) {
                    $fStats = ['total' => 0, 'matched' => 0, 'mismatches' => 0, 'soft_deletes' => 0];
                    $mismatches = [];
                    $softDeletes = [];

                    foreach ($fac['records'] as $rec) {
                        $fStats['total']++;
                        if (!$rec['is_mismatch']) {
                            $fStats['matched']++;
                        } elseif ($rec['is_soft_delete_candidate']) {
                            $fStats['soft_deletes']++;
                            $softDeletes[] = $rec;
                        } else {
                            $fStats['mismatches']++;
                            $mismatches[] = $rec;
                        }
                    }

                    $facResult[] = array_merge($fac['meta'], [
                        'stats'               => $fStats,
                        'mismatch_records'    => $mismatches,
                        'soft_delete_records' => $softDeletes,
                    ]);

                    foreach (array_keys($cStats) as $k) {
                        $sStats[$k] += $fStats[$k];
                    }
                }

                $subResult[] = ['subcounty' => $sub, 'stats' => $sStats, 'facilities' => $facResult];
                foreach (array_keys($cStats) as $k) {
                    $cStats[$k] += $sStats[$k];
                }
            }

            $countyResult[] = ['county' => $county, 'stats' => $cStats, 'subcounties' => $subResult];
        }

        return response()->json(['counties' => $countyResult, 'loaded_at' => now()->toIso8601String()]);
    }

    // -----------------------------------------------------------------------
    // Bulk apply fixes
    // -----------------------------------------------------------------------

    public function bulkApplyFixes(Request $request): JsonResponse
    {
        set_time_limit(300);

        $request->validate([
            'fixes'              => 'array',
            'fixes.*.uuid'         => 'required_with:fixes|string|max:128',
            'fixes.*.target_stage' => 'required_with:fixes|string|max:40',
            'deletes'            => 'array',
            'deletes.*'          => 'string|max:128',
        ]);

        $fixes   = $request->input('fixes', []);
        $deletes = $request->input('deletes', []);
        $now     = now();
        $userId  = auth()->id();
        $fixed   = 0;
        $deleted = 0;
        $errors  = [];

        foreach ($fixes as $fix) {
            $result = $this->applyStageFixRecord($fix['uuid'], $fix['target_stage']);
            if ($result['ok']) {
                $fixed++;
                DB::table('submission_stage_audit_log')->insert([
                    'uuid'          => $fix['uuid'],
                    'applied_stage' => $fix['target_stage'],
                    'action'        => 'stage_fix',
                    'applied_by'    => $userId,
                    'applied_at'    => $now,
                ]);
            } else {
                $errors[] = $result['error'];
            }
        }

        foreach ($deletes as $uuid) {
            $result = $this->applySoftDeleteRecord($uuid);
            if ($result['ok']) {
                $deleted++;
                DB::table('submission_stage_audit_log')->insert([
                    'uuid'       => $uuid,
                    'action'     => 'soft_delete',
                    'applied_by' => $userId,
                    'applied_at' => $now,
                ]);
            } else {
                $errors[] = $result['error'];
            }
        }

        Log::info('bulk_apply_fixes', ['fixed' => $fixed, 'deleted' => $deleted, 'errors' => count($errors), 'user' => $userId]);

        return response()->json(['ok' => true, 'fixed' => $fixed, 'deleted' => $deleted, 'errors' => $errors]);
    }

    // -----------------------------------------------------------------------
    // Shared helpers
    // -----------------------------------------------------------------------

    private function applyStageFixRecord(string $uuid, string $targetStage): array
    {
        try {
            $row = DB::connection('odk_central')
                ->select(
                    'SELECT sd.id, sd.xml FROM submission_defs sd
                     JOIN submissions s ON sd."submissionId" = s.id
                     WHERE s."instanceId" = ?
                     ORDER BY sd.id DESC LIMIT 1',
                    [$uuid]
                );

            if (!empty($row)) {
                $newXml = $this->rewriteStageXml($row[0]->xml, $targetStage);
                if ($newXml !== $row[0]->xml) {
                    DB::connection('odk_central')
                        ->statement('UPDATE submission_defs SET xml = ? WHERE id = ?', [$newXml, $row[0]->id]);
                }
            }

            DB::table('spi_submissions')
                ->where('submission_uuid', $uuid)
                ->update(['stage_override' => $targetStage, 'updated_at' => now()]);

            return ['ok' => true];
        } catch (\Exception $e) {
            return ['ok' => false, 'error' => "Fix failed for {$uuid}: " . $e->getMessage()];
        }
    }

    private function applySoftDeleteRecord(string $uuid): array
    {
        try {
            DB::connection('odk_central')
                ->statement('UPDATE submissions SET "deletedAt" = NOW() WHERE "instanceId" = ? AND "deletedAt" IS NULL', [$uuid]);

            DB::table('spi_submissions')
                ->where('submission_uuid', $uuid)
                ->update(['is_soft_deleted' => true, 'updated_at' => now()]);

            return ['ok' => true];
        } catch (\Exception $e) {
            return ['ok' => false, 'error' => "Delete failed for {$uuid}: " . $e->getMessage()];
        }
    }

    private function deriveReportedStage(object $row): string
    {
        $bf = $row->reported_baselinefollowup ?? '';
        if ($bf === 'Baseline') return 'baseline';
        if ($bf === 'followup') return $row->reported_followup ?: 'follow1';
        if ($bf === 'other') return 'other';
        return (string) $bf;
    }

    private function rewriteStageXml(string $xml, string $targetStage): string
    {
        if ($targetStage === 'baseline') {
            $xml = preg_replace(
                '/<baselinefollowup>.*?<\/baselinefollowup>/s',
                '<baselinefollowup>Baseline</baselinefollowup>',
                $xml
            );
            $xml = preg_replace('/<followup>.*?<\/followup>\n?/s', '', $xml);
            $xml = preg_replace('/<otherFollowup>.*?<\/otherFollowup>\n?/s', '', $xml);
        } elseif (preg_match('/^follow(\d+)$/', $targetStage, $m)) {
            $n = $m[1];
            $xml = preg_replace(
                '/<baselinefollowup>.*?<\/baselinefollowup>/s',
                '<baselinefollowup>followup</baselinefollowup>',
                $xml
            );
            if (preg_match('/<followup>.*?<\/followup>/s', $xml)) {
                $xml = preg_replace(
                    '/<followup>.*?<\/followup>/s',
                    "<followup>follow{$n}</followup>",
                    $xml
                );
            } else {
                // Insert <followup> immediately after <baselinefollowup>
                $xml = preg_replace(
                    '/(<baselinefollowup>followup<\/baselinefollowup>)/',
                    "$1\n    <followup>follow{$n}</followup>",
                    $xml
                );
            }
            $xml = preg_replace('/<otherFollowup>.*?<\/otherFollowup>\n?/s', '', $xml);
        }

        return $xml;
    }
}
