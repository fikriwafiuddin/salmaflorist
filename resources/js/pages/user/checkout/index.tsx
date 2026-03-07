import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useCartStore from '@/hooks/useCartStore';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    ChevronDown,
    MapPin,
    Package,
    ShoppingBag,
    Truck,
    User,
} from 'lucide-react';
import { useState } from 'react';

// ── Mock data ──────────────────────────────────────────────────────────────
const provinces = [
    { id: '35', name: 'Jawa Timur' },
    { id: '32', name: 'Jawa Barat' },
    { id: '33', name: 'Jawa Tengah' },
    { id: '31', name: 'DKI Jakarta' },
];

const citiesByProvince: Record<string, { id: string; name: string }[]> = {
    '35': [
        { id: '3571', name: 'Kota Kediri' },
        { id: '3572', name: 'Kota Blitar' },
        { id: '3573', name: 'Kota Malang' },
        { id: '3574', name: 'Kota Surabaya' },
        { id: '3506', name: 'Kabupaten Kediri' },
    ],
    '32': [
        { id: '3273', name: 'Kota Bandung' },
        { id: '3271', name: 'Kota Bogor' },
        { id: '3201', name: 'Kabupaten Bogor' },
    ],
    '33': [
        { id: '3374', name: 'Kota Semarang' },
        { id: '3401', name: 'Kota Yogyakarta' },
    ],
    '31': [
        { id: '3171', name: 'Jakarta Pusat' },
        { id: '3172', name: 'Jakarta Utara' },
        { id: '3173', name: 'Jakarta Barat' },
    ],
};

const shippingOptions = [
    {
        id: 'jne-reg',
        courier: 'JNE',
        service: 'REG',
        etd: '2-3 hari',
        cost: 15000,
    },
    {
        id: 'jne-yes',
        courier: 'JNE',
        service: 'YES',
        etd: '1 hari',
        cost: 28000,
    },
    {
        id: 'jnt-reg',
        courier: 'J&T Express',
        service: 'Reguler',
        etd: '2-4 hari',
        cost: 13000,
    },
    {
        id: 'sicepat-reg',
        courier: 'SiCepat',
        service: 'BEST',
        etd: '2-3 hari',
        cost: 14000,
    },
];

// Removed mock orderItems

