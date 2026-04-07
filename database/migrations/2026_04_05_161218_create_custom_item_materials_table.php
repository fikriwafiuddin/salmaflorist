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
        Schema::create('custom_item_materials', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('custom_item_detail_id');
            $table->unsignedBigInteger('material_id');
            $table->integer('quantity');

            $table->foreign('custom_item_detail_id')->references('id')->on('custom_item_details')->onDelete('cascade');
            $table->foreign('material_id')->references('id')->on('materials')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('custom_item_materials');
    }
};
