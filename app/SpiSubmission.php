<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class SpiSubmission extends Model
{
    protected $table = 'spi_submissions';

    protected $fillable = [
        'submission_uuid',
        'project_id',
        'form_id',
        'submission_date',
        'mysites_county',
        'mysites_subcounty',
        'mysites_facility',
        'mysites_mfl',
        'mysites_site',
        'reported_baselinefollowup',
        'reported_followup',
        'reported_other_followup',
        'computed_stage',
        'stage_override',
        'overall_percentage',
        'score_s1',
        'score_s2',
        'score_s3',
        'score_s4',
        'score_s5',
        'score_s6',
        'score_s7',
        'score_s8',
        'is_soft_deleted',
        'raw_data',
        'ingested_at',
    ];

    protected $casts = [
        'raw_data'        => 'array',
        'is_soft_deleted' => 'boolean',
        'submission_date' => 'date',
        'ingested_at'     => 'datetime',
    ];

    // The effective stage to use in reports: manual override wins over computed
    public function getEffectiveStageAttribute(): ?string
    {
        return $this->stage_override ?? $this->computed_stage;
    }
}
