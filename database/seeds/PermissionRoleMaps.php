<?php

use Illuminate\Database\Seeder;
use App\PermissionRoleMap;

class PermissionRoleMaps extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $data = array(
            array('role_id' => 1, 'authority_id' => 1,  'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 2,  'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 3,  'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 4,  'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 5,  'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 6,  'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 7,  'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 8,  'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 9,  'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 10,  'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 11,  'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 12,  'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 13,  'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 14,  'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 15,  'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 16,  'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 17,  'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 18,  'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 19,  'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 20,  'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),

        );

        $authObj = new PermissionRoleMap();
        PermissionRoleMap::query()->truncate();
        $authObj->insert($data);
        // $authObj->save();
    }
}
