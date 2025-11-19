<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDwhHtsEncounterDataTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('dwh_hts_encounter_data', function (Blueprint $table) {
            $table->id();

            // Common identifiers
            $table->string('encounter_key', 128)->index();
            $table->string('patient_pk_hash', 128)->index();
            $table->unsignedInteger('site_code')->index();

            // Facility info
            $table->string('county')->nullable()->index();
            $table->string('sub_county')->nullable()->index();
            $table->string('facility_name')->nullable();
            $table->string('facility_level')->nullable();
            $table->string('sdp')->nullable();
            $table->string('sdp_agency')->nullable();

            // Coordinates
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            // Encounter/test details
            $table->string('emr')->nullable()->index();
            $table->date('test_date')->nullable();
            // test month
            $table->date('test_month')->nullable()->index();
            $table->unsignedBigInteger('encounter_id')->nullable();
            $table->string('entry_point')->nullable()->index();

            // Test kit info
            $table->string('test_kit_name1')->nullable();
            $table->string('test_kit_lot_number1')->nullable();
            $table->date('test_kit_expiry1')->nullable();
            $table->string('test_result1')->nullable();

            $table->string('test_kit_name2')->nullable();
            $table->string('test_kit_lot_number2')->nullable();
            $table->string('test_kit_expiry2')->nullable();
            $table->string('test_result2')->nullable();

            $table->string('test_kit_name3')->nullable();
            $table->string('test_kit_lot_number3')->nullable();
            $table->string('test_kit_expiry3')->nullable();
            $table->string('test_result3')->nullable();

            $table->string('final_test_result')->nullable()->index();

            // Misc
            $table->unsignedInteger('live_row_id')->nullable();
            $table->unsignedInteger('facility_code')->nullable();
            $table->string('facility_name_alt')->nullable();

            // Full raw JSON payload (for flexibility)
            $table->longText('raw_json')->nullable();

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
        Schema::dropIfExists('dwh_hts_encounter_data');
    }
}
