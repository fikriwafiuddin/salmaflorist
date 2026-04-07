<?php

namespace App\Http\Requests\Materials;

use Illuminate\Foundation\Http\FormRequest;

class MaterialRestockRequest extends FormRequest
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
            'quantity'       => 'required|integer|min:1',
            'price_per_unit' => 'required|integer|min:0',
            'expired_at'     => 'nullable|date|after:today',
            'notes'          => 'nullable|string|max:255',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'quantity.required'       => 'Jumlah restok harus diisi.',
            'quantity.integer'        => 'Jumlah restok harus berupa bilangan bulat.',
            'quantity.min'            => 'Jumlah restok minimal 1.',
            'price_per_unit.required' => 'Harga per unit harus diisi.',
            'price_per_unit.integer'  => 'Harga per unit harus berupa angka.',
            'price_per_unit.min'      => 'Harga per unit tidak boleh negatif.',
            'expired_at.date'         => 'Tanggal kadaluarsa tidak valid.',
            'expired_at.after'        => 'Tanggal kadaluarsa harus setelah hari ini.',
            'notes.max'               => 'Catatan tidak boleh lebih dari 255 karakter.',
        ];
    }
}
