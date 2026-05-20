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
        $count = $orderService->cancelExpiredOrders();

        $this->info("Berhasil membatalkan {$count} pesanan yang kedaluwarsa (15 menit).");
    }
}
