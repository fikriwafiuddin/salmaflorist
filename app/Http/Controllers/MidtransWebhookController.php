<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use Midtrans\Config;

class MidtransWebhookController extends Controller
{
    public function __construct()
    {
        Config::$serverKey = config('services.midtrans.serverKey');
        Config::$isProduction = config('services.midtrans.isProduction');
    }

    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $notification = json_decode($payload);

        if (!$notification) {
            return response(['message' => 'Invalid payload'], 400);
        }

        $validSignatureKey = hash("sha512", $notification->order_id . $notification->status_code . $notification->gross_amount . config('services.midtrans.serverKey'));

        if (isset($notification->signature_key) && $notification->signature_key != $validSignatureKey) {
            return response(['message' => 'Invalid signature'], 403);
        }

        $transaction = $notification->transaction_status;
        $type = $notification->payment_type ?? '';
        $orderIdWithTime = $notification->order_id;
        $fraud = $notification->fraud_status ?? '';

        // Extract original order ID
        $orderId = explode('-', $orderIdWithTime)[0];

        $order = Order::find($orderId);

        if (!$order) {
            return response(['message' => 'Order not found'], 404);
        }

        if ($transaction == 'capture') {
            if ($type == 'credit_card') {
                if ($fraud == 'challenge') {
                    $order->update(['status' => 'pending']);
                } else {
                    $this->processPaymentSuccess($order);
                }
            }
        } else if ($transaction == 'settlement') {
            $this->processPaymentSuccess($order);
        } else if ($transaction == 'pending') {
            $order->update(['status' => 'pending']);
        } else if ($transaction == 'deny') {
            $this->processPaymentFailure($order);
        } else if ($transaction == 'expire') {
            $this->processPaymentFailure($order);
        } else if ($transaction == 'cancel') {
            $this->processPaymentFailure($order);
        }

        return response(['message' => 'Success']);
    }

    private function processPaymentFailure($order)
    {
        if ($order->status !== 'canceled') {
            $order->update(['status' => 'canceled']);
            
            $orderService = app(\App\Services\OrderService::class);
            $orderService->restoreMaterialsForOrder($order);
        }
    }

    private function processPaymentSuccess($order)
    {
        if (!$order->is_paid) {
            $order->update(['status' => 'paid', 'is_paid' => true, 'paid_at' => now()]);
            $orderService = app(\App\Services\OrderService::class);
            // Stock is now deducted immediately upon order creation.

            \App\Models\CashTransaction::create([
                'order_id'         => $order->id,
                'type'             => 'income',
                'category'         => 'order',
                'payment_method'   => 'midtrans',
                'amount'           => $order->total_amount,
                'transaction_date' => now(),
                'notes'            => "Pembayaran pesanan (Invoice: {$order->invoice_number})"
            ]);
        }
    }
}
