<?php

namespace App\Console\Commands;

use App\FormSubmissions;
use App\Services\ODKDataAggregator;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use League\Csv\Reader;
use League\Csv\Statement;

class IngestSpiSubmissions extends Command
{
    protected $signature = 'spi:ingest
        {--form_id= : Limit ingest to a specific form_id (e.g. spi_checklist_baringo)}
        {--dry-run  : Report counts without writing to the database}';

    protected $description = 'Ingest SPI submission CSVs from disk into the spi_submissions table';

    private ODKDataAggregator $aggregator;

    // Section field maps mirror ODKDataAggregator aggregate* methods exactly
    private const SECTION_FIELDS = [
        's1' => [
            'Section-Section1-providers_undergone_training',
            'Section-Section1-training_certificates_available',
            'Section-Section1-refresher_training',
        ],
        's2' => [
            'Section-Section2-attended_support_supervision',
            'Section-Section2-provider_self_assessment',
            'Section-Section2-client_satisfaction_survey_done',
            'Section-Section2-observed_practice',
            'Section-Section2-scmlcsupport',
            'Section-Section2-cmlcsupport',
        ],
        's3' => [
            'Section-Section3-HIV_testing_area',
            'Section-Section3-sufficient_space',
            'Section-Section3-confidentiality',
            'Section-Section3-clean_testing_area',
            'Section-Section3-sufficient_lighting',
            'Section-Section3-secure_storage',
        ],
        's4' => [
            'Section-Section4-running_water',
            'Section-Section4-soap',
            'Section-Section4-wastesegregationfacility',
            'Section-Section4-segregationonsite',
            'Section-Section4-pep_protocols',
            'Section-Section4-pep_protocols_followed',
        ],
        's5' => [
            'Section-Section5-job_aides_infectious_waste',
            'Section-Section5-bloodspills',
            'Section-Section5-job_aides_nationalalgo',
            'Section-Duokit_used',
            'Section-subsec5-Duokit_jobaide',
            'Section-subsec5-Determine_jobaide',
            'Section-subsec5-FirstResponce_jobaide',
            'Section-subsec5-expirationdate',
            'Section-subsec5-testkitskeptwell',
            'Section-subsec5-newconsignmentQC',
            'Section-subsec5-newkitlotQC',
            'Section-subsec5-monthlyQC',
            'Section-subsec5-qc_recorded',
            'Section-subsec5-stepstocorrect_invalid_QC',
        ],
        's6' => [
            'Section-Section6-hts_algorithmfollowed',
            'Section-Section6-duokit_algo_followed',
            'Section-Section6-samplecollection',
            'Section-Section6-Determine_algo',
            'Section-Section6-Duokit_procedure',
            'Section-Section6-FirstResponce_algo',
            'Section-Section6-timersavailable',
            'Section-Section6-timersused',
            'Section-Section6-resultsinterpreted',
            'Section-Section6-retesting',
            'Section-Section6-retestingrecord',
        ],
        's7' => [
            'Section-Section7-Qc_records_review',
            'Section-Section7-registeravailable',
            'Section-Section7-qualityelements',
            'Section-Section7-elementscapturedcorrectly',
            'Section-Section7-summaryavailable',
            'Section-Section7-invalid_results',
            'Section-Section7-invalid_repeated',
            'Section-Section7-client_docs_stored',
            'Section-Section7-secure_doc_storage',
            'Section-Section7-properly_labelled',
        ],
        's8' => [
            'Section-Section8-allprovidersenrolled',
            'Section-Section8-providerstestPT',
            'Section-Section8-resultssubmittedonline',
            'Section-Section8-feedbackreceived',
            'Section-Section8-feedbackreviewed',
            'Section-Section8-feedbackreportfilled',
            'Section-Section8-providerscorrectiveaction',
            'Section-Section8-technicalsupervision',
            'Section-Section8-retrainingdone',
            'Section-Section8-feedbackdocumented',
        ],
    ];

    public function __construct()
    {
        parent::__construct();
        $this->aggregator = new ODKDataAggregator();
    }

    public function handle(): int
    {
        $dryRun      = $this->option('dry-run');
        $filterForm  = $this->option('form_id');

        $query = FormSubmissions::select('project_id', 'form_id')
            ->where('form_id', 'like', 'spi%')
            ->distinct();

        if ($filterForm) {
            $query->where('form_id', $filterForm);
        }

        $mappings = $query->orderBy('form_id')->get();

        if ($mappings->isEmpty()) {
            $this->warn('No SPI form mappings found in form_submissions.');
            return 1;
        }

        $this->info(($dryRun ? '[DRY RUN] ' : '') . "Processing {$mappings->count()} distinct SPI form(s).");

        $totalInserted = 0;
        $totalUpdated  = 0;
        $totalSkipped  = 0;

        foreach ($mappings as $mapping) {
            $filePath = "submissions/{$mapping->project_id}_{$mapping->form_id}_submissions.csv";

            if (!Storage::exists($filePath)) {
                $this->warn("  Missing file, skipping: {$filePath}");
                continue;
            }

            $this->line("  {$filePath}");

            try {
                $records = $this->loadCsv(Storage::path($filePath));
            } catch (Exception $e) {
                $this->error("  CSV read error: " . $e->getMessage());
                Log::error('spi:ingest csv_read_error', ['file' => $filePath, 'error' => $e->getMessage()]);
                continue;
            }

            if (empty($records)) {
                $this->warn("  Empty CSV, skipping.");
                continue;
            }

            // Compute position-based timeline stages for the whole county batch at once
            $records = $this->aggregator->computeTimelineStages($records);

            [$ins, $upd, $skp] = $dryRun
                ? $this->countChanges($records)
                : $this->upsertRecords($records, $mapping->project_id, $mapping->form_id);

            $this->line("    inserted={$ins}  updated={$upd}  unchanged={$skp}");

            $totalInserted += $ins;
            $totalUpdated  += $upd;
            $totalSkipped  += $skp;
        }

        $this->info("Finished. Total — inserted={$totalInserted}  updated={$totalUpdated}  unchanged={$totalSkipped}");
        return 0;
    }

