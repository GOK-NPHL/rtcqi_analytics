<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrgunitOdkMapsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('odkorgunit', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->uuid('org_unit_id');
            $table->integer("level");
            $table->uuid('parent_id');
            $table->string("odk_unit_name");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('odkorgunit');
    }
}
