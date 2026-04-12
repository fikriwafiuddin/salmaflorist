<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    protected $fillable = [
        "user_id",
        "invoice_number",
        "address_id",
        "status",
        "shipping_method",
        "order_source",
        "schedule",
        "shipping_cost",
        "total_amount",
        "is_paid",
        "paid_at",
        "notes"
    ];
    
    protected $casts = [
        "is_paid" => "boolean",
        "paid_at" => "datetime",
        "schedule" => "datetime",
    ];

    protected $appends = [
        "customer_name",
        "whatsapp_number"
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function address(): BelongsTo
    {
        return $this->belongsTo(Address::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function shipment(): HasOne
    {
        return $this->hasOne(Shipment::class);
    }

    public function statusLogs(): HasMany
    {
        return $this->hasMany(OrderStatusLog::class);
    }

    public function testimonial(): HasOne
    {
        return $this->hasOne(Testimonials::class);
    }

    public function cashTransaction(): HasOne
    {
        return $this->hasOne(CashTransaction::class);
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
}
