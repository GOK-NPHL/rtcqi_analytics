<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class OdkOrgunit extends Model
{
    protected $casts = [
        'updated_at' => 'datetime:Y-m-d',
    ];
    protected $table = 'odk_orgunit_maps';
    protected $fillable = ['org_unit_id', 'odk_orgunit_maps', 'level', 'parent_id', 'odk_unit_name'];
}
