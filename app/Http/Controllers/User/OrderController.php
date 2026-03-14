<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Services\CartService;
use App\Services\DestinationService;
use Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    protected $destinationService;
    protected $cartService;

    public function __construct(DestinationService $destinationService, CartService $cartService)
    {
        $this->destinationService = $destinationService;
        $this->cartService = $cartService;
    }

    public function create() {
        $provinces = $this->destinationService->getProvinces();
        $cart = $this->cartService->getByUserId(Auth::user()->id);
        
        return Inertia::render('user/checkout/index', [
            'provinces' => $provinces,
            'cart' => $cart
        ]);
    }
}
