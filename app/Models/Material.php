<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Material extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'price', 'stock', 'unit', 'weight'];

    protected $casts = [
        'price' => 'integer',
        'stock' => 'integer',
        'weight' => 'integer',
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

    public function materialStocks(): HasMany
    {
        return $this->hasMany(MaterialStock::class);
    }

    public function materialStockLogs(): HasMany
    {
        return $this->hasMany(MaterialStockLog::class);
    }
}
