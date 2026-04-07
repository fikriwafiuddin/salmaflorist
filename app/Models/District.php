<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class District extends Model
{
    use SoftDeletes;

    protected $fillable = ['id', 'name'];

    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }
}
