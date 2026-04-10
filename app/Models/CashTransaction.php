<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Order;

class CashTransaction extends Model
{
    protected $fillable = [
        'order_id',
        'batch_stock_id',
        'type',
        'category',
        'payment_method',
        'amount',
        'transaction_date',
        'notes'
    ];

    public function batchStock()
    {
        return $this->belongsTo(BatchStock::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
