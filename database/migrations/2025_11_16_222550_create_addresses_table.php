<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("user_id")->nullable();
            $table->string("customer_name", 55);
            $table->string("whatsapp_number", 20);
            $table->text("address_detail");
            $table->integer('province_id');
            $table->integer('city_id');
            $table->integer('district_id');
            $table->string('postal_code');

            $table->foreign("user_id")->references("id")->on("users")->onDelete("cascade");
            $table->foreign("province_id")->references("id")->on("provinces");
            $table->foreign("city_id")->references("id")->on("cities");
            $table->foreign("district_id")->references("id")->on("districts");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};
