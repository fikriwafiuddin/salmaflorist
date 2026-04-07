<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaterialRestock extends Model
{
    protected $fillable = [
        'material_id',
        'quantity',
        'price_per_unit',
        'expired_at',
        'notes',
    ];

    protected $casts = [
        'expired_at' => 'date',
        'quantity' => 'integer',
        'price_per_unit' => 'integer',
    ];

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }
}
