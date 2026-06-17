<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        //
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // Pull new CSVs from ODK Central, then immediately ingest into spi_submissions
        $schedule->command('fetchodkdata')->dailyAt('01:00');
        $schedule->command('spi:ingest')->dailyAt('01:30');

        // DWH data is aggregated monthly; pull on the 19th to allow upstream processing time.
        // Run dwh:pull manually (with --period) for historical or ad-hoc backfills.
        $schedule->command('dwh:pull')->monthlyOn(19, '02:00');

        // Re-warm the nationwide logbook cache every night so the first user of each day
        // hits Redis instead of computing 500K+ rows. Runs daily because the 23h TTL
        // expires overnight even when no new data was pulled.
        $schedule->command('hts:warm-cache')->dailyAt('02:30');
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
