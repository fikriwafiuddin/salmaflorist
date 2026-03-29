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
            $table->enum("status", ["pending", "paid", "completed", "process", "canceled"]);
            $table->boolean("is_paid")->default(false);
            $table->enum("shipping_method", ["delivery", "pickup"]);
            $table->dateTime("schedule")->nullable();
            $table->unsignedBigInteger('address_id')->nullable();
            $table->integer("shipping_cost")->default(0);
            $table->integer('total_amount');
            $table->unsignedBigInteger('courier_service_id')->nullable();
            $table->text("notes")->nullable();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('address_id')->references('id')->on('addresses')->onDelete('cascade');
            $table->foreign('courier_service_id')->references('id')->on('courier_services')->onDelete('cascade');
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
