<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Material extends Model
{
    protected $fillable = ['name', 'price', 'stock', 'unit', 'min_stock'];

    protected $casts = [
        'price' => 'integer',
        'stock' => 'integer',
        'min_stock' => 'integer',
    ];

    public function restocks(): HasMany
    {
        return $this->hasMany(MaterialRestock::class);
    }

    /**
     * Ambil restok dengan expired_at paling dekat (tidak null) yang belum kadaluarsa.
     */
    public function nearestExpiry(): HasMany
    {
        return $this->hasMany(MaterialRestock::class)
            ->whereNotNull('expired_at')
            ->where('expired_at', '>=', now()->toDateString())
            ->orderBy('expired_at', 'asc');
    }
}
