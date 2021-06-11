<?php

use Illuminate\Database\Seeder;
use App\Authority;
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
            array('role_id' => 1, 'authority_id' => 1, 'editor_id' => 1, 'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 2, 'editor_id' => 1, 'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 3, 'editor_id' => 1, 'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 4, 'editor_id' => 1, 'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 5, 'editor_id' => 1, 'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 6, 'editor_id' => 1, 'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 7, 'editor_id' => 1, 'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 8, 'editor_id' => 1, 'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 9, 'editor_id' => 1, 'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 10, 'editor_id' => 1, 'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 11, 'editor_id' => 1, 'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 12, 'editor_id' => 1, 'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 13, 'editor_id' => 1, 'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 14, 'editor_id' => 1, 'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 15, 'editor_id' => 1, 'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 16, 'editor_id' => 1, 'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 17, 'editor_id' => 1, 'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 18, 'editor_id' => 1, 'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 19, 'editor_id' => 1, 'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),
            array('role_id' => 1, 'authority_id' => 20, 'editor_id' => 1, 'created_at' => new \dateTime, 'updated_at' => new \dateTime, 'role_id' => 1),

        );

        $authObj = new PermissionRoleMap();
        PermissionRoleMap::query()->truncate();
        $authObj->insert($data);
        // $authObj->save();
    }
}
