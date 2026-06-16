<?php

namespace App\Services;

use App\Models\Category;
use App\Models\User;

class CategoryService
{
    public function create(array $data)
    {
        return Category::create($data);
    }

    public function update(array $data, int $id)
    {
        $category = Category::findOrFail($id);

        return $category->update($data);
    }

    public function destroy($id)
    {
        $category = Category::findOrFail($id);

        // Check if category has related products
        if ($category->products()->count() > 0) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'products' => 'Kategori tidak dapat dihapus karena masih ada produk yang terkait.',
            ]);
        }

        return $category->delete();
    }

    public function getAll()
    {
        return Category::all(["id", "name"]);
    }

    public function selectById(int $id)
    {
        return Category::findOrFail($id);
    }
}