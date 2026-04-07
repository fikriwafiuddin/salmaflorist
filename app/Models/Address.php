<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Address extends Model
{
    protected $fillable = [
        "user_id",
        "customer_name",
        "whatsapp_number",
        "address_detail",
        "province_id",
        "city_id",
        "district_id",
        "postal_code"
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
