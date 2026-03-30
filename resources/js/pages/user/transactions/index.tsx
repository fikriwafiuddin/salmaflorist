import { Head, Link, router } from '@inertiajs/react';
import axios, { AxiosError } from 'axios';
import {
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Circle,
    Clock,
    Package,
    ShoppingBag,
    Truck,
    XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        snap: any;
    }
}

// ── Types ──────────────────────────────────────────────────────────────────
type OrderStatus =
    | 'pending_payment'
    | 'payment_verified'
    | 'processing'
    | 'ready'
    | 'delivered'
    | 'cancelled';

interface OrderItem {
    name: string;
    qty: number;
    price: number;
}

interface Transaction {
    id: string;
    date: string;
    status: OrderStatus;
    shipping_method: 'delivery' | 'pickup';
    courier?: string;
    tracking?: string;
    items: OrderItem[];
    subtotal: number;
    shipping_cost: number;
    address?: string;
}

interface OrderItemModel {
    product?: { name: string };
    custom_name?: string;
    quantity: number;
    unit_price: number;
}

interface OrderModel {
    id: number;
    created_at: string;
    status: string;
    shipping_method: 'delivery' | 'pickup';
    courier_service?: { name: string; service: string };
    shipping_cost: number;
    address?: {
        address_detail: string;
        district_name: string;
        city_name: string;
        province_name: string;
    };
    order_items: OrderItemModel[];
}

// Removed mock data

// ── Stepper config ─────────────────────────────────────────────────────────
const STEPS_DELIVERY: {
    key: OrderStatus | string;
    label: string;
    icon: React.ElementType;
}[] = [
    { key: 'pending_payment', label: 'Menunggu Pembayaran', icon: Clock },
    {
        key: 'payment_verified',
        label: 'Pembayaran Diverifikasi',
        icon: CheckCircle2,
    },
    { key: 'processing', label: 'Sedang Diproses', icon: Package },
    { key: 'ready', label: 'Siap Dikirim', icon: ShoppingBag },
    { key: 'delivered', label: 'Terkirim', icon: Truck },
];

const STEPS_PICKUP: {
    key: OrderStatus | string;
    label: string;
    icon: React.ElementType;
}[] = [
    { key: 'pending_payment', label: 'Menunggu Pembayaran', icon: Clock },
    {
        key: 'payment_verified',
        label: 'Pembayaran Diverifikasi',
        icon: CheckCircle2,
    },
    { key: 'processing', label: 'Sedang Diproses', icon: Package },
    { key: 'ready', label: 'Siap Diambil', icon: ShoppingBag },
    { key: 'delivered', label: 'Selesai', icon: CheckCircle2 },
];

const STATUS_ORDER: OrderStatus[] = [
    'pending_payment',
    'payment_verified',
    'processing',
    'ready',
    'delivered',
];

const STATUS_LABELS: Record<OrderStatus, string> = {
    pending_payment: 'Menunggu Pembayaran',
    payment_verified: 'Pembayaran Diverifikasi',
    processing: 'Diproses',
    ready: 'Siap',
    delivered: 'Terkirim',
    cancelled: 'Dibatalkan',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
    pending_payment: 'bg-yellow-100 text-yellow-700',
    payment_verified: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    ready: 'bg-teal-100 text-teal-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-500',
};

