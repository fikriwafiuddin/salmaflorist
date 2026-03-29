<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\OrderItem;
use App\Models\CashTransaction;
use App\Models\Address;
use App\Models\CourierService;

class Order extends Model
{
    protected $fillable = [
        "customer_name",
        "whatsapp_number",
        "address",
        "status",
        "is_paid",
        "shipping_method",
        "schedule",
        "total_amount",
        "notes",
        "user_id",
        "address_id",
        "shipping_cost",
        "courier_service_id",
        "shipping_cost"
    ];

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function cashTransaction()
    {
        return $this->hasOne(CashTransaction::class);
    }

    public function courierService()
    {
        return $this->belongsTo(CourierService::class);
    }

    public function address()
    {
        return $this->belongsTo(Address::class);
    }
}
