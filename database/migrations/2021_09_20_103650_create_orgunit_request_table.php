<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrgunitRequestTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('orgunit_request', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->integer("requester_id");
            $table->uuid('parent_orgunit_id');
            $table->string("orgunit_name");
            $table->string("status"); //pending, rejected, approved, 
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('orgunit_request');
    }
}
