<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CancelLateOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:cancel-late';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Batal otomatis pesanan yang belum dibayar dan sudah melewati tanggal jadwal';

    /**
     * Execute the console command.
     */
    public function handle(\App\Services\OrderService $orderService)
    {
        $lateOrders = \App\Models\Order::whereIn('status', ['process', 'pending'])
            ->where('is_paid', false)
            ->where('schedule', '<', now()->timezone('Asia/Jakarta'))
            ->get();

        $count = 0;
        foreach ($lateOrders as $order) {
            if ($order->status !== 'canceled') {
                $order->update(['status' => 'canceled']);
                $orderService->restoreMaterialsForOrder($order);
                $count++;
            }
        }

        $this->info("Berhasil membatalkan {$count} pesanan yang telat bayar.");
    }
}
