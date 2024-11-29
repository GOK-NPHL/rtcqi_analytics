<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ApprovedCerts extends Model
{
    protected $table = 'approved_certificates';
    protected $fillable = ['cert_id', 'facility', 'site', 'approved_by'];
    // public $timestamps = false;
}
