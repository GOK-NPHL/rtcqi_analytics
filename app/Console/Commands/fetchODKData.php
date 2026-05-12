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
    protected $signature = 'fetchodkdata
                            {--county= : County/project name to fetch (case-insensitive, partial match)}
                            {--checklist= : Checklist type to fetch: spi or hts (default: all)}
                            {--force : Download submissions regardless of whether new ones are detected}
                            {--list : List available counties/projects and exit}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch ODK central Data (optionally filtered by county/project and/or checklist type)';

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

        if ($this->option('list')) {
            $projects = $odkObj->listProjects();
            if (empty($projects)) {
                $this->warn('No projects found.');
                return;
            }
            $this->table(['ID', 'Name'], array_map(fn($p) => [$p['id'], $p['name']], $projects));
            return;
        }

        $county    = $this->option('county') ?: null;
        $checklist = $this->option('checklist') ? strtolower($this->option('checklist')) : null;
        $force     = (bool) $this->option('force');

        if ($checklist !== null && !in_array($checklist, ['spi', 'hts'])) {
            $this->error("Invalid checklist \"{$checklist}\". Allowed values: spi, hts");
            return 1;
        }

        $parts = array_filter([
            $county    ? "county \"{$county}\""         : null,
            $checklist ? "checklist \"{$checklist}\""   : null,
            $force     ? 'force mode'                   : null,
        ]);
        $this->info('Fetching ODK data' . ($parts ? ' for ' . implode(', ', $parts) : ' for all counties/checklists'));

        $odkObj->fetchData($county, $checklist, $force);
    }
}
