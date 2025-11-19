<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class DwhHtsEncounterData extends Model
{
    protected $fillable = [
        'encounter_key',
        'patient_pk_hash',
        'site_code',
        'county',
        'sub_county',
        'facility_name',
        'facility_level',
        'sdp',
        'sdp_agency',
        'latitude',
        'longitude',
        'emr',
        'test_date',
        'test_month',
        'encounter_id',
        'entry_point',
        'test_kit_name1',
        'test_kit_lot_number1',
        'test_kit_expiry1',
        'test_result1',
        'test_kit_name2',
        'test_kit_lot_number2',
        'test_kit_expiry2',
        'test_result2',
        'test_kit_name3',
        'test_kit_lot_number3',
        'test_kit_expiry3',
        'test_result3',
        'final_test_result',
        'live_row_id',
        'facility_code',
        'facility_name_alt',
        'raw_json',
        'meta',
    ];

    protected $casts = [
        'test_date' => 'datetime',
        'test_month' => 'date',
        'test_kit_expiry1' => 'datetime',
        'latitude' => 'float',
        'longitude' => 'float',
        'raw_json' => 'array', // auto decode/encode JSON
        'meta' => 'array', // auto decode/encode JSON
    ];
}
