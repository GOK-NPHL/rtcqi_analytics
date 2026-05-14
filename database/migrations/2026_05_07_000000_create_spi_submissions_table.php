<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSpiSubmissionsTable extends Migration
{
    public function up()
    {
        Schema::create('spi_submissions', function (Blueprint $table) {
            $table->id();

            // ODK identity — natural unique key; enables safe upserts on re-ingest
            $table->string('submission_uuid', 128)->unique();
            $table->unsignedInteger('project_id');
            $table->string('form_id', 128);

            // Org unit hierarchy (normalised at ingest time)
            $table->timestamp('submission_date')->nullable();
            $table->string('mysites_county', 100)->nullable();
            $table->string('mysites_subcounty', 100)->nullable();
            $table->string('mysites_facility', 255)->nullable();
            $table->string('mysites_mfl', 20)->nullable();   // extracted prefix, e.g. "14607"
            $table->string('mysites_site', 100)->nullable();

            // Reported timeline (as entered in ODK form)
            $table->string('reported_baselinefollowup', 40)->nullable();
            $table->string('reported_followup', 40)->nullable();
            $table->string('reported_other_followup', 100)->nullable();

            // Computed timeline stage (set at ingest; position-based across same site visits)
            $table->string('computed_stage', 20)->nullable();

            // Manual correction applied via timeline_check tool; never overwritten by re-ingest
            $table->string('stage_override', 20)->nullable();

            // Pre-computed section raw scores (stored to allow SQL aggregation later)
            $table->decimal('overall_percentage', 6, 2)->nullable();
            $table->unsignedTinyInteger('score_s1')->nullable(); // personnel_training_and_certification (max 3)
            $table->unsignedTinyInteger('score_s2')->nullable(); // QA_counselling (max 6)
            $table->unsignedTinyInteger('score_s3')->nullable(); // physical_facility (max 6)
            $table->unsignedTinyInteger('score_s4')->nullable(); // safety (max 6)
            $table->unsignedTinyInteger('score_s5')->nullable(); // pre_testing_phase (max 14)
            $table->unsignedTinyInteger('score_s6')->nullable(); // testing_phase (max 11)
            $table->unsignedTinyInteger('score_s7')->nullable(); // post_testing_phase (max 10)
            $table->unsignedTinyInteger('score_s8')->nullable(); // external_quality_assessment (max 10)

            // Soft-delete flag mirrors ODK Central deletedAt; never reset by re-ingest
            $table->boolean('is_soft_deleted')->default(false);

            // Full CSV row as JSON — allows forward-compat without schema changes when form evolves
            $table->json('raw_data')->nullable();

            $table->timestamp('ingested_at')->nullable();
            $table->timestamps();

            $table->index(['project_id', 'form_id']);
            $table->index(['mysites_mfl', 'submission_date']);
            $table->index(['mysites_county', 'submission_date']);
            $table->index(['computed_stage', 'is_soft_deleted']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('spi_submissions');
    }
}
