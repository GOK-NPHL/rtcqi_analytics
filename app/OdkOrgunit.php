<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class OdkOrgunit extends Model
{
    protected $casts = [
        'updated_at' => 'datetime:Y-m-d',
    ];
    protected $table = 'odkorgunit';
    protected $fillable = ['org_unit_id', 'odkorgunit', 'level', 'parent_id', 'odk_unit_name'];

    public function users()
    {
        return $this->belongsToMany('App\User');
    }
}
