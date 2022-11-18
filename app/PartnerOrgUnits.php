<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class PartnerOrgUnits extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'partner_id', 'org_unit_id', 'created_at', 'updated_at'
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
     * Get the partner for the org_unit.
     */
    public function partner()
    {
        return $this->belongsTo('App\Partner', 'partner_id');
    }

    /**
     * Get the org_unit for the partner.
     */
    public function org_unit()
    {
        return $this->belongsTo('App\OdkOrgunit', 'org_unit_id', 'org_unit_id');
    }
}
