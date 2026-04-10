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
import { index } from '@/routes/batch-stocks';
import { BatchStock, BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
    ArrowLeftIcon,
    CalendarClockIcon,
    StoreIcon,
    UserIcon,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Riwayat Kulakan',
        href: index().url,
    },
    {
        title: 'Detail Kulakan',
        href: '#',
    },
];

type BatchStockShowPageProps = {
    batchStock: BatchStock;
};

function BatchStockShowPage({ batchStock }: BatchStockShowPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Kulakan - ${batchStock.supplier}`} />
            <div className="space-y-6 p-4">
                <div className="flex items-center gap-4">
                    <Link href={index().url}>
                        <Button variant="outline" size="icon">
                            <ArrowLeftIcon className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h2 className="text-2xl font-semibold">
                        Detail Transaksi Kulakan
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Supplier
                            </CardTitle>
                            <StoreIcon className="ml-auto h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {batchStock.supplier}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Tanggal
                            </CardTitle>
                            <CalendarClockIcon className="ml-auto h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-semibold">
                                {format(
                                    new Date(batchStock.created_at),
                                    'dd MMMM yyyy HH:mm',
                                    { locale: id },
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Dicatat Oleh
                            </CardTitle>
                            <UserIcon className="ml-auto h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-semibold">
                                {batchStock.user?.name}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Item Bahan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Bahan</TableHead>
                                    <TableHead>Jumlah</TableHead>
                                    <TableHead>Harga Satuan</TableHead>
                                    <TableHead>Kadaluarsa</TableHead>
                                    <TableHead className="text-right">
                                        Subtotal
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {batchStock.material_stocks?.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">
                                            {item.material?.name}
                                        </TableCell>
                                        <TableCell>
                                            {item.initial_quantity}{' '}
                                            {item.material?.unit}
                                        </TableCell>
                                        <TableCell>
                                            {formatCurrency(item.price)}
                                        </TableCell>
                                        <TableCell>
                                            {item.expired_date
                                                ? format(
                                                      new Date(
                                                          item.expired_date,
                                                      ),
                                                      'dd/MM/yyyy',
                                                  )
                                                : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(item.subtotal)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="mt-6 flex flex-col items-end gap-2 border-t pt-4">
                            <div className="text-sm font-medium text-muted-foreground">
                                Total Transaksi
                            </div>
                            <div className="text-3xl font-bold text-primary">
                                {formatCurrency(batchStock.total_amount)}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

export default BatchStockShowPage;
