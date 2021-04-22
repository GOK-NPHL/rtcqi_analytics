<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ODKDataFetcher;

class fetchODKData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fetchodkdata';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch ODK central Data';

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
        $odkObj = new ODKDataFetcher;
        $res=$odkObj->fetchData();
        // error_log($res);
    }
}
