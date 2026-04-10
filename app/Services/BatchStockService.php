<?php

namespace App\Services;

use App\Models\BatchStock;
use App\Models\CashTransaction;
use App\Models\Material;
use App\Models\MaterialStockLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class BatchStockService
{
    /**
     * Ambil semua riwayat kulakan dengan relasi user dan ringkasan items.
     */
    public function getAll(object $request)
    {
        $year = $request->year;
        $month = $request->month;

        if (!is_numeric($year) || $year < 2024 || $year > now()->year) {
            $year = now()->year;
        }

        if (!is_numeric($month) || $month < 0 || $month > 11) {
            $month = now()->month;
        } else {
            $month = intval($month) + 1;
        }

        return BatchStock::with(['user'])
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->latest()
            ->paginate(10)
            ->withQueryString();
    }

    /**
     * Ambil detail kulakan berdasarkan ID, termasuk items dan bahannya.
     */
    public function getById(int $id)
    {
        return BatchStock::with(['user', 'materialStocks.material'])
            ->findOrFail($id);
    }

    /**
     * Simpan data kulakan baru.
     */
    public function store(array $data)
    {
        return DB::transaction(function () use ($data) {
            $totalAmount = 0;
            foreach ($data['items'] as $item) {
                $totalAmount += ($item['quantity'] * $item['price']);
            }

            $batch = BatchStock::create([
                'supplier'       => $data['supplier'],
                'payment_method' => $data['payment_method'],
                'total_amount'   => $totalAmount,
                'created_by'     => Auth::id(),
            ]);

            // Buat transaksi kas (pengeluaran)
            CashTransaction::create([
                'batch_stock_id'   => $batch->id,
                'type'             => 'expense',
                'category'         => 'restock',
                'payment_method'   => $data['payment_method'],
                'amount'           => $totalAmount,
                'transaction_date' => now(),
                'notes'            => "Kulakan bahan dari supplier: {$data['supplier']} (Batch #{$batch->id})",
                'created_by'       => Auth::id(),
            ]);

            foreach ($data['items'] as $item) {
                $subtotal = $item['quantity'] * $item['price'];

                $materialStock = $batch->materialStocks()->create([
                    'material_id'        => $item['material_id'],
                    'is_active'          => true,
                    'initial_quantity'  => $item['quantity'],
                    'remaining_quantity' => $item['quantity'],
                    'price'              => $item['price'],
                    'subtotal'           => $subtotal,
                    'expired_date'       => $item['expired_date'] ?? null,
                ]);

                // Log penambahan stok
                MaterialStockLog::create([
                    'material_id'       => $item['material_id'],
                    'material_stock_id' => $materialStock->id,
                    'created_by'        => Auth::id(),
                    'quantity'          => $item['quantity'],
                    'type'              => 'in',
                    'notes'             => "Kulakan dari supplier: {$data['supplier']}",
                ]);

                // Update total stok di tabel materials
                Material::where('id', $item['material_id'])->increment('stock', $item['quantity']);
            }

            return $batch;
        });
    }
}
