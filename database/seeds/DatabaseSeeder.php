<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call([
            AuthoritiesSeed::class,
            UserSeed::class,
            Role::class,
            PermissionRoleMaps::class,
        ]);
    }
}
