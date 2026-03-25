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
        try {
            $response = Http::withHeaders([
                'key' => config('app.rajaongkir_api_key'),
            ])->get('https://rajaongkir.komerce.id/api/v1/destination/province');


            return $response->json()['data'] ?? [];
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }

    public function getCities($provinceId)
    {
        try {
            $response = Http::withHeaders([
                'key' => config('app.rajaongkir_api_key'),
            ])->get('https://rajaongkir.komerce.id/api/v1/destination/city/' . $provinceId);

            return $response->json()['data'] ?? [];
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }

    public function getDistricts($cityId)
    {
        try {
            $response = Http::withHeaders([
                'key' => config('app.rajaongkir_api_key'),
            ])->get('https://rajaongkir.komerce.id/api/v1/destination/district/' . $cityId);

            return $response->json()['data'] ?? [];
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }

    public function getSubdistricts($cityId)
    {
        $response = Http::withHeaders([
            'key' => config('rajaongkir_api_key'),
        ])->get('https://rajaongkir.komerce.id/api/v1/destination/subdistrict?city=' . $cityId);

        return $response->json();
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