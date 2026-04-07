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
        Schema::create('order_status_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('changed_by');
            $table->unsignedBigInteger('order_id');
            $table->enum('status', ['pending', 'paid', 'completed', 'ready_for_pickup', 'delivered', 'process', 'canceled']);
            $table->text('note')->nullable();

            $table->foreign('changed_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_status_logs');
    }
};