    // -----------------------------------------------------------------------
    // Core upsert logic
    // -----------------------------------------------------------------------

    private function upsertRecords(array $records, int $projectId, string $formId): array
    {
        $now      = now();
        $inserted = 0;
        $updated  = 0;
        $skipped  = 0;

        // Collect all UUIDs in this batch
        $uuids = array_values(array_filter(array_column($records, 'KEY')));
        if (empty($uuids)) {
            return [0, 0, count($records)];
        }

        // One query to fetch protected fields for existing rows
        $existing = DB::table('spi_submissions')
            ->whereIn('submission_uuid', $uuids)
            ->select('submission_uuid', 'stage_override', 'is_soft_deleted')
            ->get()
            ->keyBy('submission_uuid');

        foreach ($records as $record) {
            $uuid = $record['KEY'] ?? null;
            if (empty($uuid)) {
                $skipped++;
                continue;
            }

            $data = $this->buildRow($record, $projectId, $formId, $now);

            if (!$existing->has($uuid)) {
                DB::table('spi_submissions')->insert(array_merge($data, [
                    'submission_uuid' => $uuid,
                    'stage_override'  => null,
                    'is_soft_deleted' => false,
                    'created_at'      => $now,
                    'updated_at'      => $now,
                ]));
                $inserted++;
            } else {
                // stage_override and is_soft_deleted are NEVER overwritten by re-ingest
                DB::table('spi_submissions')
                    ->where('submission_uuid', $uuid)
                    ->update(array_merge($data, ['updated_at' => $now]));
                $updated++;
            }
        }

        return [$inserted, $updated, $skipped];
    }

    private function countChanges(array $records): array
    {
        $uuids = array_values(array_filter(array_column($records, 'KEY')));
        if (empty($uuids)) {
            return [0, 0, count($records)];
        }
        $existingCount = DB::table('spi_submissions')
            ->whereIn('submission_uuid', $uuids)
            ->count();
        $newCount = count($uuids) - $existingCount;
        return [$newCount, $existingCount, count($records) - count($uuids)];
    }

    // -----------------------------------------------------------------------
    // Row builder
    // -----------------------------------------------------------------------

    private function buildRow(array $record, int $projectId, string $formId, $now): array
    {
        $bf = $record['baselinefollowup'] ?? '';
        $mfl = explode('_', $record['mysites_facility'] ?? '')[0];

        $submissionDate = null;
        $raw = $record['start'] ?? '';
        if ($raw) {
            $ts = strtotime($raw);
            if ($ts !== false) {
                $submissionDate = date('Y-m-d', $ts);
            }
        }

        return [
            'project_id'                => $projectId,
            'form_id'                   => $formId,
            'submission_date'           => $submissionDate,
            'mysites_county'            => strtolower(trim($record['mysites_county'] ?? '')),
            'mysites_subcounty'         => strtolower(trim($record['mysites_subcounty'] ?? '')),
            'mysites_facility'          => trim($record['mysites_facility'] ?? ''),
            'mysites_mfl'               => $mfl,
            'mysites_site'              => trim($record['mysites'] ?? ''),
            'reported_baselinefollowup' => $bf,
            'reported_followup'         => $record['followup'] ?? '',
            'reported_other_followup'   => $record['otherFollowup'] ?? '',
            'computed_stage'            => $record['computed_stage'] ?? null,
            'overall_percentage'        => is_numeric($record['Section-sec91percentage'] ?? null)
                                            ? (float) $record['Section-sec91percentage']
                                            : null,
            'score_s1'                  => $this->sectionScore($record, 's1'),
            'score_s2'                  => $this->sectionScore($record, 's2'),
            'score_s3'                  => $this->sectionScore($record, 's3'),
            'score_s4'                  => $this->sectionScore($record, 's4'),
            'score_s5'                  => $this->sectionScore($record, 's5'),
            'score_s6'                  => $this->sectionScore($record, 's6'),
            'score_s7'                  => $this->sectionScore($record, 's7'),
            'score_s8'                  => $this->sectionScore($record, 's8'),
            'raw_data'                  => json_encode($record),
            'ingested_at'               => $now,
        ];
    }

    private function sectionScore(array $record, string $section): int
    {
        $score = 0;
        foreach (self::SECTION_FIELDS[$section] ?? [] as $field) {
            $val = $record[$field] ?? 0;
            $score += is_numeric($val) ? (int) $val : 0;
        }
        return $score;
    }

    // -----------------------------------------------------------------------
    // CSV loader
    // -----------------------------------------------------------------------

    private function loadCsv(string $absolutePath): array
    {
        $csv = Reader::createFromPath($absolutePath, 'r');
        $csv->setHeaderOffset(0);
        return iterator_to_array(Statement::create()->process($csv), true);
    }
}
