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
            $table->string("customer_name", 55);
            $table->string("whatsapp_number", 20);
            $table->text("address_detail");
            $table->integer('province_id')->nullable();
            $table->string('province_name')->nullable();
            $table->integer('city_id')->nullable();
            $table->string('city_name')->nullable();
            $table->integer('district_id')->nullable();
            $table->string('district_name')->nullable();

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
