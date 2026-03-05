import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, ChevronRight } from 'lucide-react';

export default function PaymentSuccessPage() {
    return (
        <>
            <Head title="Pembayaran Berhasil – Salma Florist" />
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
                    <p className="mb-8 text-sm text-muted-foreground">
                        Kami akan segera memverifikasi dan menghubungi kamu via
                        WhatsApp.
                    </p>

                    {/* Order status tracker */}
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
                        <div className="mt-3 flex items-center gap-3 opacity-40">
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
                        <div className="mt-3 flex items-center gap-3 opacity-40">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-pink-300 text-sm text-muted-foreground">
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
                            <Link href="/transactions">Riwayat Transaksi</Link>
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
