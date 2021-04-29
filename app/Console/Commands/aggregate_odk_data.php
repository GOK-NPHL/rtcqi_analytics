<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

use App\Services\ODKDataAggregator;

class aggregate_odk_data extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'aggregate_odk_data';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run odk aggregate data function';

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
        $odkObj = new ODKDataAggregator;
        $res=$odkObj->getData(null,null,null,null);
    }
}