// ── Helpers ────────────────────────────────────────────────────────────────
function formatRupiah(n: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(n);
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function CountdownTimer({ createdAt }: { createdAt: string }) {
    const targetDate = useMemo(
        () => new Date(new Date(createdAt).getTime() + 24 * 60 * 60 * 1000),
        [createdAt],
    );
    const [timeLeft, setTimeLeft] = useState<{
        h: number;
        m: number;
        s: number;
    } | null>(null);
    const [expired, setExpired] = useState(false);

    useEffect(() => {
        const calculate = () => {
            const now = new Date().getTime();
            const distance = targetDate.getTime() - now;

            if (distance < 0) {
                setExpired(true);
                setTimeLeft(null);
                return true;
            } else {
                setTimeLeft({
                    h: Math.floor(
                        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
                    ),
                    m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    s: Math.floor((distance % (1000 * 60)) / 1000),
                });
                return false;
            }
        };

        calculate();
        const timer = setInterval(() => {
            if (calculate()) clearInterval(timer);
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (expired)
        return <span className="font-semibold text-red-500">Kadaluarsa</span>;
    if (!timeLeft) return null;

    return (
        <span className="font-mono font-bold text-primary">
            {timeLeft.h.toString().padStart(2, '0')}:
            {timeLeft.m.toString().padStart(2, '0')}:
            {timeLeft.s.toString().padStart(2, '0')}
        </span>
    );
}

// ── Status Stepper ─────────────────────────────────────────────────────────
function StatusStepper({
    status,
    shippingMethod,
}: {
    status: OrderStatus;
    shippingMethod: 'delivery' | 'pickup';
}) {
    if (status === 'cancelled') {
        return (
            <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <XCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
                <div>
                    <p className="text-sm font-semibold text-red-600">
                        Pesanan Dibatalkan
                    </p>
                    <p className="text-xs text-red-400">
                        Pesanan ini tidak dapat dilanjutkan
                    </p>
                </div>
            </div>
        );
    }

    const steps = shippingMethod === 'delivery' ? STEPS_DELIVERY : STEPS_PICKUP;
    const currentIdx = STATUS_ORDER.indexOf(status);

    return (
        <div className="relative mt-1">
            {/* Connecting line */}
            <div className="absolute top-4 left-4 h-[calc(100%-2rem)] w-0.5 bg-pink-100" />

            <div className="space-y-4">
                {steps.map((step, idx) => {
                    const done = idx < currentIdx;
                    const active = idx === currentIdx;
                    const pending = idx > currentIdx;
                    const Icon = step.icon;

                    return (
                        <div
                            key={step.key}
                            className="relative flex items-start gap-4 pl-0"
                        >
                            {/* Node */}
                            <div
                                className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                                    done
                                        ? 'border-green-400 bg-green-400 text-white'
                                        : active
                                          ? 'border-primary bg-primary text-white shadow-md shadow-primary/30'
                                          : 'border-pink-200 bg-white text-pink-200'
                                }`}
                            >
                                {done ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                ) : active ? (
                                    <Icon className="h-4 w-4" />
                                ) : (
                                    <Circle className="h-4 w-4" />
                                )}
                            </div>

                            {/* Label */}
                            <div className="pt-0.5 pb-4">
                                <p
                                    className={`text-sm leading-tight font-medium ${
                                        pending
                                            ? 'text-muted-foreground'
                                            : 'text-foreground'
                                    }`}
                                >
                                    {step.label}
                                </p>
                                {active && (
                                    <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-primary">
                                        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                                        Status saat ini
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Transaction Card ───────────────────────────────────────────────────────
function TransactionCard({
    tx,
    onPay,
}: {
    tx: Transaction;
    onPay: (id: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const total = tx.subtotal + tx.shipping_cost;

    const isExpired = useMemo(() => {
        const targetDate = new Date(
            new Date(tx.date).getTime() + 24 * 60 * 60 * 1000,
        );
        return new Date() > targetDate;
    }, [tx.date]);

    return (
        <div
            className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md ${
                tx.status === 'cancelled' ? 'border-red-100' : 'border-pink-100'
            }`}
        >
            {/* ── Header ─────────────────────────────────────────── */}
            <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-foreground">
                            {tx.id}
                        </span>
                        <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[tx.status]}`}
                        >
                            {STATUS_LABELS[tx.status]}
                        </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDate(tx.date)}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-lg font-bold text-primary">
                        {formatRupiah(total)}
                    </p>
                    {tx.status === 'pending_payment' && !isExpired && (
                        <button
                            onClick={() => onPay(tx.id)}
                            className="mt-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-primary/90 focus:ring-2 focus:ring-primary/20"
                        >
                            Bayar Sekarang
                        </button>
                    )}
                </div>
            </div>

            {tx.status === 'pending_payment' && (
                <div className="flex items-center justify-between border-t border-dashed border-pink-100 bg-pink-50/30 px-5 py-2">
                    <span className="text-xs text-muted-foreground">
                        Sisa waktu pembayaran:
                    </span>
                    <CountdownTimer createdAt={tx.date} />
                </div>
            )}

            {/* ── Product preview ─────────────────────────────────── */}
            <div className="border-t border-dashed border-pink-100 px-5 py-3">
                <p className="text-xs text-muted-foreground">
                    {tx.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}
                </p>
            </div>

            {/* ── Toggle detail button ────────────────────────────── */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between bg-pink-50/60 px-5 py-2.5 text-xs font-medium text-primary transition-colors hover:bg-pink-100/50"
            >
                <span>
                    {open
                        ? 'Sembunyikan detail'
                        : 'Lihat detail & status pesanan'}
                </span>
                {open ? (
                    <ChevronUp className="h-4 w-4" />
                ) : (
                    <ChevronDown className="h-4 w-4" />
                )}
            </button>

            {/* ── Expandable detail ───────────────────────────────── */}
            {open && (
                <div className="grid gap-6 border-t border-pink-100 px-5 py-5 sm:grid-cols-2">
                    {/* Left: Items + summary */}
                    <div>
                        <h3 className="mb-3 text-sm font-semibold text-foreground">
                            Detail Pesanan
                        </h3>
                        <div className="space-y-2">
                            {tx.items.map((item, i) => (
                                <div
                                    key={i}
                                    className="flex justify-between text-sm"
                                >
                                    <span className="text-muted-foreground">
                                        {item.name} × {item.qty}
                                    </span>
                                    <span className="font-medium">
                                        {formatRupiah(item.price * item.qty)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 space-y-1.5 border-t border-dashed border-pink-100 pt-3 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span>{formatRupiah(tx.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>
                                    Ongkos kirim{' '}
                                    {tx.courier ? `(${tx.courier})` : ''}
                                </span>
                                <span>
                                    {tx.shipping_cost === 0
                                        ? 'Gratis'
                                        : formatRupiah(tx.shipping_cost)}
                                </span>
                            </div>
                            <div className="flex justify-between font-bold">
                                <span>Total</span>
                                <span className="text-primary">
                                    {formatRupiah(total)}
                                </span>
                            </div>
                        </div>

                        {/* Shipping info */}
                        {tx.shipping_method === 'delivery' && tx.address && (
                            <div className="mt-4 rounded-xl border border-pink-100 bg-pink-50 p-3 text-xs">
                                <p className="font-semibold text-foreground">
                                    Alamat pengiriman:
                                </p>
                                <p className="mt-0.5 text-muted-foreground">
                                    {tx.address}
                                </p>
                                {tx.tracking && (
                                    <p className="mt-1.5 font-medium text-primary">
                                        No. Resi: {tx.tracking}
                                    </p>
                                )}
                            </div>
                        )}
                        {tx.shipping_method === 'pickup' && (
                            <div className="mt-4 rounded-xl border border-teal-100 bg-teal-50 p-3 text-xs text-teal-700">
                                <p className="font-semibold">
                                    Ambil sendiri di toko
                                </p>
                                <p className="mt-0.5 text-teal-600">
                                    Jl. Ahmad Yani No. 12, Kota Kediri
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right: Stepper */}
                    <div>
                        <h3 className="mb-3 text-sm font-semibold text-foreground">
                            Status Pesanan
                        </h3>
                        <StatusStepper
                            status={tx.status}
                            shippingMethod={tx.shipping_method}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function TransactionHistoryPage({
    orders,
}: {
    orders: OrderModel[];
}) {
    const [filter, setFilter] = useState<'all' | OrderStatus>('all');

    const handlePayNow = async (orderId: string) => {
        try {
            const response = await axios.post(`/transactions/${orderId}/pay`);
            if (response.data.success) {
                window.snap.pay(response.data.snap_token, {
                    onSuccess: () => router.visit('/payment/success'),
                    onPending: () => router.visit('/transactions'),
                    onError: () => toast.error('Pembayaran gagal'),
                    onClose: () =>
                        toast.warning('Silahkan selesaikan pembayaran'),
                });
            }
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            toast.error(
                axiosError.response?.data?.message ||
                    'Gagal menyiapkan pembayaran',
            );
        }
    };

    const mappedTransactions: Transaction[] = orders.map((order) => {
        const items: OrderItem[] = order.order_items.map((item) => ({
            name: item.product?.name || item.custom_name || 'Produk',
            qty: item.quantity,
            price: item.unit_price,
        }));

        const subtotal = items.reduce(
            (acc, item) => acc + item.price * item.qty,
            0,
        );

        return {
            id: order.id.toString(),
            date: order.created_at,
            status: (function (s: string): OrderStatus {
                switch (s) {
                    case 'pending':
                        return 'pending_payment';
                    case 'paid':
                        return 'payment_verified';
                    case 'process':
                        return 'processing';
                    case 'completed':
                        return 'delivered';
                    case 'canceled':
                        return 'cancelled';
                    default:
                        return 'pending_payment';
                }
            })(order.status),
            shipping_method: order.shipping_method,
            courier: order.courier_service
                ? `${order.courier_service.name} ${order.courier_service.service}`
                : undefined,
            tracking: 'SALMA-TRACK-DUMMY', // Dummy as requested
            items: items,
            subtotal: subtotal,
            shipping_cost: order.shipping_cost || 0,
            address: order.address
                ? `${order.address.address_detail}, ${order.address.district_name}, ${order.address.city_name}, ${order.address.province_name}`
                : undefined,
        };
    });

    const filters: { key: 'all' | OrderStatus; label: string }[] = [
        { key: 'all', label: 'Semua' },
        { key: 'pending_payment', label: 'Menunggu Bayar' },
        { key: 'processing', label: 'Diproses' },
        { key: 'delivered', label: 'Selesai' },
        { key: 'cancelled', label: 'Dibatalkan' },
    ];

    const filtered =
        filter === 'all'
            ? mappedTransactions
            : mappedTransactions.filter((t) => t.status === filter);

    return (
        <>
            <Head title="Riwayat Transaksi – Salma Florist" />

            <div className="min-h-screen bg-[oklch(0.9789_0.0128_345.48)]">
                {/* ── Top bar ──────────────────────────────────────── */}
                <header className="sticky top-0 z-30 border-b border-pink-100 bg-white/80 backdrop-blur-md">
                    <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
                        <Link href="/" className="flex items-center gap-2">
                            <img
                                src="/logo.png"
                                alt="Salma Florist"
                                className="h-8 w-8 rounded-md object-cover"
                                onError={(e) => {
                                    (
                                        e.target as HTMLImageElement
                                    ).style.display = 'none';
                                }}
                            />
                            <span className="font-playfair-display text-lg font-semibold text-primary">
                                Salma Florist
                            </span>
                        </Link>
                        <Link
                            href="/cart"
                            className="rounded-xl border border-pink-100 bg-white px-3 py-1.5 text-sm font-medium text-primary shadow-xs transition-colors hover:bg-pink-50"
                        >
                            🛒 Keranjang
                        </Link>
                    </div>
                </header>

                <main className="mx-auto max-w-4xl px-4 py-8">
                    {/* Breadcrumb */}
                    <nav className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-primary">
                            Beranda
                        </Link>
                        <span>/</span>
                        <span className="font-medium text-foreground">
                            Riwayat Transaksi
                        </span>
                    </nav>

                    <h1 className="mb-2 font-playfair-display text-3xl font-bold text-foreground">
                        Riwayat Transaksi
                    </h1>
                    <p className="mb-6 text-sm text-muted-foreground">
                        {mappedTransactions.length} transaksi ditemukan
                    </p>

                    {/* ── Filter tabs ───────────────────────────────── */}
                    <div className="mb-6 flex flex-wrap gap-2">
                        {filters.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                                    filter === key
                                        ? 'border-primary bg-primary text-white shadow-sm shadow-primary/20'
                                        : 'border-pink-200 bg-white text-muted-foreground hover:border-primary hover:text-primary'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* ── Transaction cards ────────────────────────── */}
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="mb-4 text-5xl">📦</div>
                            <p className="text-muted-foreground">
                                Tidak ada transaksi untuk filter ini.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filtered.map((tx) => (
                                <TransactionCard
                                    key={tx.id}
                                    tx={tx}
                                    onPay={handlePayNow}
                                />
                            ))}
                        </div>
                    )}

                    <div className="mt-8 flex justify-center">
                        <Link
                            href="/catalog"
                            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-primary"
                        >
                            Belanja lagi →
                        </Link>
                    </div>
                </main>
            </div>
        </>
    );
}
