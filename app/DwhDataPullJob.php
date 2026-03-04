<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class DwhDataPullJob extends Model
{
    protected $table = 'dwh_data_pull_jobs';

    protected $fillable = [
        'period', // YYYY-MM e.g. 2020-01, 2020-02
        'status', // pending, running, completed, failed
        'data', // json (actual data)
        'meta' // json e.g. {'args': { 'period': '2026-01' }, 'currentPage': 3, 'savedRecords': 750, 'start_time': 1601010100, 'end_time': 1601020100}
    ];

    protected $casts = [
        'period' => 'string',
        'status' => 'string',
        'data' => 'array',
        'meta' => 'array',
    ];
}
