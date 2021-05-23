<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrgunitLevelMapTabe extends Migration
{


/**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {

        Schema::create('orgunit_level_maps', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->string("sheet");
            $table->string("column");
            $table->integer("level");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('orgunit_level_maps');
    }

}
