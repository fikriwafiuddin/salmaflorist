<?php

namespace App\Services;

use App\Models\Material;
use App\Models\MaterialRestock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MaterialService
{
    /**
     * Ambil semua data bahan dengan filter pencarian dan paginasi.
     */
    public function getAll(Request $request)
    {
        return Material::query()
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', '%' . $search . '%');
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();
    }

    public function getAllMaterials()
    {
        return Material::all();
    }

    /**
     * Ambil data bahan berdasarkan ID.
     */
    public function getById(int $id): Material
    {
        return Material::findOrFail($id);
    }

    /**
     * Tambah bahan baru.
     */
    public function create(array $data): Material
    {   
        return Material::create($data);
    }

    /**
     * Update data bahan.
     */
    public function update(array $data, int $id): bool
    {
        $material = $this->getById($id);
        
        // Hapus 'stock' dari data jika ada untuk memastikan stok hanya berubah lewat restok
        unset($data['stock']);
        
        return $material->update($data);
    }

    /**
     * Hapus bahan (Soft Delete).
     */
    public function delete(int $id): bool
    {
        $material = $this->getById($id);
        return $material->delete();
    }

    /**
     * Catat restok bahan dan update total stok.
     */
    public function restock(int $id, array $data): MaterialRestock
    {
        return DB::transaction(function () use ($id, $data) {
            $material = $this->getById($id);
            
            $restock = $material->restocks()->create($data);
            
            // Update stok di tabel materials
            $material->increment('stock', $data['quantity']);
            
            return $restock;
        });
    }

    /**
     * Ambil riwayat restok untuk bahan tertentu.
     */
    public function getRestockHistory(int $id)
    {
        return MaterialRestock::where('material_id', $id)
            ->latest()
            ->get();
    }

    /**
     * Ambil bahan yang stoknya habis (stok <= 0).
     */
    public function getOutOfStock()
    {
        return Material::where('stock', '<=', 0)->get();
    }

    /**
     * Ambil total stok yang tersedia (aktif dan belum kadaluarsa).
     */
    public function getAvailableStock(int $materialId): int
    {
        return \App\Models\MaterialStock::where('material_id', $materialId)
            ->where('is_active', true)
            ->where('remaining_quantity', '>', 0)
            ->where(function ($query) {
                $query->whereNull('expired_date')
                    ->orWhere('expired_date', '>', now());
            })
            ->sum('remaining_quantity');
    }

    /**
     * Cek apakah semua bahan yang diperlukan mencukupi.
     * @param array $materials format: [['id' => 1, 'quantity' => 2, 'name' => 'Bunga'], ...]
     * @throws \App\Exceptions\InsufficientStockException
     */
    public function checkStockAvailability(array $materials)
    {
        $missing = [];

        foreach ($materials as $item) {
            $available = $this->getAvailableStock($item['id']);
            if ($available < $item['quantity']) {
                $detail = "Bahan '{$item['name']}' tidak mencukupi.";
                
                if (isset($item['sources']) && !empty($item['sources'])) {
                    // Group sources by product_name to consolidate quantities
                    $groupedSources = [];
                    foreach ($item['sources'] as $source) {
                        $pName = $source['product_name'];
                        $groupedSources[$pName] = ($groupedSources[$pName] ?? 0) + $source['quantity'];
                    }
                    
                    $sourceStr = [];
                    foreach ($groupedSources as $pName => $qty) {
                        $sourceStr[] = "{$pName} butuh {$qty}";
                    }
                    
                    $detail .= " Dibutuhkan total {$item['quantity']} (" . implode(', ', $sourceStr) . "), tersedia {$available}. Kurang " . ($item['quantity'] - $available) . ".";
                } else {
                    $detail .= " Butuh: {$item['quantity']}, Tersedia: {$available}. Kurang " . ($item['quantity'] - $available) . ".";
                }
                
                $missing[] = $detail;
            }
        }

        if (!empty($missing)) {
            throw new \App\Exceptions\InsufficientStockException($missing);
        }

        return true;
    }

    /**
     * Kurangi stok menggunakan metode FEFO (First Expiring First Out).
     */
    public function deductStockFEFO(int $materialId, int $quantity, string $notes = '')
    {
        return DB::transaction(function () use ($materialId, $quantity, $notes) {
            $remainingToDeduct = $quantity;

            // Ambil batch yang aktif, belum kadaluarsa, diurutkan berdasarkan tanggal kadaluarsa terdekat
            $batches = \App\Models\MaterialStock::where('material_id', $materialId)
                ->where('is_active', true)
                ->where('remaining_quantity', '>', 0)
                ->where(function ($query) {
                    $query->whereNull('expired_date')
                        ->orWhere('expired_date', '>', now());
                })
                ->orderByRaw('expired_date IS NULL, expired_date ASC') // Null (tidak ada kadaluarsa) ditaruh paling belakang
                ->get();

            foreach ($batches as $batch) {
                if ($remainingToDeduct <= 0) break;

                $deductFromThisBatch = min($batch->remaining_quantity, $remainingToDeduct);
                
                $batch->decrement('remaining_quantity', $deductFromThisBatch);
                $remainingToDeduct -= $deductFromThisBatch;

                // Log pengurangan stok
                \App\Models\MaterialStockLog::create([
                    'material_id' => $materialId,
                    'material_stock_id' => $batch->id,
                    'created_by' => auth()->id(),
                    'quantity' => $deductFromThisBatch,
                    'type' => 'out',
                    'notes' => $notes ?: 'Pengurangan stok untuk pesanan',
                ]);
            }

            if ($remainingToDeduct > 0) {
                throw new \Exception("Stok bahan #{$materialId} tidak mencukupi untuk pengurangan (Kurang: {$remainingToDeduct})");
            }

            // Update total stok di tabel materials
            Material::where('id', $materialId)->decrement('stock', $quantity);

            return true;
        });
    }

    /**
     * Proses otomatis pengurangan stok untuk batch yang sudah kadaluarsa.
     */
    public function handleExpiredStocks()
    {
        DB::transaction(function () {
            $expiredStocks = \App\Models\MaterialStock::where('remaining_quantity', '>', 0)
                ->whereNotNull('expired_date')
                ->where('expired_date', '<=', now())
                ->get();

            foreach ($expiredStocks as $stock) {
                $qty = $stock->remaining_quantity;
                $materialId = $stock->material_id;

                // Catat log pengeluaran untuk stok yang kadaluarsa
                \App\Models\MaterialStockLog::create([
                    'material_id' => $materialId,
                    'material_stock_id' => $stock->id,
                    'created_by' => auth()->id(),
                    'quantity' => $qty,
                    'type' => 'out',
                    'notes' => 'Stok kadaluarsa otomatis',
                ]);

                // Kurangi sisa kuantitas menjadi 0 dan nonaktifkan batch ini
                $stock->update([
                    'remaining_quantity' => 0,
                    'is_active' => false,
                ]);

                // Kurangi total stok di tabel materials
                Material::where('id', $materialId)->decrement('stock', $qty);
            }
        });
    }
}
