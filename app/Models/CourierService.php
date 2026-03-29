<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourierService extends Model
{
    protected $fillable = [
        'name',
        'code',
        'service',
        'description',
        'cost',
        'etd'
    ];

    public function order()
    {
        return $this->hasOne(Order::class);
    }
}
