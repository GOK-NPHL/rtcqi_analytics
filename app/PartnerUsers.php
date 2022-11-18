<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class PartnerUsers extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'partner_id', 'user_id', 'created_at', 'updated_at'
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        // 'created_at', 'updated_at',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the partner for the user.
     */
    public function partner()
    {
        return $this->belongsTo('App\Partner', 'partner_id');
    }

    /**
     * Get the user for the partner.
     */
    public function user()
    {
        return $this->belongsTo('App\User', 'user_id');
    }
}
