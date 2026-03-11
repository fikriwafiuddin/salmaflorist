@props(['id', 'image', 'name', 'description', 'category', 'price'])

<div 
    x-data="{
        loading: false,
        async addToCart() {
            if (this.loading) return;
            this.loading = true;
            try {
                const response = await fetch('{{ route('user.cart.store') }}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': '{{ csrf_token() }}',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        product_id: {{ $id }},
                        quantity: 1,
                        is_custom: 0
                    })
                });
                
                const data = await response.json();
                console.log(data);
                
                if (response.ok) {
                    window.dispatchEvent(new CustomEvent('toast', { 
                        detail: { message: data.message, type: 'success' } 
                    }));
                } else {
                    window.dispatchEvent(new CustomEvent('toast', { 
                        detail: { message: data.message || 'Gagal menambahkan ke keranjang', type: 'error' } 
                    }));
                }
            } catch (error) {
                window.dispatchEvent(new CustomEvent('toast', { 
                    detail: { message: 'Terjadi kesalahan sistem', type: 'error' } 
                }));
            } finally {
                this.loading = false;
            }
        }
    }"
    class="rounded-xl border bg-card text-card-foreground shadow group overflow-hidden card-hover"
>
   <div class="relative overflow-hidden">
        <img
            alt="{{ $name }}"
            class="product-image group-hover:scale-110 transition-transform duration-300"
            src="/storage/{{ $image }}"
        >
        <div class="absolute top-2 left-2">
            <x-badge variant="secondary">{{ $category }}</x-badge>
        </div>
    </div>
    <div class="p-4">
        <h3 class="font-semibold text-lg mb-2 line-clamp-1">
            {{ $name }}
        </h3>
        <p class="text-sm text-muted-foreground mb-3 line-clamp-2">
            {{ $description }}
        </p>
        <div class="flex items-center justify-between">
            <span class="text-xl font-bold text-primary">
                Rp&nbsp;{{ Number::format($price, locale: 'id') }}
            </span>
        </div>
        <div class="grid sm:grid-cols-2 gap-2 pt-2">
            <a href="{{ route('user.catalog.show', $id) }}">
                <x-button
                    variant="outline"
                    class="w-full"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="size-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="lucide lucide-eye h-4 w-4 mr-2"
                        aria-hidden="true"
                    >
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    Detail
                </x-button>
            </a>
            
            <x-button
                variant="secondary"
                class="w-full"
                @click="addToCart()"
                ::disabled="loading"
            >
                <svg xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="size-5 inline"
                    x-show="!loading"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                <svg x-show="loading" class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24" style="display: none;">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span x-text="loading ? 'Loading...' : 'Keranjang'">Keranjang</span>
            </x-button>
        </div>
    </div>
</div>