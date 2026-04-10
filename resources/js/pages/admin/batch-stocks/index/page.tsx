import AppPagination from '@/components/app-pagination';
import { DataTable } from '@/components/data-table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { create, index } from '@/routes/batch-stocks';
import { BatchStock, BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { CheckCircleIcon, PackagePlusIcon } from 'lucide-react';
import columns from './columns';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Riwayat Kulakan',
        href: index().url,
    },
];

type BatchStockIndexPageProps = {
    batchStocks: {
        data: BatchStock[];
        links: {
            url: string;
            page: number;
            active: boolean;
        }[];
        current_page: number;
    };
    filters: {
        month: string | number;
        year: string | number;
    };
};

const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 2024 + 1 }, (_, i) =>
    (2024 + i).toString(),
);

function BatchStockIndexPage({
    batchStocks,
    filters,
}: BatchStockIndexPageProps) {
    const { flash } = usePage<{ flash: { success: string; error: string } }>()
        .props;

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        router.get(index().url, newFilters, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Kulakan" />
            <div className="space-y-4 p-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                    <h2 className="text-2xl font-semibold">
                        Riwayat Kulakan Bahan
                    </h2>
                    <Link href={create().url}>
                        <Button className="flex items-center gap-2">
                            <PackagePlusIcon className="h-4 w-4" />
                            Kulakan Baru
                        </Button>
                    </Link>
                </div>

                {flash.success && (
                    <Alert>
                        <CheckCircleIcon />
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}

                {flash.error && (
                    <Alert>
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                <Card>
                    <CardHeader className="flex flex-col items-start justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
                        <CardTitle>Daftar Riwayat Kulakan</CardTitle>
                        <div className="flex flex-wrap items-center gap-2">
                            <Select
                                value={filters.month.toString()}
                                onValueChange={(v) =>
                                    handleFilterChange('month', v)
                                }
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Pilih Bulan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map((m, i) => (
                                        <SelectItem
                                            key={i}
                                            value={i.toString()}
                                        >
                                            {m}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={filters.year.toString()}
                                onValueChange={(v) =>
                                    handleFilterChange('year', v)
                                }
                            >
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Pilih Tahun" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((y) => (
                                        <SelectItem key={y} value={y}>
                                            {y}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <DataTable data={batchStocks.data} columns={columns} />
                        <AppPagination
                            current_page={batchStocks.current_page}
                            links={batchStocks.links}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

export default BatchStockIndexPage;
