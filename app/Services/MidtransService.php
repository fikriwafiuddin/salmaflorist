<?php

namespace App\Services;

use Midtrans\Config;
use Midtrans\Snap;

class MidtransService
{
    public function __construct()
    {
        Config::$serverKey = config('services.midtrans.serverKey');
        Config::$isProduction = config('services.midtrans.isProduction');
        Config::$isSanitized = config('services.midtrans.isSanitized');
        Config::$is3ds = config('services.midtrans.is3ds');
    }

    public function getSnapToken($order)
    {
        $params = [
            'transaction_details' => [
                'order_id' => $order->id . '-' . time(),
                'gross_amount' => $order->total_amount,
            ],
            'customer_details' => [
                'first_name' => $order->customer_name ?? auth()->user()->name,
                'email' => auth()->user()->email,
                'phone' => $order->whatsapp_number ?? '',
            ],
            'callbacks' => [
                'finish_url' => route('user.payment.success'),
            ]
        ];

        return Snap::getSnapToken($params);
    }
}