function formatRupiah(amount: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

// ── Small reusable components ──────────────────────────────────────────────
function SectionCard({
    icon: Icon,
    title,
    children,
}: {
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                </div>
                <h2 className="font-semibold text-foreground">{title}</h2>
            </div>
            {children}
        </div>
    );
}

function SelectField({
    label,
    value,
    onChange,
    options,
    placeholder,
    disabled,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { id: string; name: string }[];
    placeholder: string;
    disabled?: boolean;
}) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    className="w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm shadow-xs transition-colors focus:ring-2 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="">{placeholder}</option>
                    {options.map((o) => (
                        <option key={o.id} value={o.id}>
                            {o.name}
                        </option>
                    ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
        </div>
    );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function CheckoutPage() {
    const [shippingMethod, setShippingMethod] = useState<'delivery' | 'pickup'>(
        'delivery',
    );
    const [province, setProvince] = useState('');
    const [city, setCity] = useState('');
    const [selectedShipping, setSelectedShipping] = useState('');
    const [shippingCostLoaded, setShippingCostLoaded] = useState(false);

    const handleCityChange = (v: string) => {
        setCity(v);
        setSelectedShipping('');
        setShippingCostLoaded(false);
        if (v) {
            // Simulate API call delay
            setTimeout(() => setShippingCostLoaded(true), 800);
        }
    };

    const handleProvinceChange = (v: string) => {
        setProvince(v);
        setCity('');
        setShippingCostLoaded(false);
    };

    const cartItems = useCartStore((state) => state.items);
    const subtotal = useCartStore((state) => state.getTotalAmount());
    const shippingCost =
        shippingOptions.find((o) => o.id === selectedShipping)?.cost ?? 0;
    const total = subtotal + shippingCost;

    return (
        <>
            <Head title="Checkout – Salma Florist" />

            <div className="min-h-screen bg-[oklch(0.9789_0.0128_345.48)]">
                {/* Top bar */}
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
                        {/* Progress steps */}
                        <div className="hidden items-center gap-2 text-sm sm:flex">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-xs text-green-600">
                                    ✓
                                </span>
                                Keranjang
                            </span>
                            <span className="text-muted-foreground">›</span>
                            <span className="flex items-center gap-1.5 font-semibold text-primary">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                                    2
                                </span>
                                Checkout
                            </span>
                            <span className="text-muted-foreground">›</span>
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs">
                                    3
                                </span>
                                Pembayaran
                            </span>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-6xl px-4 py-8">
                    <div className="mb-6 flex items-center gap-2">
                        <Link
                            href="/cart"
                            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                        >
                            <ArrowLeft className="h-4 w-4" /> Kembali ke
                            Keranjang
                        </Link>
                    </div>

                    <h1 className="mb-8 font-playfair-display text-3xl font-bold">
                        Checkout
                    </h1>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* ── Left column ───────────────────────────── */}
                        <div className="space-y-5 lg:col-span-2">
                            {/* Informasi Penerima */}
                            <SectionCard icon={User} title="Informasi Penerima">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="recipient_name">
                                            Nama Penerima *
                                        </Label>
                                        <Input
                                            id="recipient_name"
                                            placeholder="Nama lengkap penerima"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="whatsapp">
                                            Nomor WhatsApp *
                                        </Label>
                                        <Input
                                            id="whatsapp"
                                            type="tel"
                                            placeholder="08xxxxxxxxxx"
                                        />
                                    </div>
                                    <div className="grid gap-2 sm:col-span-2">
                                        <Label htmlFor="notes">
                                            Catatan (opsional)
                                        </Label>
                                        <Input
                                            id="notes"
                                            placeholder="Misal: warna, pesan di kartu ucapan..."
                                        />
                                    </div>
                                </div>
                            </SectionCard>

                            {/* Metode Pengiriman */}
                            <SectionCard
                                icon={Package}
                                title="Metode Pengiriman"
                            >
                                <div className="grid grid-cols-2 gap-3">
                                    {(['delivery', 'pickup'] as const).map(
                                        (method) => (
                                            <button
                                                key={method}
                                                onClick={() =>
                                                    setShippingMethod(method)
                                                }
                                                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                                                    shippingMethod === method
                                                        ? 'border-primary bg-primary/5 shadow-sm'
                                                        : 'border-input hover:border-primary/40'
                                                }`}
                                            >
                                                {method === 'delivery' ? (
                                                    <Truck className="h-6 w-6 text-primary" />
                                                ) : (
                                                    <ShoppingBag className="h-6 w-6 text-primary" />
                                                )}
                                                <span className="text-sm font-medium">
                                                    {method === 'delivery'
                                                        ? 'Pengiriman'
                                                        : 'Ambil Sendiri'}
                                                </span>
                                            </button>
                                        ),
                                    )}
                                </div>
                            </SectionCard>

                            {/* Alamat Pengiriman (hanya tampil jika delivery) */}
                            {shippingMethod === 'delivery' && (
                                <SectionCard
                                    icon={MapPin}
                                    title="Alamat Pengiriman"
                                >
                                    <div className="grid gap-4">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <SelectField
                                                label="Provinsi *"
                                                value={province}
                                                onChange={handleProvinceChange}
                                                options={provinces}
                                                placeholder="Pilih provinsi"
                                            />
                                            <SelectField
                                                label="Kota / Kabupaten *"
                                                value={city}
                                                onChange={handleCityChange}
                                                options={
                                                    province
                                                        ? (citiesByProvince[
                                                              province
                                                          ] ?? [])
                                                        : []
                                                }
                                                placeholder={
                                                    province
                                                        ? 'Pilih kota'
                                                        : 'Pilih provinsi dulu'
                                                }
                                                disabled={!province}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="address_detail">
                                                Alamat Lengkap *
                                            </Label>
                                            <textarea
                                                id="address_detail"
                                                rows={3}
                                                placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan..."
                                                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors focus:ring-2 focus:ring-ring focus:outline-none"
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="postal">
                                                Kode Pos
                                            </Label>
                                            <Input
                                                id="postal"
                                                placeholder="64100"
                                                className="max-w-[160px]"
                                            />
                                        </div>

                                        {/* ── Layanan Pengiriman ──────────────── */}
                                        {city && (
                                            <div className="mt-2">
                                                <Label className="mb-3 block">
                                                    Layanan Pengiriman *
                                                </Label>
                                                {!shippingCostLoaded ? (
                                                    <div className="flex items-center gap-2 rounded-xl border border-pink-100 bg-pink-50 p-4 text-sm text-muted-foreground">
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                                        Mengecek biaya ongkir...
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {shippingOptions.map(
                                                            (opt) => (
                                                                <label
                                                                    key={opt.id}
                                                                    className={`flex cursor-pointer items-center justify-between rounded-xl border-2 px-4 py-3 transition-all ${
                                                                        selectedShipping ===
                                                                        opt.id
                                                                            ? 'border-primary bg-primary/5'
                                                                            : 'border-input hover:border-primary/40'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <input
                                                                            type="radio"
                                                                            name="shipping_option"
                                                                            value={
                                                                                opt.id
                                                                            }
                                                                            checked={
                                                                                selectedShipping ===
                                                                                opt.id
                                                                            }
                                                                            onChange={() =>
                                                                                setSelectedShipping(
                                                                                    opt.id,
                                                                                )
                                                                            }
                                                                            className="text-primary"
                                                                        />
                                                                        <div>
                                                                            <p className="text-sm font-medium">
                                                                                {
                                                                                    opt.courier
                                                                                }{' '}
                                                                                –{' '}
                                                                                {
                                                                                    opt.service
                                                                                }
                                                                            </p>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                Estimasi{' '}
                                                                                {
                                                                                    opt.etd
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <span className="text-sm font-semibold text-primary">
                                                                        {formatRupiah(
                                                                            opt.cost,
                                                                        )}
                                                                    </span>
                                                                </label>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </SectionCard>
                            )}

                            {shippingMethod === 'pickup' && (
                                <div className="rounded-2xl border border-green-100 bg-green-50 p-5 text-sm text-green-700">
                                    <p className="font-semibold">
                                        📍 Lokasi Toko Salma Florist
                                    </p>
                                    <p className="mt-1 text-green-600">
                                        Jl. Ahmad Yani No. 12, Kota Kediri, Jawa
                                        Timur
                                    </p>
                                    <p className="mt-0.5 text-green-600">
                                        Jam operasional: 08.00 – 20.00 WIB
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* ── Right column: Order summary ────────────── */}
                        <div>
                            <div className="sticky top-24 rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
                                <h2 className="mb-5 font-playfair-display text-lg font-bold">
                                    Ringkasan Pesanan
                                </h2>

                                <div className="space-y-3 text-sm">
                                    {cartItems.map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex justify-between text-muted-foreground"
                                        >
                                            <span className="flex-1 truncate pr-2">
                                                {item.is_custom
                                                    ? item.custom_name
                                                    : item.product?.name}{' '}
                                                × {item.quantity}
                                            </span>
                                            <span className="font-medium text-foreground">
                                                {formatRupiah(
                                                    item.unit_price *
                                                        item.quantity,
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="my-4 border-t border-dashed border-pink-100" />

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Subtotal
                                        </span>
                                        <span className="font-medium">
                                            {formatRupiah(subtotal)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Ongkir
                                        </span>
                                        <span
                                            className={`font-medium ${shippingMethod === 'pickup' ? 'text-green-600' : ''}`}
                                        >
                                            {shippingMethod === 'pickup'
                                                ? 'Gratis'
                                                : selectedShipping
                                                  ? formatRupiah(shippingCost)
                                                  : '–'}
                                        </span>
                                    </div>
                                </div>

                                <div className="my-3 border-t border-pink-100" />

                                <div className="flex justify-between font-bold">
                                    <span>Total</span>
                                    <span className="text-lg text-primary">
                                        {shippingMethod === 'pickup'
                                            ? formatRupiah(subtotal)
                                            : selectedShipping
                                              ? formatRupiah(total)
                                              : formatRupiah(subtotal)}
                                    </span>
                                </div>

                                <Button
                                    className="mt-6 w-full gap-2"
                                    size="lg"
                                    asChild
                                    disabled={
                                        shippingMethod === 'delivery' &&
                                        !selectedShipping
                                    }
                                >
                                    <Link href="/payment">
                                        Lanjut Bayar{' '}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>

                                <p className="mt-3 text-center text-xs text-muted-foreground">
                                    🔒 Transaksi aman & terpercaya
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
