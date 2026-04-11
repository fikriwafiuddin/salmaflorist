<?php

namespace App\Http\Requests\products;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequestUpdate extends FormRequest
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
            'name' => 'required|string|min:3|max:55',
            'price' => 'required|numeric|min:1',
            'weight' => 'required|numeric|min:1',
            'description' => 'required|string',
            'image' => 'file|max:2048|mimes:png,jpg,jpeg,webp|nullable',
            'category_id' => 'required|exists:categories,id',
            'materials' => 'required|array|min:1',
            'materials.*.id' => 'required|exists:materials,id',
            'materials.*.quantity' => 'required|numeric|min:1',
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
            'name.required' => 'Kolom nama harus diisi.',
            'name.string' => 'Kolom nama harus berupa string.',
            'name.min' => 'Kolom nama harus minimal 3 karakter.',
            'name.max' => 'Kolom nama tidak boleh lebih dari 25 karakter.',
            'price.required' => 'Kolom harga harus diisi.',
            'price.numeric' => 'Kolom harga harus berupa angka.',
            'price.min' => 'Kolom harga harus berupa angka positif.',
            'weight.required' => 'Kolom bobot harus diisi.',
            'weight.numeric' => 'Kolom bobot harus berupa angka.',
            'weight.min' => 'Kolom bobot harus berupa angka positif.',
            'description.required' => 'Kolom deskripsi harus diisi.',
            'description.string' => 'Kolom deskripsi harus berupa string.',
            'image.file' => 'Kolom gambar harus berupa file.',
            'image.max' => 'Kolom gambar tidak boleh lebih dari 2 MB.',
            'image.mimes' => 'Kolom gambar hanya bisa menggunakan format png, jpg, jpeg, dan webp.',
            'category_id.required' => 'Kolom kategori harus diisi.',
            'category_id.exists' => 'ID kategori yang dipilih tidak valid.',
            'materials.required' => 'Minimal satu bahan harus ditambahkan.',
            'materials.array' => 'Data bahan tidak valid.',
            'materials.min' => 'Harus ada setidaknya satu bahan.',
            'materials.*.id.required' => 'Bahan harus dipilih.',
            'materials.*.id.exists' => 'Bahan yang dipilih tidak valid.',
            'materials.*.quantity.required' => 'Jumlah bahan harus diisi.',
            'materials.*.quantity.numeric' => 'Jumlah bahan harus berupa angka.',
            'materials.*.quantity.min' => 'Jumlah bahan minimal 1.',
        ];
    }
}
