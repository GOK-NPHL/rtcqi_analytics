<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDwhDataPullJobsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('dwh_data_pull_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('period')->unique();
            $table->enum('status', ['pending', 'running', 'completed', 'failed'])->default('pending');
            $table->longText('data')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('dwh_data_pull_jobs');
    }
}
