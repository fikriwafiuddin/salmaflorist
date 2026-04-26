<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\CashTransaction;
use App\Models\Address;
use App\Models\Shipment;
use App\Models\CourierService;
use App\Models\CustomItemDetail;
use App\Models\Province;
use App\Models\City;
use App\Models\District;
use App\Models\OrderCounter;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function createFromUser(array $data, int $userId)
    {
        return DB::transaction(function () use ($data, $userId) {
            $materialService = app(MaterialService::class);
            $cartService = app(CartService::class);
            $cart = $cartService->getByUserId($userId);

            if ($cart->items->isEmpty()) {
                throw new \Exception('Keranjang kosong');
            }

            // --- 1. VALIDASI STOK (PRE-CHECK) ---
            $requiredMaterials = [];
            foreach ($cart->items as $item) {
                if (!$item->is_custom) {
                    $mats = $item->product->materials;
                    foreach ($mats as $mat) {
                        $materialId = $mat->id;
                        $quantityNeeded = $mat->pivot->quantity * $item->quantity;
                        if (!isset($requiredMaterials[$materialId])) {
                            $requiredMaterials[$materialId] = [
                                'id' => $materialId,
                                'quantity' => 0,
                                'name' => $mat->name,
                                'sources' => []
                            ];
                        }
                        $requiredMaterials[$materialId]['quantity'] += $quantityNeeded;
                        $requiredMaterials[$materialId]['sources'][] = [
                            'product_name' => $item->product->name,
                            'quantity' => $quantityNeeded
                        ];
                    }
                } else {
                    $customDetail = $item->customDetail;
                    if ($customDetail) {
                        foreach ($customDetail->materials as $customMat) {
                            $materialId = $customMat->material_id;
                            $quantityNeeded = $customMat->quantity * $item->quantity;
                            if (!isset($requiredMaterials[$materialId])) {
                                $requiredMaterials[$materialId] = [
                                    'id' => $materialId,
                                    'quantity' => 0,
                                    'name' => $customMat->material->name ?? 'Unknown',
                                    'sources' => []
                                ];
                            }
                            $requiredMaterials[$materialId]['quantity'] += $quantityNeeded;
                            $requiredMaterials[$materialId]['sources'][] = [
                                'product_name' => "Custom: {$customDetail->name}",
                                'quantity' => $quantityNeeded
                            ];
                        }
                    }
                }
            }

            if (!empty($requiredMaterials)) {
                $materialService->checkStockAvailability($requiredMaterials);
            }

            // --- 2. HANDLE ADDRESS & SHIPPING ---
            $addressId = null;
            $courierServiceId = null;
            $shippingCost = 0;

            if ($data['shipping_method'] === 'delivery') {
                $destinationService = app(DestinationService::class);
                
                $province = \App\Models\Province::find($data['address']['province_id']);
                $city = \App\Models\City::find($data['address']['city_id']);
                $district = \App\Models\District::find($data['address']['district_id']);

                $address = Address::create([
                    'customer_name' => $data['address']['customer_name'],
                    'whatsapp_number' => $data['address']['whatsapp_number'],
                    'address_detail' => $data['address']['address_detail'],
                    'province_id' => $data['address']['province_id'],
                    'province_name' => $province->name ?? '',
                    'city_id' => $data['address']['city_id'],
                    'city_name' => $city->name ?? '',
                    'district_id' => $data['address']['district_id'],
                    'district_name' => $district->name ?? '',
                ]);
                $addressId = $address->id;

                $costs = $destinationService->getShippingCost([
                    'destination' => $data['address']['district_id'],
                    'courier' => $data['courier']['code']
                ], $userId);

                $selectedCost = collect($costs)->firstWhere('service', $data['courier']['service']);
                
                if (!$selectedCost) {
                    throw new \Exception('Layanan pengiriman tidak valid');
                }

                $shippingCost = $selectedCost['cost'];
                $selectedShippingData = [
                    'courier_name' => $selectedCost['name'],
                    'courier_code' => $selectedCost['code'],
                    'courier_service' => $selectedCost['service'],
                    'etd' => $selectedCost['etd'],
                ];
            }

            // --- 3. CREATE ORDER ---
            $order = Order::create([
                'user_id' => $userId,
                'invoice_number' => $this->generateInvoiceNumber(),
                'status' => 'pending',
                'is_paid' => false,
                'shipping_method' => $data['shipping_method'],
                'order_source' => 'web',
                'address_id' => $addressId,
                'shipping_cost' => $shippingCost,
                'total_amount' => 0, 
                'notes' => $data['notes'] ?? null,
                'schedule' => Carbon::now('Asia/Jakarta')->addDays(1), 
            ]);

            if ($data['shipping_method'] === 'delivery' && isset($selectedShippingData)) {
                Shipment::create(array_merge($selectedShippingData, [
                    'order_id' => $order->id,
                    'tracking_number' => null, // Will be filled later
                ]));
            }

            $totalAmount = 0;

            // --- 4. MOVE ITEMS & CUSTOM DETAILS ---
            foreach ($cart->items as $item) {
                $unitPrice = !$item->is_custom 
                    ? ($item->product->price ?? 0)
                    : ($item->customDetail->service_fee ?? 0);

                $subtotal = $unitPrice * $item->quantity;
                $totalAmount += $subtotal;

                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'is_custom' => $item->is_custom,
                    'quantity' => $item->quantity,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                ]);

                if ($item->is_custom && $item->customDetail) {
                    $newDetail = $item->customDetail->replicate();
                    $newDetail->cart_item_id = null;
                    $newDetail->order_item_id = $orderItem->id;
                    $newDetail->save();

                    // Copy materials
                    foreach ($item->customDetail->materials as $mat) {
                        $newMat = $mat->replicate();
                        $newMat->custom_item_detail_id = $newDetail->id;
                        $newMat->save();
                    }
                }
            }

            $order->update([
                'total_amount' => $totalAmount + $shippingCost,
            ]);

            // --- 5. CLEAR CART ---
            $cart->items()->each(function($item) {
                if ($item->customDetail) {
                    $item->customDetail->materials()->delete();
                    $item->customDetail->delete();
                }
                $item->delete();
            });

            return $order;
        });
    }

    public function create (array $data)
    {
        return DB::transaction(function () use ($data) {
            // --- 1. VALIDASI STOK (PRE-CHECK) ---
            if ($data['is_paid']) {
                $requiredMaterials = [];
                foreach ($data['items'] as $item) {
                    if (!$item['is_custom']) {
                        $product = Product::with('materials')->findOrFail($item['product']['id']);
                        foreach ($product->materials as $mat) {
                            $materialId = $mat->id;
                            $quantityNeeded = $mat->pivot->quantity * $item['quantity'];
                            
                            if (!isset($requiredMaterials[$materialId])) {
                                $requiredMaterials[$materialId] = [
                                    'id' => $materialId,
                                    'quantity' => 0,
                                    'name' => $mat->name,
                                    'sources' => []
                                ];
                            }
                            $requiredMaterials[$materialId]['quantity'] += $quantityNeeded;
                            $requiredMaterials[$materialId]['sources'][] = [
                                'product_name' => $product->name,
                                'quantity' => $quantityNeeded
                            ];
                        }
                    }
                }

                if (!empty($requiredMaterials)) {
                    $materialService = app(MaterialService::class);
                    $materialService->checkStockAvailability($requiredMaterials);
                }
            }

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
                'invoice_number'  => $this->generateInvoiceNumber(),
                'address_id'      => $address->id,
                'status'          => "process",
                'is_paid'         => $data['is_paid'],
                'paid_at'         => $data['is_paid'] ? now() : null,
                'shipping_method' => $data['shipping_method'],
                'order_source'    => 'store',
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

                $orderItem = OrderItem::create([
                    'order_id'           => $order->id,
                    'product_id'         => $item['product']['id'] ?? null,
                    'is_custom'          => $item['is_custom'],
                    'quantity'           => $item['quantity'],
                    'unit_price'         => $unitPrice,
                    'subtotal'           => $subtotal,
                ]);

                if ($item['is_custom']) {
                    CustomItemDetail::create([
                        'order_item_id' => $orderItem->id,
                        'name'          => $item['custom_name'],
                        'description'   => $item['custom_description'],
                        'service_fee'   => $unitPrice, // Assuming unit price is the service fee for admin entries
                    ]);
                }
            }

            $order->update([
                'total_amount' => $totalAmount,
            ]);

            if ($data['is_paid']) {
                $this->deductMaterialsForOrder($order);

                CashTransaction::create([
                    'type'             => 'income',
                    'category'         => 'order',
                    'payment_method'   => 'cash',
                    'amount'           => $totalAmount,
                    'transaction_date' => now(),
                    'notes'            => "Pembayaran pesanan dari {$data['customer_name']} (Invoice: {$order->invoice_number})",
                    'created_by'       => auth()->id(),
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
            $isPaid = isset($data['is_paid']) ? (bool)$data['is_paid'] : $wasPaid;
            
            // For update, we might only update the main order details
            $order->update($data);

            if ($order->address) {
                $order->address->update([
                    'customer_name' => $data['customer_name'] ?? $order->address->customer_name,
                    'whatsapp_number' => $data['whatsapp_number'] ?? $order->address->whatsapp_number,
                    'address_detail' => $data['address'] ?? $order->address->address_detail,
                ]);
            }

            if (!$wasPaid && $isPaid) {
                $order->update(['paid_at' => now(), 'is_paid' => true]);
                
                $this->deductMaterialsForOrder($order);
                
                CashTransaction::create([
                    'type'             => 'income',
                    'category'         => 'order',
                    'payment_method'   => 'cash',
                    'amount'           => $order->total_amount,
                    'transaction_date' => now(),
                    'notes'            => "Pembayaran pesanan dari {$order->address->customer_name} (Invoice: {$order->invoice_number})",
                    'created_by'       => auth()->id(),
                ]);
            }
            elseif ($wasPaid && !$isPaid) {
                $order->update(['paid_at' => null, 'is_paid' => false]);
                CashTransaction::where('type', 'income')
                    ->where('category', 'order')
                    ->where('notes', 'like', "%(Invoice: {$order->invoice_number})%")
                    ->delete();
            }

            return $order;
        });
    }

    /**
     * Kurangi stok bahan untuk seluruh isi pesanan.
     */
    public function deductMaterialsForOrder(Order $order)
    {
        $materialService = app(MaterialService::class);
        $order->load(['orderItems.product.materials', 'orderItems.customDetail.materials.material']);

        foreach ($order->orderItems as $item) {
            if (!$item->is_custom) {
                // Regular Product
                if ($item->product) {
                    foreach ($item->product->materials as $mat) {
                        $quantityToDeduct = $mat->pivot->quantity * $item->quantity;
                        $materialService->deductStockFEFO(
                            $mat->id, 
                            $quantityToDeduct, 
                            "Pesanan #{$order->id} (Produk: {$item->product->name})"
                        );
                    }
                }
            } else {
                // Custom Item
                if ($item->customDetail) {
                    foreach ($item->customDetail->materials as $customMat) {
                        $quantityToDeduct = $customMat->quantity * $item->quantity;
                        $materialService->deductStockFEFO(
                            $customMat->material_id, 
                            $quantityToDeduct, 
                            "Pesanan #{$order->id} (Custom Item: {$item->customDetail->name})"
                        );
                    }
                }
            }
        }
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
        $order = Order::select()->with(['orderItems.product', 'address.province', 'address.city', 'address.district'])->findOrFail($id);

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

    private function generateInvoiceNumber(): string
    {
        $now = Carbon::now('Asia/Jakarta');
        $year = $now->year;
        $month = $now->month;

        $counter = OrderCounter::where('year', $year)
            ->where('month', $month)
            ->lockForUpdate()
            ->first();

        if (!$counter) {
            $counter = OrderCounter::create([
                'year' => $year,
                'month' => $month,
                'current_count' => 1,
            ]);
        } else {
            $counter->increment('current_count');
        }

        $formattedYearMonth = $now->format('ym'); // e.g., 2604
        $formattedCount = str_pad($counter->current_count, 4, '0', STR_PAD_LEFT); // e.g., 0001

        return "SLM-{$formattedYearMonth}-{$formattedCount}";
    }
}