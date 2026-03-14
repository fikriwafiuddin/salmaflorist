<?php

namespace App\Http\Controllers;

use App\Http\Requests\Destination\ShippingCostRequest;
use App\Services\DestinationService;
use Illuminate\Http\Request;

class DestinationController extends Controller
{
    protected $destinationService;

    public function __construct(DestinationService $destinationService)
    {
        $this->destinationService = $destinationService;
    }

    public function getCities($provinceId)
    {
        $cities = $this->destinationService->getCities($provinceId);
        return response()->json($cities);
    }

    public function getDistricts($cityId)
    {
        $districts = $this->destinationService->getDistricts($cityId);
        return response()->json($districts);
    }

    public function getSubdistricts($cityId)
    {
        $subdistricts = $this->destinationService->getSubdistricts($cityId);
        return response()->json($subdistricts);
    }

    public function getShippingCost(ShippingCostRequest $request)
    {
        $shippingCosts = $this->destinationService->getShippingCost($request->validated());
        return response()->json($shippingCosts);
    }
}
