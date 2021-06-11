<?php

use Illuminate\Database\Seeder;
use App\Role;


class Roles extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $data = array(
            array('id' => 1, 'name' => 'super admin', 'editor_id' => 1, 'created_at' => new \dateTime, 'updated_at' => new \dateTime),
        );
        
        $authObj = new Role();
        Role::query()->truncate();
        $authObj->insert($data);
        // $authObj->save();
    }
}
