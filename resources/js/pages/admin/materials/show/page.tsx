import AppPagination from '@/components/app-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import { index } from '@/routes/materials';
import { BreadcrumbItem, Material } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowLeftIcon, TrendingDownIcon, TrendingUpIcon } from 'lucide-react';

type MaterialStockLog = {
    id: number;
    material_id: number;
    material_stock_id: number;
    created_by: number;
    quantity: number;
    type: 'in' | 'out';
    notes: string | null;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
    };
    material_stock?: {
        id: number;
        batch_stock_id: number;
        price: number;
        expired_date: string | null;
        batch_stock?: {
            id: number;
            supplier: string;
            payment_method: string;
        };
    };
};

type MaterialShowPageProps = {
    material: Material;
    logs: {
        data: MaterialStockLog[];
        links: {
            url: string;
            page: number;
            active: boolean;
        }[];
        current_page: number;
    };
};

const breadcrumbs = (): BreadcrumbItem[] => [
    {
        title: 'Bahan',
        href: index().url,
    },
    {
        title: 'Detail & Riwayat Stok',
        href: '#',
    },
];

function MaterialShowPage({ material, logs }: MaterialShowPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs()}>
            <Head title={`Riwayat Stok - ${material.name}`} />
            <div className="space-y-4 p-4">
                {/* Header Actions */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                    <h2 className="text-2xl font-semibold">
                        Riwayat Stok Bahan
                    </h2>
                    <Link href={index().url}>
                        <Button variant="outline">
                            <ArrowLeftIcon className="mr-2 h-4 w-4" /> Kembali
                        </Button>
                    </Link>
                </div>

                {/* Material Info Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Nama Bahan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">
                                {material.name}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Stok Saat Ini
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">
                                {material.stock.toLocaleString()}{' '}
                                {material.unit}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Estimasi Harga per Unit
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">
                                {formatCurrency(material.price)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Berat per Unit
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">
                                {material.weight.toLocaleString()} gr
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Logs Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Log Perubahan Stok</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Waktu</TableHead>
                                    <TableHead>Batch ID</TableHead>
                                    <TableHead>Tipe</TableHead>
                                    <TableHead className="text-right">
                                        Jumlah
                                    </TableHead>
                                    <TableHead>Oleh</TableHead>
                                    <TableHead>Catatan / Keterangan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="h-24 text-center"
                                        >
                                            Belum ada riwayat perubahan stok
                                            untuk bahan ini.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.data.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="whitespace-nowrap">
                                                {format(
                                                    new Date(log.created_at),
                                                    'dd MMMM yyyy HH:mm',
                                                    { locale: id },
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {log.material_stock?.batch_stock
                                                    ?.id || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {log.type === 'in' ? (
                                                    <Badge variant="success">
                                                        <TrendingUpIcon className="mr-1 h-3.5 w-3.5" />{' '}
                                                        Masuk
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive">
                                                        <TrendingDownIcon className="mr-1 h-3.5 w-3.5" />{' '}
                                                        Keluar
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell
                                                className={`text-right font-semibold ${log.type === 'in' ? 'text-green-600' : 'text-red-600'}`}
                                            >
                                                {log.type === 'in' ? '+' : '-'}
                                                {log.quantity.toLocaleString()}{' '}
                                                {material.unit}
                                            </TableCell>
                                            <TableCell>
                                                {log.user?.name || 'Sistem'}
                                            </TableCell>
                                            <TableCell
                                                className="max-w-[300px] truncate"
                                                title={log.notes || '-'}
                                            >
                                                {log.notes || '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {logs.data.length > 0 && (
                            <AppPagination
                                current_page={logs.current_page}
                                links={logs.links}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

export default MaterialShowPage;
