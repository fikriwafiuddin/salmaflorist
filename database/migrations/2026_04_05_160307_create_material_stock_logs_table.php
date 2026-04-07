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
        Schema::create('material_stock_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('material_id');
            $table->unsignedBigInteger('material_stock_id');
            $table->unsignedBigInteger('created_by');
            $table->integer('quantity');
            $table->enum('type', ['in', 'out']);
            $table->text('notes')->nullable();

            $table->foreign('material_id')->references('id')->on('materials')->onDelete('cascade');
            $table->foreign('material_stock_id')->references('id')->on('material_stocks')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('material_stock_logs');
    }
};
