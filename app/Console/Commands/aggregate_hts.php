<?php

namespace App\Console\Commands;

use App\Services\ODkHTSDataAggregator;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class aggregate_hts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'aggregate_hts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test hts data aggregation';

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
        $orgs = [
            0 => '033520cc-d12c-4854-92cc-f997271d0267',
           // 1 => '26fe2e9e-2236-4efc-aeb7-f1d18d609c0b',
        ];
        $progs = [
            0 => 'OPD',
            // 1 => 'VCT',
        ];
        $startDate = "2021-3-01";
        $endDate = "2021-3-31";
        $odkObj = new ODkHTSDataAggregator;
        $response = $odkObj->getData($orgs, $progs, $startDate, $endDate);

        Log::info($response);
    }
}
