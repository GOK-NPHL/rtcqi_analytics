<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\DWHHTSDataFetcher;
use Illuminate\Support\Facades\Log;

class FetchDWHHTSData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'dwh:pull {--show-periods} {--period= : The period for which to pull data (e.g., 2025-01, 2025-02)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Pull data from DWH';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $args = $this->options();
        if($args['show-periods']) {
            $dwh = new DWHHTSDataFetcher;
            $periods = $dwh->getAvailablePeriods();
            // table format, latest 10
            $this->table(['Period'], array_map(fn($p) => [
                date('Y-m', strtotime($p))
            ], array_slice($periods, 0, 10)));
            return 0;
        }
        $period = $args['period'] ?? null;
        // if period is not a valid date, (yyyy-mm), show error and exit
        if($period && !preg_match('/^\d{4}-\d{2}$/', $period)) {
            $this->error('Invalid period format. Use yyyy-mm (e.g., 2025-01)');
            return 1;
        }
        $dwh = new DWHHTSDataFetcher($period);
        $dwh->fetchData($period);
    }
}
