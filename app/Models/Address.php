<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    protected $fillable = [
        "customer_name",
        "whatsapp_number",
        "address_detail",
        "notes",
        "province_id",
        "province_name",
        "city_id",
        "city_name",
        "district_id",
        "district_name"
    ];

    public function order()
    {
        return $this->hasOne(Order::class);
    }
}
