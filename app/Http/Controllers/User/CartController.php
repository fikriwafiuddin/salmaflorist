<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cart\CartRequestAddItem;
use App\Http\Requests\Cart\CartRequestUpdateQuantity;
use Auth;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\CartService;

class CartController extends Controller
{
    private $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }
    
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $cart = $this->cartService->getByUserId(Auth::user()->id);
        
        return Inertia::render('user/cart/index', [
            'cart' => $cart,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CartRequestAddItem $request)
    {
        $this->cartService->addToCart([
            'user_id' => Auth::user()->id,
            ...$request->validated()
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Item berhasil ditambahkan ke keranjang',
            ], 201);
        }

        return redirect()->back()->with('message', 'Item berhasil ditambahkan ke keranjang');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CartRequestUpdateQuantity $request, string $id)
    {
        $this->cartService->updateItem((int) $id, $request->validated());

        return redirect()->back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $this->cartService->destroyItem((int) $id);

        return redirect()->back()->with('message', 'Item berhasil dihapus dari keranjang');
    }
}
