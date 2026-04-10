<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MaterialStockLog extends Model
{
    protected $fillable = [
        'material_id',
        'material_stock_id',
        'created_by',
        'quantity',
        'type',
        'notes',
    ];

    public function material()
    {
        return $this->belongsTo(Material::class);
    }

    public function materialStock()
    {
        return $this->belongsTo(MaterialStock::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
