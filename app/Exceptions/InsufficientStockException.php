<?php

namespace App\Exceptions;

use Exception;

class InsufficientStockException extends Exception
{
    protected $missingMaterials;

    public function __construct(array $missingMaterials)
    {
        $this->missingMaterials = $missingMaterials;
        $message = "Bahan berikut tidak mencukupi atau sudah kadaluarsa: " . implode(', ', $missingMaterials);
        parent::__construct($message, 422);
    }

    public function getMissingMaterials()
    {
        return $this->missingMaterials;
    }
}
