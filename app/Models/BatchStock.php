<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BatchStock extends Model
{
    protected $fillable = [
        'supplier',
        'total_amount',
        'payment_method',
        'created_by',
    ];

    public function cashTransaction()
    {
        return $this->hasOne(CashTransaction::class);
    }

    public function materialStocks()
    {
        return $this->hasMany(MaterialStock::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
