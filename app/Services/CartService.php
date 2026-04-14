<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\CustomItemDetail;
use App\Models\CustomItemMaterial;
use App\Models\Product;

class CartService
{
    public function create(array $data)
    {
        return Cart::create($data);
    }

    public function update(array $data, int $id)
    {
        $cart = Cart::findOrFail($id);

        return $cart->update($data);
    }

    public function destroy($id)
    {
        $cart = Cart::findOrFail($id);

        return $cart->delete();
    }

    public function destroyItem($id)
    {
        $cartItem = CartItem::findOrFail($id);

        return $cartItem->delete();
    }

    public function updateItemQuantity($id, $quantity)
    {
        $cartItem = CartItem::findOrFail($id);

        return $cartItem->update([
            'quantity' => $quantity,
        ]);
    }

    public function updateItem($id, array $data)
    {
        $cartItem = CartItem::findOrFail($id);

        return $cartItem->update($data);
    }

    public function getAll()
    {
        return Cart::all();
    }

    public function selectById(int $id)
    {
        return Cart::findOrFail($id);
    }

    public function getByUserId(int $userId)
    {
        return Cart::firstOrCreate(['user_id' => $userId])
            ->load('items.product', 'items.customDetail.materials.material');
    }

    public function addToCart(array $data)
    {
        return \DB::transaction(function () use ($data) {
            $cart = $this->getByUserId($data['user_id']);

            if ($data['is_custom'] == 0) {
                $cartItem = CartItem::where('cart_id', $cart->id)
                    ->where('product_id', $data['product_id'])
                    ->first();

                if ($cartItem) {
                    return $cartItem->update([
                        'quantity' => $cartItem->quantity + $data['quantity'],
                    ]);
                }

                Product::findOrFail($data['product_id']);

                return CartItem::create([
                    'cart_id' => $cart->id,
                    'product_id' => $data['product_id'],
                    'quantity' => $data['quantity'],
                    'is_custom' => $data['is_custom'],
                ]);
            }

            if ($data['is_custom'] == 1) {
                $cartItem = CartItem::create([
                    'cart_id' => $cart->id,
                    'is_custom' => $data['is_custom'],
                    'quantity' => $data['quantity'],
                ]);

                $customDetail = CustomItemDetail::create([
                    'cart_item_id' => $cartItem->id,
                    'name' => $data['name'],
                    'description' => $data['description'],
                    'service_fee' => 50000,
                ]);

                if (isset($data['materials']) && is_array($data['materials'])) {
                    foreach ($data['materials'] as $mat) {
                        CustomItemMaterial::create([
                            'custom_item_detail_id' => $customDetail->id,
                            'material_id' => $mat['material_id'],
                            'quantity' => $mat['quantity'],
                        ]);
                    }
                }

                return $cartItem;
            }
        });
    }
}