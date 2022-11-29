<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Partner extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'description',
        'url',
        'location',
        'active',
        'start_date',
        'end_date',
        'email',
        'phone',
        'address',

        'level',
        'parent_partner_id',

        'created_at',
        'updated_at'
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
        'active' => 'boolean',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the users for the partner (mapped on the partner_users table).
     */
    public function users()
    {
        return $this->belongsToMany('App\User', 'partner_users', 'partner_id', 'user_id');
    }

    /**
     * Get the org_units for the partner (mapped on the partner_org_units table).
     */
    public function org_units()
    {
        return $this->belongsToMany('App\OdkOrgunit', 'partner_org_units', 'partner_id', 'org_unit_id');
    }

    /**
     * Get the parent partner for the partner.
     */
    public function parent()
    {
        if ($this->parent) {
            return $this->belongsTo('App\Partner', 'parent_partner_id');
        } else {
            return null;
        }
    }
}
