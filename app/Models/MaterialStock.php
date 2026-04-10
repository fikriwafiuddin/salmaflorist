<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MaterialStock extends Model
{
    protected $fillable = [
        'batch_stock_id',
        'material_id',
        'is_active',
        'initial_quantity',
        'remaining_quantity',
        'price',
        'subtotal',
        'expired_date',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'expired_date' => 'datetime',
    ];

    public function batchStock()
    {
        return $this->belongsTo(BatchStock::class);
    }

    public function material()
    {
        return $this->belongsTo(Material::class);
    }

    public function logs()
    {
        return $this->hasMany(MaterialStockLog::class);
    }
}
