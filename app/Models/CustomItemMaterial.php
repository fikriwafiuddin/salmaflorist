<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomItemMaterial extends Model
{
    protected $fillable = [
        'custom_item_detail_id',
        'material_id',
        'quantity'
    ];

    public function customItemDetail()
    {
        return $this->belongsTo(CustomItemDetail::class);
    }

    public function material()
    {
        return $this->belongsTo(Material::class);
    }
}
