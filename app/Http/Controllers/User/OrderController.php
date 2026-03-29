<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\CheckoutRequest;
use App\Services\CartService;
use App\Services\DestinationService;
use App\Services\OrderService;
use App\Services\MidtransService;
use Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    protected $destinationService;
    protected $cartService;
    protected $orderService;
    protected $midtransService;

    public function __construct(
        DestinationService $destinationService, 
        CartService $cartService,
        OrderService $orderService,
        MidtransService $midtransService
    ) {
        $this->destinationService = $destinationService;
        $this->cartService = $cartService;
        $this->orderService = $orderService;
        $this->midtransService = $midtransService;
    }

    public function create() {
        $provinces = $this->destinationService->getProvinces();
        $cart = $this->cartService->getByUserId(Auth::user()->id);
        
        return Inertia::render('user/checkout/index', [
            'provinces' => $provinces,
            'cart' => $cart
        ]);
    }

    public function store(CheckoutRequest $request)
    {
        try {
            $order = $this->orderService->createFromUser($request->validated(), Auth::id());
            $snapToken = $this->midtransService->getSnapToken($order);

            return response()->json([
                'success' => true,
                'snap_token' => $snapToken,
                'order_id' => $order->id
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }
}
