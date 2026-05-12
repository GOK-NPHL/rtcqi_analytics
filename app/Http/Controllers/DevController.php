<?php

namespace App\Http\Controllers;

use App\Services\ODKDataAggregator;
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
