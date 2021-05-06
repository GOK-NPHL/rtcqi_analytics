<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $hidden = ['created_at'];
    protected $fillable = ['name'];
    protected $casts = [
        'updated_at' => 'datetime:Y-m-d H:i:s',
    ];

    public function authorities()
    {
        return $this->belongsToMany('App\Authority');
    }

    public function editor()
    {
        return $this->belongsTo('App\User','editor_id');
    }

    public function users()
    {
        return $this->belongsToMany('App\User');
    }
}
