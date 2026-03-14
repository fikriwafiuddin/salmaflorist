<?php

namespace App\Http\Requests\Destination;

use Illuminate\Foundation\Http\FormRequest;

class ShippingCostRequest extends FormRequest
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
            'destination' => 'required|integer',
            'courier' => 'required|string',
        ];
    }

    public function messages(): array
    {
        return [
            'destination.required' => 'Tujuan wajib diisi.',
            'destination.integer' => 'Tujuan harus berupa angka.',
            'courier.required' => 'Kurir wajib diisi.',
            'courier.string' => 'Kurir harus berupa teks.',
        ];
    }
}
