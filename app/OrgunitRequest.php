<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class OrgunitRequest extends Model
{
    protected $fillable = ['requester_id', 'parent_orgunit_id', 'orgunit_name', 'status'];
}
