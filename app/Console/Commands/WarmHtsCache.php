<?php

namespace App\Console\Commands;

use App\Http\Controllers\LogbookReportController;
use App\Services\DWHHTSDataAggregator;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class WarmHtsCache extends Command
{
    protected $signature   = 'hts:warm-cache';
    protected $description = 'Pre-warm Redis cache for the nationwide HTS logbook report (runs after dwh:pull)';

    // Nationwide Kenya org unit (level 1, org_unit_id = "0")
    private const NATIONWIDE_ORG = '0';

    public function handle(): int
    {
        $this->info('Warming HTS cache...');
        $start = microtime(true);

        $this->warmDwhData();
        $this->warmSummaryLinelist();

        $elapsed = round(microtime(true) - $start);
        $this->info("HTS cache warming complete in {$elapsed}s.");
        return 0;
    }

    private function warmDwhData(): void
    {
        $path   = 'api/odk_hts_data';
        $params = [
            'orgUnitIds' => [self::NATIONWIDE_ORG],
            'siteType'   => [],
            'startDate'  => '',
            'endDate'    => '',
        ];
        $cacheId = LogbookReportController::buildCacheKey('POST', $path, $params);

        try {
            $this->line("  Computing getDwhData...");
            $t = microtime(true);

            $dwh    = new DWHHTSDataAggregator;
            $result = $dwh->getData(
                [self::NATIONWIDE_ORG],
                null,  // no programme filter
                null,  // use default date window
                null
            );

            $elapsed = round(microtime(true) - $t);

            if ($result !== null) {
                Cache::put($cacheId, $result, now()->addHours(23));
                $this->info("  getDwhData cached ({$elapsed}s) → {$cacheId}");
            } else {
                $this->warn("  getDwhData returned null — not cached.");
            }
        } catch (Exception $ex) {
            $this->error("  getDwhData failed: " . $ex->getMessage());
            Log::error('hts:warm-cache getDwhData: ' . $ex->getMessage());
            Log::error($ex);
        }
    }

    private function warmSummaryLinelist(): void
    {
        $path   = 'api/dwh_hts_summary_linelist';
        // Match the default page/perPage the frontend sends (page=1, perPage=50)
        $params = [
            'orgUnitIds' => [self::NATIONWIDE_ORG],
            'siteType'   => [],
            'startDate'  => '',
            'endDate'    => '',
            'page'       => 1,
            'perPage'    => 50,
        ];
        $cacheId = LogbookReportController::buildCacheKey('POST', $path, $params);

        try {
            $this->line("  Computing getDwhSummaryLinelist...");
            $t = microtime(true);

            $dwh    = new DWHHTSDataAggregator;
            $result = $dwh->getDwhSummaryLinelist(
                [self::NATIONWIDE_ORG],
                null,
                null,
                null
            );

            $elapsed = round(microtime(true) - $t);

            if ($result !== null) {
                Cache::put($cacheId, $result, now()->addHours(23));
                $this->info("  getDwhSummaryLinelist cached ({$elapsed}s) → {$cacheId}");
            } else {
                $this->warn("  getDwhSummaryLinelist returned null — not cached.");
            }
        } catch (Exception $ex) {
            $this->error("  getDwhSummaryLinelist failed: " . $ex->getMessage());
            Log::error('hts:warm-cache getDwhSummaryLinelist: ' . $ex->getMessage());
            Log::error($ex);
        }
    }
}
