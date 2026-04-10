<?php

namespace App\Http\Controllers;

use App\Http\Requests\Materials\StoreBatchStockRequest;
use App\Models\Material;
use App\Services\BatchStockService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpParser\Node\Stmt\TryCatch;

class BatchStockController extends Controller
{
    protected $batchStockService;

    public function __construct(BatchStockService $batchStockService)
    {
        $this->batchStockService = $batchStockService;
    }

    /**
     * Tampilkan riwayat kulakan.
     */
    public function index(Request $request)
    {
        try {
            $year = $request->get('year', now()->year);
            $month = $request->get('month', now()->month - 1);

            return Inertia::render('admin/batch-stocks/index/page', [
                'batchStocks' => $this->batchStockService->getAll($request),
                'filters' => [
                    'year' => $year,
                    'month' => $month,
                ]
            ]);
        } catch (\Exception $e) {
            return back()->with('error', 'Internal server error');
        }
    }

    /**
     * Tampilkan formulir kulakan baru.
     */
    public function create()
    {
        return Inertia::render('admin/batch-stocks/create/page', [
            'materials' => Material::select('id', 'name', 'unit')->get(),
        ]);
    }

    /**
     * Simpan data kulakan.
     */
    public function store(StoreBatchStockRequest $request)
    {
        try {
            $this->batchStockService->store($request->validated());

            return to_route('batch-stocks.index')->with('success', 'Data kulakan berhasil disimpan.');
        } catch (\Exception $e) {
            return back()->with('error', 'Internal server error');
        }
    }

    /**
     * Tampilkan detail kulakan.
     */
    public function show(int $id)
    {
        return Inertia::render('admin/batch-stocks/show/page', [
            'batchStock' => $this->batchStockService->getById($id),
        ]);
    }
}
