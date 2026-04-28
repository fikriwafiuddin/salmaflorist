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
                    $order->update(['status' => 'paid', 'is_paid' => true, 'paid_at' => now()]);
                }
            }
        } else if ($transaction == 'settlement') {
            $order->update(['status' => 'paid', 'is_paid' => true, 'paid_at' => now()]);
        } else if ($transaction == 'pending') {
            $order->update(['status' => 'pending']);
        } else if ($transaction == 'deny') {
            $order->update(['status' => 'failed']);
        } else if ($transaction == 'expire') {
            $order->update(['status' => 'failed']);
        } else if ($transaction == 'cancel') {
            $order->update(['status' => 'failed']);
        }

        return response(['message' => 'Success']);
    }
}
