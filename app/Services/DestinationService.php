<?php

namespace App\Services;

use Http;
use App\Services\CartService;

class DestinationService
{
    private $cartService;
    public function __construct(CartService $cartService) {
        $this->cartService = $cartService;
    }
    public function getProvinces()
    {
        return \App\Models\Province::all();
    }

    public function getCities($provinceId)
    {
        return \App\Models\City::where('province_id', $provinceId)->get();
    }

    public function getDistricts($cityId)
    {
        return \App\Models\District::where('city_id', $cityId)->get();
    }

    public function getSubdistricts($cityId)
    {
        return \App\Models\District::where('city_id', $cityId)->get();
    }

    public function getShippingCost($data, $userId)
    {
        $cart = $this->cartService->getByUserId($userId);
        $totalweight = $cart->items->sum(function ($item) {
            return ($item->product->weight ?? 0) * $item->quantity;
        });

        if ($totalweight <= 0) {
            $totalweight = 1000;
        }

        try {
            $response = Http::withHeaders([
                'key' => config('app.rajaongkir_api_key'),
                'accept' => 'application/json',
            ])->withOptions([
                'query' => [
                    'origin' => 2893,
                    'destination' => $data['destination'],
                    'weight' => $totalweight,
                    'courier' => $data['courier'],
                ]
            ])->post('https://rajaongkir.komerce.id/api/v1/calculate/district/domestic-cost');
            return $response->json()['data'];
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }
}