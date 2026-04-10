<?php

namespace App\Http\Requests\Materials;

use Illuminate\Foundation\Http\FormRequest;

class StoreBatchStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'supplier'            => 'required|string|max:25',
            'payment_method'      => 'required|in:cash,transfer,qris',
            'items'               => 'required|array|min:1',
            'items.*.material_id' => 'required|exists:materials,id',
            'items.*.quantity'    => 'required|integer|min:1',
            'items.*.price'       => 'required|integer|min:1',
            'items.*.expired_date'=> 'nullable|date|after_or_equal:today',
        ];
    }

    public function messages(): array
    {
        return [
            'supplier.required'            => 'Supplier harus diisi.',
            'supplier.max'                 => 'Supplier tidak boleh lebih dari 25 karakter.',
            'payment_method.required'      => 'Metode pembayaran harus dipilih.',
            'payment_method.in'            => 'Metode pembayaran tidak valid.',
            'items.required'               => 'Item kulakan tidak boleh kosong.',
            'items.min'                    => 'Minimal harus ada 1 item kulakan.',
            'items.*.material_id.required' => 'Bahan harus dipilih.',
            'items.*.material_id.exists'   => 'Bahan tidak valid.',
            'items.*.quantity.required'    => 'Jumlah harus diisi.',
            'items.*.quantity.min'         => 'Jumlah minimal 1.',
            'items.*.price.required'       => 'Harga harus diisi.',
            'items.*.price.min'            => 'Harga minimal 1.',
            'items.*.expired_date.date'    => 'Format tanggal kadaluarsa tidak valid.',
            'items.*.expired_date.after_or_equal' => 'Tanggal kadaluarsa tidak boleh di masa lalu.',
        ];
    }
}
