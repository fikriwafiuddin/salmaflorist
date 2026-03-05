import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Minus,
    Plus,
    ShoppingCart,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

// Mock cart items – will be replaced with real state/backend data
const initialCartItems = [
    {
        id: 1,
        name: 'Buket Mawar Merah',
        price: 185000,
        quantity: 1,
        image: '/images/product-placeholder.jpg',
        category: 'Buket',
    },
    {
        id: 2,
        name: 'Hand Bouquet Sunflower',
        price: 230000,
        quantity: 2,
        image: '/images/product-placeholder.jpg',
        category: 'Hand Bouquet',
    },
    {
        id: 3,
        name: 'Flower Box Premium',
        price: 320000,
        quantity: 1,
        image: '/images/product-placeholder.jpg',
        category: 'Flower Box',
    },
];

function formatRupiah(amount: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

export default function CartPage() {
    const [cartItems, setCartItems] = useState(initialCartItems);

    const updateQty = (id: number, delta: number) => {
        setCartItems((prev) =>
            prev.map((item) =>
                item.id === id
                    ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                    : item,
            ),
        );
    };

    const removeItem = (id: number) => {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
    };

    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );

    return (
        <>
            <Head title="Keranjang Belanja – Salma Florist" />

            {/* ── Page wrapper ─────────────────────────────────────── */}
            <div className="min-h-screen bg-[oklch(0.9789_0.0128_345.48)]">
                {/* ── Top bar ───────────────────────────────────────── */}
                <header className="sticky top-0 z-30 border-b border-pink-100 bg-white/80 backdrop-blur-md">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                        <Link href="/" className="flex items-center gap-2">
                            <img
                                src="/logo.png"
                                alt="Salma Florist"
                                className="h-8 w-8 rounded-md object-cover"
                            />
                            <span className="font-playfair-display text-lg font-semibold text-primary">
                                Salma Florist
                            </span>
                        </Link>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ShoppingCart className="h-4 w-4" />
                            <span>{cartItems.length} produk</span>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-6xl px-4 py-8">
                    {/* Breadcrumb */}
                    <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-primary">
                            Beranda
                        </Link>
                        <span>/</span>
                        <span className="font-medium text-foreground">
                            Keranjang
                        </span>
                    </nav>

                    <h1 className="mb-8 font-playfair-display text-3xl font-bold text-foreground">
                        Keranjang Belanja
                    </h1>

                    {cartItems.length === 0 ? (
                        /* ── Empty state ─────────────────────────────── */
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-pink-50">
                                <ShoppingCart className="h-12 w-12 text-primary/40" />
                            </div>
                            <h2 className="mb-2 text-xl font-semibold">
                                Keranjang kamu masih kosong
                            </h2>
                            <p className="mb-6 text-muted-foreground">
                                Yuk, temukan rangkaian bunga cantik pilihan
                                kamu!
                            </p>
                            <Button asChild>
                                <Link href="/catalog">
                                    Lihat Katalog{' '}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* ── Cart Items ───────────────────────────── */}
                            <div className="space-y-4 lg:col-span-2">
                                {cartItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-4 rounded-2xl border border-pink-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                                    >
                                        {/* Product image */}
                                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-pink-50">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    (
                                                        e.target as HTMLImageElement
                                                    ).src =
                                                        `https://placehold.co/96x96/fce7f3/be185d?text=🌸`;
                                                }}
                                            />
                                        </div>

                                        {/* Product info */}
                                        <div className="flex flex-1 flex-col justify-between">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <span className="mb-0.5 inline-block rounded-full bg-pink-50 px-2 py-0.5 text-xs text-primary">
                                                        {item.category}
                                                    </span>
                                                    <h3 className="font-semibold text-foreground">
                                                        {item.name}
                                                    </h3>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        removeItem(item.id)
                                                    }
                                                    className="ml-2 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500"
                                                    aria-label="Hapus produk"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-bold text-primary">
                                                    {formatRupiah(item.price)}
                                                </span>

                                                {/* Qty controls */}
                                                <div className="flex items-center gap-2 rounded-xl border border-pink-200 bg-pink-50/50 px-1 py-1">
                                                    <button
                                                        onClick={() =>
                                                            updateQty(
                                                                item.id,
                                                                -1,
                                                            )
                                                        }
                                                        className="flex h-7 w-7 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary hover:text-white"
                                                    >
                                                        <Minus className="h-3.5 w-3.5" />
                                                    </button>
                                                    <span className="w-6 text-center text-sm font-semibold">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            updateQty(
                                                                item.id,
                                                                1,
                                                            )
                                                        }
                                                        className="flex h-7 w-7 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary hover:text-white"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <a
                                    href="/catalog"
                                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Lanjut belanja
                                </a>
                            </div>

                            {/* ── Order Summary ────────────────────────── */}
                            <div className="h-fit rounded-2xl border border-pink-100 bg-white p-6 shadow-sm lg:sticky lg:top-24">
                                <h2 className="mb-5 font-playfair-display text-lg font-bold">
                                    Ringkasan Pesanan
                                </h2>

                                <div className="space-y-3 text-sm">
                                    {cartItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex justify-between text-muted-foreground"
                                        >
                                            <span className="flex-1 truncate pr-2">
                                                {item.name} × {item.quantity}
                                            </span>
                                            <span className="font-medium text-foreground">
                                                {formatRupiah(
                                                    item.price * item.quantity,
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="my-4 border-t border-dashed border-pink-100" />

                                <div className="flex justify-between font-semibold">
                                    <span>Subtotal</span>
                                    <span className="text-lg text-primary">
                                        {formatRupiah(subtotal)}
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Belum termasuk biaya pengiriman
                                </p>

                                <Button
                                    className="mt-6 w-full gap-2"
                                    size="lg"
                                    asChild
                                >
                                    <Link href="/checkout">
                                        Lanjut ke Checkout{' '}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>

                                <p className="mt-3 text-center text-xs text-muted-foreground">
                                    🔒 Pembayaran aman &amp; terenkripsi
                                </p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
