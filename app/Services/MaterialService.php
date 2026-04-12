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
}
