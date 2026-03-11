<?php

namespace App\Http\Requests\Cart;

use Illuminate\Foundation\Http\FormRequest;
use Auth;

class CartRequestUpdateQuantity extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'quantity' => 'sometimes|integer|min:1',
            'custom_name' => 'sometimes|string|max:255',
            'custom_description' => 'sometimes|nullable|string',
            'unit_price' => 'sometimes|numeric|min:0',
        ];
    }
}
