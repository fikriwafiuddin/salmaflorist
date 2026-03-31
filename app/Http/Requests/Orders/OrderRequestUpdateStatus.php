<?php

namespace App\Http\Requests\Orders;

use Illuminate\Foundation\Http\FormRequest;

class OrderRequestUpdateStatus extends FormRequest
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
            'status' => 'required|in:pending,paid,process,completed,canceled'
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $status = $this->status;
            $order = $this->route('order') ? \App\Models\Order::find($this->route('order')) : null;

            if ($order && !$order->is_paid && in_array($status, ['process', 'completed'])) {
                $validator->errors()->add('status', 'Status tidak bisa diubah ke Progres atau Selesai jika pesanan belum dibayar.');
            }
        });
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'status.required' => 'Status pesanan harus diisi.',
            'status.in' => 'Status tidak valid.',
        ];
    }
}
