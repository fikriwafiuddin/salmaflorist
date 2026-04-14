<?php

namespace App\Http\Requests\Cart;

use Illuminate\Foundation\Http\FormRequest;

class CartRequestAddItem extends FormRequest
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
            'product_id' => 'nullable|integer|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'is_custom' => 'required',
            'name' => 'nullable|string|max:25',
            'description' => 'nullable|string|max:300',
            'materials' => 'nullable|array',
            'materials.*.material_id' => 'required|integer|exists:materials,id',
            'materials.*.quantity' => 'required|integer|min:1',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if ($this->is_custom == 1) {
                if (empty($this->name)) {
                    $validator->errors()->add('name', 'Nama custom wajib diisi');
                }

                if (empty($this->description)) {
                    $validator->errors()->add('description', 'Deskripsi custom wajib diisi');
                }

                if (empty($this->materials)) {
                    $validator->errors()->add('materials', 'Bahan custom wajib dipilih setidaknya satu');
                }
            }

            if ($this->is_custom == 0) {
                if (empty($this->product_id)) {
                    $validator->errors()->add('product_id', 'ID produk wajib jika item bukan custom.');
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'product_id.integer' => 'ID produk harus berupa angka.',
            'product_id.exists' => 'ID produk yang dipilih tidak ditemukan.',
            'quantity.required' => 'Jumlah item wajib diisi.',
            'quantity.integer' => 'Jumlah item harus berupa angka.',
            'quantity.min' => 'Jumlah item minimal 1.',
            'is_custom.boolean' => 'Field is_custom harus berupa true atau false.',
            'custom_name.string' => 'Nama custom harus berupa string.',
            'custom_name.max' => 'Nama custom tidak boleh lebih dari 25 karakter.',
            'custom_description.string' => 'Deskripsi custom harus berupa string.',
            'custom_description.max' => 'Deskripsi custom tidak boleh lebih dari 300 karakter.',
            'unit_price.integer' => 'Harga custom harus berupa angka.',
            'unit_price.min' => 'Harga custom minimal 1.',
        ];
    }
}
