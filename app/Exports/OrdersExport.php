<?php

namespace App\Exports;

use App\Models\Order;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class OrdersExport implements FromCollection, WithHeadings, WithMapping
{
    protected $month;
    protected $year;
    protected $date;
    protected $startDate;
    protected $endDate;

    public function __construct($month = null, $year = null, $date = null, $startDate = null, $endDate = null)
    {
        $this->month = $month;
        $this->year  = $year;
        $this->date  = $date;
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        // Check if date range is provided
        if ($this->startDate && $this->endDate) {
            $start = Carbon::parse($this->startDate)->startOfDay();
            $end   = Carbon::parse($this->endDate)->endOfDay();
        } elseif ($this->date) {
            $start = Carbon::parse($this->date)->startOfDay();
            $end   = Carbon::parse($this->date)->endOfDay();
        } else {
            $start = Carbon::create($this->year, $this->month, 1)->startOfDay();
            $end   = Carbon::create($this->year, $this->month, 1)->endOfMonth()->endOfDay();
        }

        return Order::whereBetween('created_at', [$start, $end])
            ->orderBy('created_at', 'asc')
            ->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nama Pelanggan',
            'Nomor WhatsApp',
            'Alamat',
            'Status',
            'Pembayaran',
            'Metode Pengiriman',
            'Jadwal',
            'Jumlah Total',
            'Catatan',
            'Dibuat',
        ];
    }

    public function map($order): array
    {
        return [
            $order->id,
            $order->customer_name,
            $order->whatsapp_number,
            $order->address,
            $order->status,
            $order->is_paid ? 'Lunas' : 'Belum lunas',
            $order->shipping_method,
            $order->schedule,
            $order->total_amount,
            $order->notes,
            $order->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
