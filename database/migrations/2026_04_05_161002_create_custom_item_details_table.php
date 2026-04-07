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
        Schema::create('custom_item_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cart_item_id');
            $table->unsignedBigInteger('order_item_id');
            $table->string('name', 25);
            $table->text('description');
            $table->integer('service_fee');

            $table->foreign('cart_item_id')->references('id')->on('cart_items')->onDelete('cascade');
            $table->foreign('order_item_id')->references('id')->on('order_items')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('custom_item_details');
    }
};
