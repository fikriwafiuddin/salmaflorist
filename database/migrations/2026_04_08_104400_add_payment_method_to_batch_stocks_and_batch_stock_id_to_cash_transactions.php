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
        Schema::table('batch_stocks', function (Blueprint $table) {
            $table->enum('payment_method', ['cash', 'transfer', 'qris'])->after('total_amount');
        });

        Schema::table('cash_transactions', function (Blueprint $table) {
            $table->unsignedBigInteger('batch_stock_id')->nullable()->after('created_by');
            $table->foreign('batch_stock_id')->references('id')->on('batch_stocks')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cash_transactions', function (Blueprint $table) {
            $table->dropForeign(['batch_stock_id']);
            $table->dropColumn('batch_stock_id');
        });

        Schema::table('batch_stocks', function (Blueprint $table) {
            $table->dropColumn('payment_method');
        });
    }
};
