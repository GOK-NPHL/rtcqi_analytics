<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class PermissionRoleMap extends Model
{
    protected $table = 'authority_role';
    protected $fillable = ['created_at', 'updated_at', 'authority_id', 'role_id'];
}
