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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('invoice_number', 13);
            $table->unsignedBigInteger('address_id');
            $table->enum('status', ['pending', 'paid', 'completed', 'ready_for_pickup', 'delivered', 'process', 'canceled']);
            $table->enum('shipping_method', ['delivery', 'pickup']);
            $table->enum('order_source', ['web', 'store']);
            $table->dateTime('schedule')->nullable();
            $table->integer('shipping_cost')->default(0);
            $table->integer('total_amount');
            $table->dateTime('paid_at')->nullable();
            $table->text('notes')->nullable();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('address_id')->references('id')->on('addresses')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
