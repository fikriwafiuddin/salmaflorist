<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'shipping_method' => 'required|in:delivery,pickup',
            'notes' => 'nullable|string',
            // Address details (always required for recipient info)
            'address' => 'required|array',
            'address.customer_name' => 'required|string',
            'address.whatsapp_number' => 'required|string',
            'address.address_detail' => 'nullable|required_if:shipping_method,delivery|string',
            'address.province_id' => 'nullable|required_if:shipping_method,delivery',
            'address.city_id' => 'nullable|required_if:shipping_method,delivery',
            'address.district_id' => 'nullable|required_if:shipping_method,delivery',
            'address.notes' => 'nullable|string',

            // Courier details (required if delivery)
            'courier' => 'nullable|required_if:shipping_method,delivery|array',
            'courier.code' => 'nullable|required_if:shipping_method,delivery|string',
            'courier.service' => 'nullable|required_if:shipping_method,delivery|string',
        ];
    }
}
