import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    ChevronRight,
    Copy,
    CreditCard,
    Smartphone,
    Upload,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

// ── Mock order summary ─────────────────────────────────────────────────────
const ORDER = {
    id: 'SLM-2403040001',
    items: [
        { name: 'Buket Mawar Merah', qty: 1, price: 185000 },
        { name: 'Hand Bouquet Sunflower', qty: 2, price: 230000 },
    ],
    shipping: 15000,
};

const subtotal = ORDER.items.reduce((s, i) => s + i.price * i.qty, 0);
const total = subtotal + ORDER.shipping;

function formatRupiah(amount: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

// ── Payment method config ──────────────────────────────────────────────────
type MethodId = 'bank_transfer' | 'virtual_account' | 'ewallet';

const bankAccounts = [
    { bank: 'BCA', number: '1234567890', holder: 'Salma Florist' },
    { bank: 'Mandiri', number: '9876543210', holder: 'Salma Florist' },
    { bank: 'BRI', number: '0001234567890', holder: 'Salma Florist' },
];

const virtualAccounts = [
    { bank: 'BCA', va: '77012345678901' },
    { bank: 'Mandiri', va: '89812345678901' },
    { bank: 'BNI', va: '98812345678901' },
];

const ewallets = [
    { name: 'GoPay', logo: '💚', phone: '08123456789' },
    { name: 'OVO', logo: '💜', phone: '08123456789' },
    { name: 'Dana', logo: '💙', phone: '08123456789' },
];

// ── Copy to clipboard helper ───────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <button
            onClick={handleCopy}
            className="ml-2 rounded-md p-1.5 text-primary transition-colors hover:bg-primary/10"
            title="Salin"
        >
            {copied ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
                <Copy className="h-4 w-4" />
            )}
        </button>
    );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function PaymentPage() {
    const [method, setMethod] = useState<MethodId>('bank_transfer');
    const [selectedBank, setSelectedBank] = useState(0);
    const [selectedVA, setSelectedVA] = useState(0);
    const [selectedEwallet, setSelectedEwallet] = useState(0);
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const methodOptions: {
        id: MethodId;
        label: string;
        icon: React.ElementType;
    }[] = [
        { id: 'bank_transfer', label: 'Transfer Bank', icon: CreditCard },
        { id: 'virtual_account', label: 'Virtual Account', icon: Wallet },
        { id: 'ewallet', label: 'E-Wallet', icon: Smartphone },
    ];

    if (submitted) {
        return <PaymentSuccessPage orderId={ORDER.id} />;
    }

    return (
        <>
            <Head title="Pembayaran – Salma Florist" />

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
                        <div className="hidden items-center gap-2 text-sm sm:flex">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-xs text-green-600">
                                    ✓
                                </span>
                                Keranjang
                            </span>
                            <span className="text-muted-foreground">›</span>
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-xs text-green-600">
                                    ✓
                                </span>
                                Checkout
                            </span>
                            <span className="text-muted-foreground">›</span>
                            <span className="flex items-center gap-1.5 font-semibold text-primary">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                                    3
                                </span>
                                Pembayaran
                            </span>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-6xl px-4 py-8">
                    <div className="mb-6">
                        <Link
                            href="/checkout"
                            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                        >
                            <ArrowLeft className="h-4 w-4" /> Kembali ke
                            Checkout
                        </Link>
                    </div>

                    <h1 className="mb-2 font-playfair-display text-3xl font-bold">
                        Pembayaran
                    </h1>
                    <p className="mb-8 text-sm text-muted-foreground">
                        Order #{ORDER.id} · Selesaikan pembayaran dalam{' '}
                        <span className="font-semibold text-primary">
                            24 jam
                        </span>
                    </p>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* ── Left: Payment methods ──────────────────── */}
                        <div className="space-y-5 lg:col-span-2">
                            {/* Method tabs */}
                            <div className="flex gap-2 rounded-2xl border border-pink-100 bg-white p-2 shadow-sm">
                                {methodOptions.map(
                                    ({ id, label, icon: Icon }) => (
                                        <button
                                            key={id}
                                            onClick={() => setMethod(id)}
                                            className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl py-3 text-xs font-medium transition-all sm:flex-row sm:justify-center sm:gap-2 sm:text-sm ${
                                                method === id
                                                    ? 'bg-primary text-white shadow-sm'
                                                    : 'text-muted-foreground hover:bg-pink-50'
                                            }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {label}
                                        </button>
                                    ),
                                )}
                            </div>

                            {/* ── Bank Transfer ──────────────────────── */}
                            {method === 'bank_transfer' && (
                                <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
                                    <h2 className="mb-4 font-semibold">
                                        Transfer Bank
                                    </h2>

                                    {/* Bank selector */}
                                    <div className="mb-5 flex gap-2">
                                        {bankAccounts.map((b, i) => (
                                            <button
                                                key={b.bank}
                                                onClick={() =>
                                                    setSelectedBank(i)
                                                }
                                                className={`rounded-xl border-2 px-4 py-2 text-sm font-medium transition-all ${
                                                    selectedBank === i
                                                        ? 'border-primary bg-primary/5 text-primary'
                                                        : 'border-input text-muted-foreground hover:border-primary/40'
                                                }`}
                                            >
                                                {b.bank}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Account details */}
                                    <div className="rounded-xl bg-pink-50 p-4">
                                        <p className="mb-1 text-xs text-muted-foreground">
                                            Nomor Rekening{' '}
                                            {bankAccounts[selectedBank].bank}
                                        </p>
                                        <div className="flex items-center">
                                            <span className="text-2xl font-bold tracking-wider text-foreground">
                                                {
                                                    bankAccounts[selectedBank]
                                                        .number
                                                }
                                            </span>
                                            <CopyButton
                                                text={
                                                    bankAccounts[selectedBank]
                                                        .number
                                                }
                                            />
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            a.n.{' '}
                                            {bankAccounts[selectedBank].holder}
                                        </p>
                                    </div>

                                    {/* Total to transfer */}
                                    <div className="mt-4 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Jumlah transfer
                                            </p>
                                            <p className="text-xl font-bold text-primary">
                                                {formatRupiah(total)}
                                            </p>
                                        </div>
                                        <CopyButton text={String(total)} />
                                    </div>

                                    <p className="mt-3 text-xs text-muted-foreground">
                                        ⚠️ Pastikan nominal transfer sesuai agar
                                        pembayaran cepat diverifikasi.
                                    </p>
                                </div>
                            )}

                            {/* ── Virtual Account ────────────────────── */}
                            {method === 'virtual_account' && (
                                <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
                                    <h2 className="mb-4 font-semibold">
                                        Virtual Account
                                    </h2>

                                    <div className="mb-5 flex gap-2">
                                        {virtualAccounts.map((va, i) => (
                                            <button
                                                key={va.bank}
                                                onClick={() => setSelectedVA(i)}
                                                className={`rounded-xl border-2 px-4 py-2 text-sm font-medium transition-all ${
                                                    selectedVA === i
                                                        ? 'border-primary bg-primary/5 text-primary'
                                                        : 'border-input text-muted-foreground hover:border-primary/40'
                                                }`}
                                            >
                                                {va.bank}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="rounded-xl bg-pink-50 p-4">
                                        <p className="mb-1 text-xs text-muted-foreground">
                                            Nomor VA{' '}
                                            {virtualAccounts[selectedVA].bank}
                                        </p>
                                        <div className="flex items-center">
                                            <span className="text-xl font-bold tracking-wider text-foreground">
                                                {virtualAccounts[selectedVA].va}
                                            </span>
                                            <CopyButton
                                                text={
                                                    virtualAccounts[selectedVA]
                                                        .va
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                                        <p className="text-xs text-muted-foreground">
                                            Total pembayaran
                                        </p>
                                        <p className="text-xl font-bold text-primary">
                                            {formatRupiah(total)}
                                        </p>
                                    </div>

                                    <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-600">
                                        <p className="font-semibold">
                                            Cara bayar via ATM / M-Banking:
                                        </p>
                                        <ol className="mt-1 ml-4 list-decimal space-y-0.5">
                                            <li>
                                                Pilih menu Transfer → Virtual
                                                Account
                                            </li>
                                            <li>Masukkan nomor VA di atas</li>
                                            <li>
                                                Konfirmasi jumlah dan selesaikan
                                                transaksi
                                            </li>
                                        </ol>
                                    </div>
                                </div>
                            )}

                            {/* ── E-Wallet ───────────────────────────── */}
                            {method === 'ewallet' && (
                                <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
                                    <h2 className="mb-4 font-semibold">
                                        E-Wallet
                                    </h2>

                                    <div className="mb-5 flex gap-2">
                                        {ewallets.map((e, i) => (
                                            <button
                                                key={e.name}
                                                onClick={() =>
                                                    setSelectedEwallet(i)
                                                }
                                                className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-medium transition-all ${
                                                    selectedEwallet === i
                                                        ? 'border-primary bg-primary/5 text-primary'
                                                        : 'border-input text-muted-foreground hover:border-primary/40'
                                                }`}
                                            >
                                                <span>{e.logo}</span> {e.name}
                                            </button>
                                        ))}
                                    </div>

                                    {/* QR mockup */}
                                    <div className="flex flex-col items-center gap-3 rounded-xl bg-pink-50 p-6">
                                        <div className="flex h-36 w-36 items-center justify-center rounded-xl border-2 border-dashed border-primary/30 bg-white text-5xl">
                                            {ewallets[selectedEwallet].logo}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Scan QR dengan aplikasi{' '}
                                            {ewallets[selectedEwallet].name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            atau transfer ke:
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <span className="font-semibold">
                                                {
                                                    ewallets[selectedEwallet]
                                                        .phone
                                                }
                                            </span>
                                            <CopyButton
                                                text={
                                                    ewallets[selectedEwallet]
                                                        .phone
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                                        <p className="text-xs text-muted-foreground">
                                            Total pembayaran
                                        </p>
                                        <p className="text-xl font-bold text-primary">
                                            {formatRupiah(total)}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* ── Upload Bukti Pembayaran ─────────────── */}
                            <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
                                <h2 className="mb-1 font-semibold">
                                    Upload Bukti Pembayaran
                                </h2>
                                <p className="mb-4 text-xs text-muted-foreground">
                                    Format: JPG, PNG, PDF. Maks. 5MB.
                                </p>

                                <label
                                    htmlFor="proof_upload"
                                    className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all ${
                                        proofFile
                                            ? 'border-green-400 bg-green-50'
                                            : 'border-pink-200 hover:border-primary hover:bg-pink-50'
                                    }`}
                                >
                                    {proofFile ? (
                                        <>
                                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                                            <p className="text-sm font-medium text-green-700">
                                                {proofFile.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Klik untuk ganti file
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-8 w-8 text-primary/40" />
                                            <p className="text-sm text-muted-foreground">
                                                Klik atau seret file ke sini
                                            </p>
                                        </>
                                    )}
                                    <input
                                        id="proof_upload"
                                        type="file"
                                        accept="image/*,.pdf"
                                        className="sr-only"
                                        onChange={(e) =>
                                            setProofFile(
                                                e.target.files?.[0] ?? null,
                                            )
                                        }
                                    />
                                </label>

                                <div className="mt-2 grid gap-2">
                                    <Label htmlFor="payment_notes">
                                        Catatan (opsional)
                                    </Label>
                                    <Input
                                        id="payment_notes"
                                        placeholder="Misal: sudah transfer via BCA mobile..."
                                    />
                                </div>

                                <Button
                                    className="mt-6 w-full gap-2"
                                    size="lg"
                                    disabled={!proofFile}
                                    onClick={() => setSubmitted(true)}
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Konfirmasi Pembayaran
                                </Button>
                            </div>
                        </div>

                        {/* ── Right: Order summary ───────────────────── */}
                        <div>
                            <div className="sticky top-24 rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
                                <h2 className="mb-1 font-playfair-display text-lg font-bold">
                                    Ringkasan
                                </h2>
                                <p className="mb-4 text-xs text-muted-foreground">
                                    #{ORDER.id}
                                </p>

                                <div className="space-y-3 text-sm">
                                    {ORDER.items.map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex justify-between text-muted-foreground"
                                        >
                                            <span className="flex-1 truncate pr-2">
                                                {item.name} × {item.qty}
                                            </span>
                                            <span className="font-medium text-foreground">
                                                {formatRupiah(
                                                    item.price * item.qty,
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
                                        <span>{formatRupiah(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Ongkir
                                        </span>
                                        <span>
                                            {formatRupiah(ORDER.shipping)}
                                        </span>
                                    </div>
                                </div>

                                <div className="my-3 border-t border-pink-100" />

                                <div className="flex justify-between font-bold">
                                    <span>Total</span>
                                    <span className="text-lg text-primary">
                                        {formatRupiah(total)}
                                    </span>
                                </div>

                                <div className="mt-4 rounded-xl bg-pink-50 p-3 text-xs text-muted-foreground">
                                    <p className="font-medium text-foreground">
                                        Metode:{' '}
                                        {
                                            methodOptions.find(
                                                (m) => m.id === method,
                                            )?.label
                                        }
                                    </p>
                                    <p className="mt-0.5">
                                        Konfirmasi dalam 1×24 jam setelah
                                        pembayaran
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

// ── Payment Success sub-page ───────────────────────────────────────────────
function PaymentSuccessPage({ orderId }: { orderId: string }) {
    return (
        <>
            <Head title="Pembayaran Dikonfirmasi – Salma Florist" />
            <div className="min-h-screen bg-[oklch(0.9789_0.0128_345.48)]">
                <header className="border-b border-pink-100 bg-white/80 backdrop-blur-md">
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
                    </div>
                </header>

                <main className="mx-auto max-w-lg px-4 py-20 text-center">
                    {/* Success icon */}
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-14 w-14 text-green-500" />
                    </div>

                    <h1 className="mb-3 font-playfair-display text-3xl font-bold text-foreground">
                        Terima Kasih! 🌸
                    </h1>
                    <p className="mb-2 text-muted-foreground">
                        Bukti pembayaran kamu sudah kami terima.
                    </p>
                    <p className="mb-1 text-sm text-muted-foreground">
                        Order{' '}
                        <span className="font-semibold text-primary">
                            #{orderId}
                        </span>{' '}
                        sedang diverifikasi.
                    </p>
                    <p className="mb-8 text-sm text-muted-foreground">
                        Kami akan menghubungi kamu via WhatsApp setelah
                        pembayaran dikonfirmasi.
                    </p>

                    {/* Status card */}
                    <div className="mb-8 rounded-2xl border border-green-100 bg-white p-5 text-left shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-lg text-green-600">
                                ✓
                            </div>
                            <div>
                                <p className="text-sm font-semibold">
                                    Bukti pembayaran diterima
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Sedang diverifikasi oleh tim kami
                                </p>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-3 opacity-50">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-primary text-sm text-primary">
                                2
                            </div>
                            <div>
                                <p className="text-sm font-semibold">
                                    Pesanan diproses
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Menunggu konfirmasi pembayaran
                                </p>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-3 opacity-50">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-primary text-sm">
                                3
                            </div>
                            <div>
                                <p className="text-sm font-semibold">
                                    Dikirim / Siap diambil
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Bunga sedang disiapkan 🌸
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Button asChild variant="outline">
                            <Link href="/">Kembali ke Beranda</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/catalog">
                                Belanja Lagi{' '}
                                <ChevronRight className="ml-1 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </main>
            </div>
        </>
    );
}
