<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\OrderItem;
use App\Models\CashTransaction;
use App\Models\Address;
use App\Models\CourierService;
use App\Models\User;

class Order extends Model
{
    protected $fillable = [
        "status",
        "is_paid",
        "shipping_method",
        "schedule",
        "total_amount",
        "notes",
        "user_id",
        "address_id",
        "shipping_cost",
        "courier_service_id"
    ];

    protected $appends = [
        "customer_name",
        "whatsapp_number"
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getCustomerNameAttribute()
    {
        if ($this->address_id && $this->address) {
            return $this->address->customer_name;
        }
        if ($this->user_id && $this->user) {
            return $this->user->name;
        }
        return "Unknown";
    }

    public function getWhatsappNumberAttribute()
    {
        if ($this->address_id && $this->address) {
            return $this->address->whatsapp_number;
        }
        return "-";
    }

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
