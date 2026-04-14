<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomItemDetail extends Model
{
    protected $fillable = [
        'cart_item_id',
        'order_item_id',
        'name',
        'description',
        'service_fee'
    ];

    public function cartItem()
    {
        return $this->belongsTo(CartItem::class);
    }

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function materials()
    {
        return $this->hasMany(CustomItemMaterial::class);
    }
}
