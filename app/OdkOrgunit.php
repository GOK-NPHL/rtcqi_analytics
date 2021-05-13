<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class OdkOrgunit extends Model
{
    protected $table = 'odk_orgunit_maps';
    protected $fillable = ['org_unit_id', 'odk_orgunit_maps', 'level', 'parent_id', 'odk_unit_name'];
}
