import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { COURIERS } from '@/constants';
import UserLayout from '@/layouts/user-layout';
import {
    useGetCities,
    useGetDistricts,
    useGetShippingCost,
} from '@/services/hooks/destinationHook';
import { Cart, Province, ShippingCost } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import axios, { AxiosError } from 'axios';
import {
    ArrowLeft,
    ArrowRight,
    MapPin,
    Package,
    ShoppingBag,
    Truck,
    User,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        snap: any;
    }
}

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

type CheckoutPageProps = {
    provinces: Province[];
    cart: Cart;
};

// ── Main page ──────────────────────────────────────────────────────────────
export default function ContentCheckoutPage({
    provinces,
    cart,
}: CheckoutPageProps) {
    const [shippingMethod, setShippingMethod] = useState<'delivery' | 'pickup'>(
        'delivery',
    );
    const [form, setForm] = useState({
        recipient_name: '',
        whatsapp: '',
        notes_recipient: '',
        province: '',
        city: '',
        district: '',
        courier: '',
        shipping: null as ShippingCost | null,
        address_detail: '',
        // postal: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: cities = [], isPending: isLoadingCities } = useGetCities(
        form.province,
    );
    const { data: districts = [], isFetching: isLoadingDistricts } =
        useGetDistricts(form.city);
    const { data: shippingCosts = [], isFetching: isLoadingCosts } =
        useGetShippingCost({
            destination: form.district,
            courier: form.courier,
        });

    const handleProvinceChange = (provinceId: string) => {
        setForm((prev) => ({
            ...prev,
            province: provinceId,
            city: '',
            district: '',
            courier: '',
            shipping: null,
        }));
    };

    const handleCityChange = (v: string) => {
        setForm((prev) => ({
            ...prev,
            city: v,
            district: '',
            courier: '',
            shipping: null,
        }));
    };

    const handleDistrictChange = (v: string) => {
        setForm((prev) => ({
            ...prev,
            district: v,
            courier: '',
            shipping: null,
        }));
    };

    const handleCourierChange = (v: string) => {
        setForm((prev) => ({
            ...prev,
            courier: v,
            shipping: null,
        }));
    };

    const handlePay = async () => {
        setIsSubmitting(true);

        const data = {
            shipping_method: shippingMethod,
            notes: form.notes_recipient,
            address:
                shippingMethod === 'delivery'
                    ? {
                          customer_name: form.recipient_name,
                          whatsapp_number: form.whatsapp,
                          address_detail: form.address_detail,
                          province_id: form.province,
                          city_id: form.city,
                          district_id: form.district,
                          notes: form.notes_recipient,
                      }
                    : null,
            courier:
                shippingMethod === 'delivery'
                    ? {
                          code: form.courier,
                          service: form.shipping?.service,
                      }
                    : null,
        };

        try {
            const response = await axios.post('/checkout', data);

            if (response.data.success) {
                window.snap.pay(response.data.snap_token, {
                    onSuccess: function () {
                        router.visit('/payment/success');
                    },
                    onPending: function () {
                        router.visit('/transactions');
                    },
                    onError: function () {
                        toast.error('Pembayaran gagal');
                    },
                    onClose: function () {
                        toast.warning('Silahkan selesaikan pembayaran');
                    },
                });
            }
        } catch (error) {
            toast.error(
                (error as AxiosError<{ message: string }>)?.response?.data
                    ?.message || 'Terjadi kesalahan saat membuat pesanan',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const subtotal = cart.items.reduce((total, item) => {
        const price = item.product?.price || item.unit_price || 0;
        return total + price * item.quantity;
    }, 0);
    const total = subtotal + (form.shipping?.cost || 0);
    const totalweight = cart.items.reduce((total, item) => {
        const weight = item?.product?.weight || 0;
        return total + weight * item.quantity;
    }, 0);

    return (
        <UserLayout>
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
                                            value={form.recipient_name}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    recipient_name:
                                                        e.target.value,
                                                })
                                            }
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
                                            value={form.whatsapp}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    whatsapp: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2 sm:col-span-2">
                                        <Label htmlFor="notes">
                                            Catatan (opsional)
                                        </Label>
                                        <Input
                                            id="notes"
                                            placeholder="Misal: warna, pesan di kartu ucapan..."
                                            value={form.notes_recipient}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    notes_recipient:
                                                        e.target.value,
                                                })
                                            }
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
                                            <div className="space-y-2">
                                                <Label>Provinsi *</Label>
                                                <Select
                                                    value={form.province.toString()}
                                                    onValueChange={
                                                        handleProvinceChange
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih Provinsi" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {provinces &&
                                                            provinces?.map(
                                                                (province) => (
                                                                    <SelectItem
                                                                        key={
                                                                            province.id
                                                                        }
                                                                        value={province.id.toString()}
                                                                    >
                                                                        {
                                                                            province.name
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Kota *</Label>
                                                <Select
                                                    value={form.city}
                                                    onValueChange={
                                                        handleCityChange
                                                    }
                                                    disabled={
                                                        !form.province ||
                                                        isLoadingCities
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih Kota" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {cities &&
                                                            cities?.map(
                                                                (city) => (
                                                                    <SelectItem
                                                                        key={
                                                                            city.id
                                                                        }
                                                                        value={city.id.toString()}
                                                                    >
                                                                        {
                                                                            city.name
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Kecamatan *</Label>
                                                <Select
                                                    value={form.district}
                                                    onValueChange={
                                                        handleDistrictChange
                                                    }
                                                    disabled={
                                                        !form.city ||
                                                        isLoadingDistricts
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih Kecamatan" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {districts?.map(
                                                            (district) => (
                                                                <SelectItem
                                                                    key={
                                                                        district.id
                                                                    }
                                                                    value={district.id.toString()}
                                                                >
                                                                    {
                                                                        district.name
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Kurir *</Label>
                                                <Select
                                                    value={form.courier}
                                                    onValueChange={
                                                        handleCourierChange
                                                    }
                                                    disabled={
                                                        !form.district ||
                                                        isLoadingCosts
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih Kurir" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {COURIERS.map(
                                                            (courier) => (
                                                                <SelectItem
                                                                    key={
                                                                        courier.code
                                                                    }
                                                                    value={
                                                                        courier.code
                                                                    }
                                                                >
                                                                    {
                                                                        courier.name
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* ── Layanan Pengiriman ──────────────── */}
                                        {form.courier && (
                                            <div className="mt-2">
                                                <Label className="mb-3 block">
                                                    Layanan Pengiriman *
                                                </Label>
                                                {isLoadingCosts ? (
                                                    <div className="flex items-center gap-2 rounded-xl border border-pink-100 bg-pink-50 p-4 text-sm text-muted-foreground">
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                                        Mengecek biaya ongkir...
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {shippingCosts?.map(
                                                            (opt) => (
                                                                <label
                                                                    key={`${opt.code}-${opt.service}`}
                                                                    className={`flex cursor-pointer items-center justify-between rounded-xl border-2 px-4 py-3 transition-all ${
                                                                        form
                                                                            .shipping
                                                                            ?.service ===
                                                                        opt.service
                                                                            ? 'border-primary bg-primary/5'
                                                                            : 'border-input hover:border-primary/40'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <input
                                                                            type="radio"
                                                                            name="shipping_option"
                                                                            value={`${opt.code}-${opt.service}`}
                                                                            checked={
                                                                                form
                                                                                    .shipping
                                                                                    ?.service ===
                                                                                opt.service
                                                                            }
                                                                            onChange={() =>
                                                                                setForm(
                                                                                    {
                                                                                        ...form,
                                                                                        shipping:
                                                                                            opt,
                                                                                    },
                                                                                )
                                                                            }
                                                                            className="text-primary"
                                                                        />
                                                                        <div>
                                                                            <p className="text-sm font-medium">
                                                                                {
                                                                                    opt.name
                                                                                }{' '}
                                                                                -{' '}
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

                                        <div className="grid gap-2">
                                            <Label htmlFor="address_detail">
                                                Alamat Lengkap *
                                            </Label>
                                            <textarea
                                                id="address_detail"
                                                rows={3}
                                                placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan..."
                                                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors focus:ring-2 focus:ring-ring focus:outline-none"
                                                value={form.address_detail}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        address_detail:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        {/* <div className="grid gap-2">
                                            <Label htmlFor="postal">
                                                Kode Pos
                                            </Label>
                                            <Input
                                                id="postal"
                                                placeholder="64100"
                                                className="max-w-[160px]"
                                                value={form.postal}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        postal: e.target.value,
                                                    })
                                                }
                                            />
                                        </div> */}
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
                                        Jam operasional: 08.00 - 20.00 WIB
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
                                    {cart.items.map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex justify-between text-muted-foreground"
                                        >
                                            <span className="flex-1 truncate pr-2">
                                                {item.is_custom
                                                    ? item.custom_name
                                                    : item.product?.name}{' '}
                                                x {item.quantity}
                                            </span>
                                            <span className="font-medium text-foreground">
                                                {formatRupiah(
                                                    (item?.product?.price ||
                                                        item.unit_price) *
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
                                            Total Bobot
                                        </span>
                                        <span className="font-medium">
                                            {totalweight} gram
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
                                                : form.shipping
                                                  ? formatRupiah(
                                                        form.shipping.cost,
                                                    )
                                                  : '-'}
                                        </span>
                                    </div>
                                </div>

                                <div className="my-3 border-t border-pink-100" />

                                <div className="flex justify-between font-bold">
                                    <span>Total</span>
                                    <span className="text-lg text-primary">
                                        {shippingMethod === 'pickup'
                                            ? formatRupiah(subtotal)
                                            : form.shipping
                                              ? formatRupiah(total)
                                              : formatRupiah(subtotal)}
                                    </span>
                                </div>

                                <Button
                                    className="mt-6 w-full gap-2"
                                    size="lg"
                                    onClick={handlePay}
                                    disabled={
                                        isSubmitting ||
                                        !form.recipient_name ||
                                        !form.whatsapp ||
                                        (shippingMethod === 'delivery' &&
                                            (!form.district ||
                                                !form.shipping ||
                                                !form.address_detail))
                                    }
                                >
                                    {isSubmitting ? (
                                        'Memproses...'
                                    ) : (
                                        <>
                                            Lanjut Bayar{' '}
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </Button>

                                <p className="mt-3 text-center text-xs text-muted-foreground">
                                    🔒 Transaksi aman & terpercaya
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </UserLayout>
    );
}
