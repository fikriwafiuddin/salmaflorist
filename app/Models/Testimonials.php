<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Testimonials extends Model
{
    protected $fillable = [
        "user_id",
        "order_id",
        "review",
        "rating"
    ];

    protected $appends = ['customer_name', 'customer_status'];

    public function getCustomerNameAttribute()
    {
        return $this->user ? $this->user->name : 'Pelanggan Anonim';
    }

    public function getCustomerStatusAttribute()
    {
        return 'Pelanggan Terverifikasi';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
