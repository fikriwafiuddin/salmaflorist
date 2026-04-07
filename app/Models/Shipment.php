<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Shipment extends Model
{
    protected $fillable = [
        'order_id',
        'tracking_number',
        'courier_name',
        'courier_code',
        'courier_service',
        'etd'
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
