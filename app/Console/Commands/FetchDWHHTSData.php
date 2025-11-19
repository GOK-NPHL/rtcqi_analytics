<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\DWHHTSDataFetcher;

class FetchDWHHTSData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'dwh:pull';

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
        $dwh = new DWHHTSDataFetcher;
        $dwh->fetchData();
    }
}
