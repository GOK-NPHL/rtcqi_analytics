<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSubmissionStageAuditLogTable extends Migration
{
    public function up()
    {
        Schema::create('submission_stage_audit_log', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('uuid', 64)->index();
            $table->string('mfl', 20)->nullable();
            $table->string('mysites_facility')->nullable();
            $table->string('mysites', 60)->nullable();
            $table->string('previous_stage', 40)->nullable();
            $table->string('applied_stage', 40)->nullable();  // null when action = soft_delete
            $table->string('action', 20)->default('stage_fix'); // stage_fix | soft_delete
            $table->unsignedBigInteger('applied_by')->nullable();
            $table->foreign('applied_by')->references('id')->on('users')->nullOnDelete();
            $table->timestamp('applied_at')->useCurrent();
        });
    }

    public function down()
    {
        Schema::dropIfExists('submission_stage_audit_log');
    }
}
