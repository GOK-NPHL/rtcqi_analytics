<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $hidden = ['updated_at'];
    protected $fillable = ['name'];

    public function authorities()
    {
        return $this->belongsToMany('App\Authority');
    }

    public function editor()
    {
        return $this->belongsTo('App\User','editor_id');
    }
}
