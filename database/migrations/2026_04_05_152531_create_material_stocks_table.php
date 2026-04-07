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
        Schema::create('material_stocks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('batch_stock_id');
            $table->unsignedBigInteger('material_id');
            $table->boolean('is_active')->default(false);
            $table->integer('initial_quantity');
            $table->integer('remaining_quantity');
            $table->integer('price');
            $table->integer('subtotal');
            $table->dateTime('expired_date')->nullable();

            $table->foreign('batch_stock_id')->references('id')->on('batch_stocks')->onDelete('cascade');
            $table->foreign('material_id')->references('id')->on('materials')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('material_stocks');
    }
};
