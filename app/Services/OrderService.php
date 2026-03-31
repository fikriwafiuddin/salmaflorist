<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\CashTransaction;
use App\Models\Address;
use App\Models\CourierService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function createFromUser(array $data, int $userId)
    {
        return DB::transaction(function () use ($data, $userId) {
            // 1. Get Cart
            $cartService = app(CartService::class);
            $cart = $cartService->getByUserId($userId);

            if ($cart->items->isEmpty()) {
                throw new \Exception('Keranjang kosong');
            }

            $totalAmount = 0;

            // 2. Handle Shipping (if delivery)
            $addressId = null;
            $courierServiceId = null;
            $shippingCost = 0;

            if ($data['shipping_method'] === 'delivery') {
                // Fetch location names from IDs
                $destinationService = app(DestinationService::class);
                
                // Get name for province, city, district
                $provinces = $destinationService->getProvinces();
                $province = collect($provinces)->firstWhere('id', $data['address']['province_id']);
                $provinceName = $province['name'] ?? '';

                $cities = $destinationService->getCities($data['address']['province_id']);
                $city = collect($cities)->firstWhere('id', $data['address']['city_id']);
                $cityName = $city['name'] ?? '';

                $districts = $destinationService->getDistricts($data['address']['city_id']);
                $district = collect($districts)->firstWhere('id', $data['address']['district_id']);
                $districtName = $district['name'] ?? '';

                $address = Address::create([
                    'customer_name' => $data['address']['customer_name'],
                    'whatsapp_number' => $data['address']['whatsapp_number'],
                    'address_detail' => $data['address']['address_detail'],
                    'province_id' => $data['address']['province_id'],
                    'province_name' => $provinceName,
                    'city_id' => $data['address']['city_id'],
                    'city_name' => $cityName,
                    'district_id' => $data['address']['district_id'],
                    'district_name' => $districtName,
                ]);
                $addressId = $address->id;

                // Validate shipping cost
                $costs = $destinationService->getShippingCost([
                    'destination' => $data['address']['district_id'],
                    'courier' => $data['courier']['code']
                ], $userId);

                $selectedCost = collect($costs)->firstWhere('service', $data['courier']['service']);
                
                if (!$selectedCost) {
                    throw new \Exception('Layanan pengiriman tidak valid');
                }

                $courierService = CourierService::create([
                    'name' => $selectedCost['name'],
                    'code' => $selectedCost['code'],
                    'service' => $selectedCost['service'],
                    'description' => $selectedCost['description'],
                    'cost' => $selectedCost['cost'],
                    'etd' => $selectedCost['etd'],
                ]);
                $courierServiceId = $courierService->id;
                $shippingCost = $selectedCost['cost'];
            }

            // 3. Create Order
            $order = Order::create([
                'user_id' => $userId,
                'status' => 'pending',
                'is_paid' => false,
                'shipping_method' => $data['shipping_method'],
                'address_id' => $addressId,
                'courier_service_id' => $courierServiceId,
                'shipping_cost' => $shippingCost,
                'total_amount' => 0, // temporary
                'notes' => $data['notes'] ?? null,
                'schedule' => Carbon::now('Asia/Jakarta')->addDays(1), // Default schedule
            ]);

            // 4. Move items from cart to order
            foreach ($cart->items as $item) {
                $unitPrice = $item->is_custom ? $item->unit_price : ($item->product->price ?? 0);
                $subtotal = $unitPrice * $item->quantity;
                $totalAmount += $subtotal;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'is_custom' => $item->is_custom,
                    'custom_name' => $item->is_custom ? $item->custom_name : ($item->product->name ?? 'Unknown'),
                    'custom_description' => $item->custom_description,
                    'quantity' => $item->quantity,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                ]);
            }

            $order->update([
                'total_amount' => $totalAmount + $shippingCost,
            ]);

            // 5. Clear Cart
            $cart->items()->delete();

            return $order;
        });
    }

    public function create (array $data)
    {
        return DB::transaction(function () use ($data) {
            $totalAmount = 0;

            $schedule = Carbon::parse($data['schedule'])
                ->setTimezone('Asia/Jakarta')
                ->format('Y-m-d H:i:s');

            // Create address first
            $address = Address::create([
                'customer_name' => $data['customer_name'],
                'whatsapp_number' => $data['whatsapp_number'],
                'address_detail' => $data['address'] ?? "-",
            ]);

            $order = Order::create([
                'address_id'      => $address->id,
                'status'          => "process",
                'is_paid'         => $data['is_paid'],
                'shipping_method' => $data['shipping_method'],
                'schedule'        => $schedule,
                'total_amount'    => 0,
                'notes'           => $data['notes'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                if (!$item['is_custom']) {
                    $product = Product::findOrFail(
                        $item['product']['id']
                    );

                    $unitPrice = $product->price;
                    $subtotal  = $unitPrice * $item['quantity'];
                } else {
                    $unitPrice = $item['unit_price'];
                    $subtotal  = $unitPrice * $item['quantity'];
                }

                $totalAmount += $subtotal;

                OrderItem::create([
                    'order_id'           => $order->id,
                    'product_id'         => $item['product']['id'] ?? null,
                    'is_custom'          => $item['is_custom'],
                    'custom_name'        => $item['custom_name'],
                    'custom_description' => $item['custom_description'],
                    'quantity'           => $item['quantity'],
                    'unit_price'         => $unitPrice,
                    'subtotal'           => $subtotal,
                ]);
            }

            $order->update([
                'total_amount' => $totalAmount,
            ]);

            if ($data['is_paid']) {
                CashTransaction::create([
                    'order_id' => $order->id,
                    'type' => 'income',
                    'category' => 'Pesanan',
                    'amount' => $totalAmount,
                    'transaction_date' => now(),
                    'description' => "Pembayaran pesanan dari {$data['customer_name']}"
                ]);
            }

            return $order;
        });
    }

    public function update(array $data, int $id)
    {
        return DB::transaction(function () use ($data, $id) {
            $order = $this->getById($id);
            
            $schedule = Carbon::parse($data['schedule'])
                    ->setTimezone('Asia/Jakarta')
                    ->format('Y-m-d H:i:s');
            
            $data['schedule'] = $schedule;
            
            $wasPaid = $order->is_paid;
            $isPaid = $data['is_paid'];
            
            $order->update($data);

            // Update associated address if it exists, or create one
            if ($order->address) {
                $order->address->update([
                    'customer_name' => $data['customer_name'] ?? $order->address->customer_name,
                    'whatsapp_number' => $data['whatsapp_number'] ?? $order->address->whatsapp_number,
                    'address_detail' => $data['address'] ?? $order->address->address_detail,
                ]);
            }

            if (!$wasPaid && $isPaid) {
                CashTransaction::create([
                    'order_id' => $order->id,
                    'type' => 'income',
                    'category' => 'Pesanan',
                    'amount' => $order->total_amount,
                    'transaction_date' => now(),
                    'description' => "Pembayaran pesanan dari {$order->customer_name}"
                ]);
            }
            elseif ($wasPaid && !$isPaid) {
                CashTransaction::where('order_id', $order->id)->delete();
            }

            return $order;
        });
    }

    public function updateStatus (array $data, int $id)
    {
        $order = $this->getById($id);

        if (!$order->is_paid && in_array($data['status'], ['process', 'completed'])) {
            throw new \Exception('Status tidak bisa diubah ke Progres atau Selesai jika pesanan belum dibayar.');
        }

        return $order->update(['status' => $data['status']]);
    }

    public function delete(int $id)
    {
        $order = $this->getById($id);

        return $order->delete();
    }

    public function getAll(object $request)
    {
        $year = $request->year ?? Carbon::now()->year;
        $month = $request->month;

        if (!is_numeric($year) || $year < 2020 || $year > Carbon::now()->year) {
            $year = Carbon::now()->year;
        }

        if (!is_numeric($month) || $month < 0 || $month > 11) {
            $month = Carbon::now()->month;
        } else {
            $month = intval($month) + 1;
        }

        $orders = Order::query()
                    ->leftJoin("addresses", "orders.address_id", "=", "addresses.id")
                    ->leftJoin("users", "orders.user_id", "=", "users.id")
                    ->select("orders.*")
                    ->when($request->customer_name, function ($query, $customer_name) {
                        $query->where(function ($q) use ($customer_name) {
                            $q->where("addresses.customer_name", "like", "%{$customer_name}%")
                              ->orWhere("users.name", "like", "%{$customer_name}%");
                        });
                    })
                    ->when($request->whatsapp, function ($query, $whatsapp) {
                        $query->where("addresses.whatsapp_number", "like", "%{$whatsapp}%");
                    })
                    ->whereYear("orders.created_at", $year)
                    ->whereMonth("orders.created_at", $month)
                    ->when($request->status !== "all", function ($query) use ($request) {
                        if (!empty($request->status)) {
                            $query->where("orders.status", strtolower($request->status));
                        }
                    })
                    ->when($request->payment !== "all", function ($query) use ($request) {
                        if (!empty($request->payment) && in_array(strtolower($request->payment), ["paid", "unpaid"])) {
                            $query->where("orders.is_paid", $request->payment === "paid");
                        }
                    })
                    ->when($request->shipping_method !== "all", function ($query) use ($request) {
                        if (!empty($request->shipping_method) && in_array(strtolower($request->shipping_method), ["delivery", "pickup"])) {
                            $query->where("orders.shipping_method", $request->shipping_method);
                        }
                    })
                    ->latest("orders.created_at")
                    ->paginate(10);

        return $orders;
    }

    public function getById (int $id) {
        $order = Order::select()->with(['orderItems.product'])->findOrFail($id);

        return $order;
    }

    public function getByDate(?string $date)
    {
        if (empty($date)) {
            $parsedDate = Carbon::now('Asia/Jakarta')->toDateString();
        } else {
            try {
                $parsedDate = Carbon::parse($date)
                    ->setTimezone('Asia/Jakarta')
                    ->toDateString();
            } catch (\Exception $e) {
                $parsedDate = Carbon::now('Asia/Jakarta')->toDateString();
            }
        }

        $orders = Order::query()
                    ->whereDate('schedule', $parsedDate)
                    ->paginate(10);

        return $orders;
    }

    public function getByDateRange(string $startDate, string $endDate)
    {
        $start = Carbon::parse($startDate)
            ->setTimezone('Asia/Jakarta')
            ->toDateString();

        $end = Carbon::parse($endDate)
            ->setTimezone('Asia/Jakarta')
            ->toDateString();

        $orders = Order::query()
                    ->whereBetween('schedule', [$start, $end])
                    ->with(['orderItems.product'])
                    ->paginate(10);

        return $orders;
    }

    public function getStatisticsByDate(?string $date): array
    {
        if (empty($date)) {
            $parsedDate = Carbon::now('Asia/Jakarta')->toDateString();
        } else {
            try {
                $parsedDate = Carbon::parse($date)
                    ->setTimezone('Asia/Jakarta')
                    ->toDateString();
            } catch (\Exception $e) {
                $parsedDate = Carbon::now('Asia/Jakarta')->toDateString();
            }
        }

        $totalSchedules = Order::query()
                            ->whereDate('schedule', $parsedDate)
                            ->count();

        $processCount = Order::query()
                        ->whereDate('schedule', $parsedDate)
                        ->where('status', 'process')
                        ->count();

        $completedCount = Order::query()
                        ->whereDate('schedule', $parsedDate)
                        ->where('status', 'completed')
                        ->count();

        $cancelledCount = Order::query()
                        ->whereDate('schedule', $parsedDate)
                        ->where('status', 'canceled')
                        ->count();

        return [
            'total' => $totalSchedules,
            'process' => $processCount,
            'completed' => $completedCount,
            'cancelled' => $cancelledCount,
        ];
    }

    public function getCountByDate(string $coll, ?string $date = null): int
    {
        if (empty($date)) {
            $parsedDate = Carbon::now('Asia/Jakarta')->toDateString();
        } else {
            try {
                $parsedDate = Carbon::parse($date)
                    ->setTimezone('Asia/Jakarta')
                    ->toDateString();
            } catch (\Exception $e) {
                $parsedDate = Carbon::now('Asia/Jakarta')->toDateString();
            }
        }

        return Order::query()
                    ->whereDate($coll, $parsedDate)
                    ->count();
    }

    public function getCountByDateRange(string $startDate, string $endDate): int
    {
        $start = Carbon::parse($startDate)
            ->setTimezone('Asia/Jakarta')
            ->toDateString();

        $end = Carbon::parse($endDate)
            ->setTimezone('Asia/Jakarta')
            ->toDateString();

        return Order::query()
                    ->whereBetween('schedule', [$start, $end])
                    ->count();
    }

    public function getLatestOrders(int $limit = 5)
    {
        return Order::query()
                    ->with(['address', 'user'])
                    ->latest('created_at')
                    ->limit($limit)
                    ->get();
    }

    public function getOrdersChartData(int $days = 7): array
    {
        $startDate = Carbon::now('Asia/Jakarta')
            ->subDays($days - 1)
            ->startOfDay();
        $endDate = Carbon::now('Asia/Jakarta')->endOfDay();

        $orders = Order::query()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw("DATE(CONVERT_TZ(created_at, '+00:00', '+07:00')) as date")
            ->selectRaw("COUNT(*) as order_count")
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();

        $result = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = Carbon::now('Asia/Jakarta')
                ->subDays($i)
                ->toDateString();
            
            $found = false;
            foreach ($orders as $order) {
                if ($order['date'] === $date) {
                    $result[] = [
                        'date' => $date,
                        'order' => $order['order_count'],
                    ];
                    $found = true;
                    break;
                }
            }

            if (!$found) {
                $result[] = [
                    'date' => $date,
                    'order' => 0,
                ];
            }
        }

        return $result;
    }

    public function getMonthlyOrderSummary(object $request)
    {
        $year = $request->year;
        $month = $request->month;

        if (!is_numeric($year) || $year < 2020 || $year > Carbon::now()->year) {
            $year = Carbon::now()->year;
        }

        if (!is_numeric($month) || $month < 0 || $month > 11) {
            $month = Carbon::now()->month;
        } else {
            $month = intval($month) + 1;
        }

        $startDate = Carbon::createFromDate($year, $month, 1, 'Asia/Jakarta')->startOfDay();
        $endDate   = Carbon::createFromDate($year, $month, 1, 'Asia/Jakarta')->endOfMonth()->endOfDay();

        $query = Order::query()
            ->whereBetween('created_at', [$startDate, $endDate]);

        $totalOrders = (clone $query)->count();

        $totalCompleted = (clone $query)
            ->where('status', 'completed')
            ->count();

        $totalCanceled = (clone $query)
            ->where('status', 'canceled')
            ->count();

        $totalProcess = (clone $query)
            ->where('status', 'process')
            ->count();

        $totalLate = (clone $query)
            ->where('status', 'process')
            ->where('schedule', '<', Carbon::now('Asia/Jakarta'))
            ->count();

        $totalRevenue = Order::where('status', 'completed')
            ->where('is_paid', true)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('total_amount');

        return [
            'totalOrders' => $totalOrders,
            'totalCompleted' => $totalCompleted,
            'totalCanceled' => $totalCanceled,
            'totalProcess' => $totalProcess,
            'totalLate' => $totalLate,
            'totalRevenue' => $totalRevenue
        ];
    }

    public function getMonthlyOrderChart(object $request)
    {
        $year = $request->year;
        $month = $request->month;

        if (!is_numeric($year) || $year < 2020 || $year > Carbon::now()->year) {
            $year = Carbon::now()->year;
        }

        if (!is_numeric($month) || $month < 0 || $month > 11) {
            $month = Carbon::now()->month;
        } else {
            $month = intval($month) + 1;
        }

        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate   = Carbon::create($year, $month, 1)->endOfMonth();

        $orders = Order::selectRaw('DATE(created_at) as date, COUNT(*) as order_count')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $chartData = [];
        $current = $startDate->copy();

        while ($current->lte($endDate)) {
            $dateString = $current->format('Y-m-d');

            $chartData[] = [
                'date'  => $dateString,
                'order' => $orders->has($dateString)
                    ? (int)$orders[$dateString]->order_count
                    : 0,
            ];

            $current->addDay();
        }

        return $chartData;
    }

    public function getShippingMethodStats(object $request)
    {
        $year = $request->year;
        $month = $request->month;

        if (!is_numeric($year) || $year < 2020 || $year > Carbon::now()->year) {
            $year = Carbon::now()->year;
        }

        if (!is_numeric($month) || $month < 0 || $month > 11) {
            $month = Carbon::now()->month;
        } else {
            $month = intval($month) + 1;
        }

        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate   = Carbon::create($year, $month, 1)->endOfMonth();

        $results = Order::selectRaw('shipping_method, COUNT(*) as total')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('shipping_method')
            ->get()
            ->keyBy('shipping_method');

        return [
            [
                'shipping_method' => 'delivery',
                'orders' => isset($results['delivery']) ? (int)$results['delivery']->total : 0,
                'fill' => 'var(--color-delivery)',
            ],
            [
                'shipping_method' => 'pickup',
                'orders' => isset($results['pickup']) ? (int)$results['pickup']->total : 0,
                'fill' => 'var(--color-pickup)',
            ],
        ];
    }

    public function getPaymentStatusStats(object $request)
    {
        $year = $request->year;
        $month = $request->month;

        if (!is_numeric($year) || $year < 2020 || $year > Carbon::now()->year) {
            $year = Carbon::now()->year;
        }

        if (!is_numeric($month) || $month < 0 || $month > 11) {
            $month = Carbon::now()->month;
        } else {
            $month = intval($month) + 1;
        }

        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate   = Carbon::create($year, $month, 1)->endOfMonth();

        $results = Order::selectRaw('is_paid, COUNT(*) as total')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('is_paid')
            ->get()
            ->keyBy('is_paid');

        return [
            [
                'is_paid' => 'paid',
                'orders' => isset($results[1]) ? (int)$results[1]->total : 0,
                'fill' => 'var(--color-paid)',
            ],
            [
                'is_paid' => 'unpaid',
                'orders' => isset($results[0]) ? (int)$results[0]->total : 0,
                'fill' => 'var(--color-unpaid)',
            ],
        ];
    }

    public function createByUser($data) {
        $user = auth()->user();

        return DB::transaction(function () use ($data, $user) {

        });
    }
}