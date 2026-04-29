import FormCustomItem from '@/components/shared/FormCustomItem';
import { Button } from '@/components/ui/button';
import { destroy } from '@/routes/user/cart';
import { Cart, Material } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Edit2,
    InfoIcon,
    Minus,
    Plus,
    PlusCircle,
    ShoppingCart,
    Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function formatRupiah(amount: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

type CartPageProps = {
    cart: Cart;
    materials: Material[];
};

export default function CartPage({ cart, materials }: CartPageProps) {
    const [localQuantities, setLocalQuantities] = useState<
        Record<number, number>
    >(Object.fromEntries(cart.items.map((item) => [item.id, item.quantity])));

    const timeoutRef = useRef<Record<number, NodeJS.Timeout>>({});

    useEffect(() => {
        return () => {
            Object.values(timeoutRef.current).forEach((timeout) =>
                clearTimeout(timeout),
            );
        };
    }, []);

    const updateQuantity = (newQuantity: number, itemId: number) => {
        if (newQuantity < 1) return;

        setLocalQuantities((prev) => ({ ...prev, [itemId]: newQuantity }));

        if (timeoutRef.current[itemId]) {
            clearTimeout(timeoutRef.current[itemId]);
        }

        timeoutRef.current[itemId] = setTimeout(() => {
            router.patch(
                `/cart/${itemId}`,
                { quantity: newQuantity },
                {
                    preserveScroll: true,
                    onFinish: () => {
                        delete timeoutRef.current[itemId];
                    },
                },
            );
        }, 500);
    };

    const deleteItem = (id: number) => {
        router.delete(destroy(id));
    };

    const totalAmount = cart.items.reduce((total, item) => {
        const price =
            item.product?.price ||
            (item.custom_detail?.service_fee || 0) +
                (item.custom_detail?.materials?.reduce(
                    (acc, material) =>
                        acc + material.material.price * material.quantity,
                    0,
                ) || 0) ||
            0;
        return total + price * item.quantity;
    }, 0);

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
                            <span>{cart.items.length} produk</span>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-6xl px-4 py-8">
                    {/* Breadcrumb */}
                    <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                        <a href="/" className="hover:text-primary">
                            Beranda
                        </a>
                        <span>/</span>
                        <span className="font-medium text-foreground">
                            Keranjang
                        </span>
                    </nav>

                    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <h1 className="font-playfair-display text-3xl font-bold text-foreground">
                            Keranjang Belanja
                        </h1>

                        <FormCustomItem
                            type="ADD"
                            availableMaterials={materials}
                        >
                            <Button
                                variant="outline"
                                className="gap-2 rounded-xl border-primary text-primary transition-all hover:scale-105 hover:bg-primary/5 active:scale-95"
                            >
                                <PlusCircle className="h-4 w-4" />
                                Tambah Item Custom
                            </Button>
                        </FormCustomItem>
                    </div>

                    {cart.items.length === 0 ? (
                        /* ── Empty state ─────────────────────────────── */
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-pink-50">
                                <ShoppingCart className="h-12 w-12 text-primary/40" />
                            </div>
                            <h2 className="mb-2 text-xl font-semibold">
                                Keranjang kamu masih kosong
                            </h2>
                            <p className="mb-6 text-muted-foreground">
                                Yuk, temukan rangkaian bunga cantik pilihan kamu
                                atau buat pesanan kustom!
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Button asChild className="rounded-xl">
                                    <a href="/catalog">
                                        Lihat Katalog{' '}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </a>
                                </Button>
                                <FormCustomItem
                                    type="ADD"
                                    availableMaterials={materials}
                                >
                                    <Button
                                        variant="secondary"
                                        className="rounded-xl"
                                    >
                                        Buat Pesanan Kustom
                                    </Button>
                                </FormCustomItem>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* ── Cart Items ───────────────────────────── */}
                            <div className="space-y-4 lg:col-span-2">
                                {cart.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="group relative flex gap-4 rounded-2xl border border-pink-100 bg-white p-4 shadow-sm transition-all hover:shadow-md"
                                    >
                                        {/* Product image / Custom Icon */}
                                        <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-pink-50 transition-transform group-hover:scale-105">
                                            {item.is_custom ? (
                                                <div className="flex flex-col items-center">
                                                    <PlusCircle className="h-8 w-8 text-primary/40" />
                                                    <span className="mt-1 text-[10px] font-bold tracking-wider text-primary/40 uppercase">
                                                        Custom
                                                    </span>
                                                </div>
                                            ) : (
                                                <img
                                                    src={`/storage/${item.product?.image}`}
                                                    alt={item.product?.name}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        (
                                                            e.target as HTMLImageElement
                                                        ).src =
                                                            `https://placehold.co/96x96/fce7f3/be185d?text=🌸`;
                                                    }}
                                                />
                                            )}
                                        </div>

                                        {/* Product info */}
                                        <div className="flex flex-1 flex-col justify-between">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <span className="mb-0.5 inline-block rounded-full bg-pink-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-primary uppercase">
                                                        {item.is_custom
                                                            ? 'Custom Order'
                                                            : item.product
                                                                  ?.category
                                                                  ?.name ||
                                                              'Produk'}
                                                    </span>
                                                    <h3 className="font-playfair-display text-lg font-bold text-foreground">
                                                        {item.is_custom
                                                            ? item.custom_detail
                                                                  ?.name
                                                            : item.product
                                                                  ?.name}
                                                    </h3>
                                                    {item.is_custom == 1 && (
                                                        <div className="mt-1 space-y-1">
                                                            <p className="flex max-w-[200px] items-center gap-1 truncate text-xs text-muted-foreground italic">
                                                                <InfoIcon className="h-3 w-3" />{' '}
                                                                {
                                                                    item
                                                                        .custom_detail
                                                                        ?.description
                                                                }
                                                            </p>
                                                            {item.custom_detail
                                                                ?.materials && (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {item.custom_detail.materials.map(
                                                                        (
                                                                            m,
                                                                            idx,
                                                                        ) => (
                                                                            <span
                                                                                key={
                                                                                    idx
                                                                                }
                                                                                className="rounded-md border border-pink-100 bg-pink-50 px-1.5 py-0.5 text-[9px] text-primary"
                                                                            >
                                                                                {
                                                                                    m
                                                                                        .material
                                                                                        .name
                                                                                }{' '}
                                                                                (
                                                                                {
                                                                                    m.quantity
                                                                                }

                                                                                )
                                                                            </span>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-1">
                                                    {item.is_custom == 1 && (
                                                        <FormCustomItem
                                                            type="UPDATE"
                                                            id={item.id}
                                                            customItem={item}
                                                            availableMaterials={
                                                                materials
                                                            }
                                                        >
                                                            <button
                                                                className="rounded-lg p-1.5 text-muted-foreground transition-all hover:bg-pink-50 hover:text-primary active:scale-90"
                                                                aria-label="Edit item kustom"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </button>
                                                        </FormCustomItem>
                                                    )}
                                                    <button
                                                        onClick={() =>
                                                            deleteItem(item.id)
                                                        }
                                                        className="rounded-lg p-1.5 text-muted-foreground transition-all hover:bg-red-50 hover:text-red-500 active:scale-90"
                                                        aria-label="Hapus produk"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-bold text-primary">
                                                    {formatRupiah(
                                                        item?.product?.price ||
                                                            (item.custom_detail
                                                                ?.service_fee ||
                                                                0) +
                                                                (item.custom_detail?.materials?.reduce(
                                                                    (
                                                                        acc,
                                                                        material,
                                                                    ) =>
                                                                        acc +
                                                                        material
                                                                            .material
                                                                            .price *
                                                                            material.quantity,
                                                                    0,
                                                                ) || 0),
                                                    )}
                                                </span>

                                                {/* Qty controls */}
                                                <div className="flex items-center gap-2 rounded-xl border border-pink-200 bg-pink-50/50 px-1 py-1">
                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                (localQuantities[
                                                                    item.id
                                                                ] ||
                                                                    item.quantity) -
                                                                    1,
                                                                item.id,
                                                            )
                                                        }
                                                        className="flex h-7 w-7 items-center justify-center rounded-lg text-primary transition-all hover:bg-primary hover:text-white active:scale-90"
                                                    >
                                                        <Minus className="h-3.5 w-3.5" />
                                                    </button>
                                                    <span className="w-6 text-center text-sm font-bold">
                                                        {localQuantities[
                                                            item.id
                                                        ] || item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                (localQuantities[
                                                                    item.id
                                                                ] ||
                                                                    item.quantity) +
                                                                    1,
                                                                item.id,
                                                            )
                                                        }
                                                        className="flex h-7 w-7 items-center justify-center rounded-lg text-primary transition-all hover:bg-primary hover:text-white active:scale-90"
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
                                    className="inline-flex items-center gap-2 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Lanjut belanja
                                </a>
                            </div>

                            {/* ── Order Summary ────────────────────────── */}
                            <div className="h-fit rounded-2xl border border-pink-100 bg-white p-6 shadow-sm lg:sticky lg:top-24">
                                <h2 className="mb-5 font-playfair-display text-xl font-bold text-foreground">
                                    Ringkasan Pesanan
                                </h2>

                                <div className="space-y-3 text-sm">
                                    {cart.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex justify-between text-muted-foreground"
                                        >
                                            <span className="flex-1 truncate pr-2">
                                                {item.is_custom
                                                    ? item.custom_detail?.name
                                                    : item.product?.name}{' '}
                                                × {item.quantity}
                                            </span>
                                            <span className="font-medium text-foreground">
                                                {formatRupiah(
                                                    (item.product?.price ||
                                                        (item.custom_detail
                                                            ?.service_fee ||
                                                            0) +
                                                            (item.custom_detail?.materials?.reduce(
                                                                (
                                                                    acc,
                                                                    material,
                                                                ) =>
                                                                    acc +
                                                                    material
                                                                        .material
                                                                        .price *
                                                                        material.quantity,
                                                                0,
                                                            ) || 0) ||
                                                        0) * item.quantity,
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="my-5 border-t border-dashed border-pink-100" />

                                <div className="flex justify-between font-bold">
                                    <span className="text-lg">Subtotal</span>
                                    <span className="text-xl text-primary">
                                        {formatRupiah(totalAmount)}
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Belum termasuk biaya pengiriman
                                </p>

                                <Button
                                    className="mt-8 w-full gap-2 rounded-xl py-6 text-lg font-bold shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]"
                                    size="lg"
                                    asChild
                                >
                                    <Link href="/checkout">
                                        Lanjut ke Checkout{' '}
                                        <ArrowRight className="h-5 w-5" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
