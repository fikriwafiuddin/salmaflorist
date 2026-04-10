import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import batchStocks from '@/routes/batch-stocks';
import { BatchStock } from '@/types';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { EyeIcon } from 'lucide-react';

const columns: ColumnDef<BatchStock>[] = [
    {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => row.original.id,
    },
    {
        accessorKey: 'created_at',
        header: 'Tanggal',
        cell: ({ row }) =>
            format(new Date(row.original.created_at), 'dd MMMM yyyy HH:mm', {
                locale: id,
            }),
    },
    {
        accessorKey: 'supplier',
        header: 'Supplier',
    },
    {
        accessorKey: 'total_amount',
        header: 'Total Biaya',
        cell: ({ row }) => formatCurrency(row.original.total_amount),
    },
    {
        accessorKey: 'user.name',
        header: 'Dicatat Oleh',
    },
    {
        header: 'Aksi',
        cell: ({ row }) => (
            <Link href={batchStocks.show(row.original.id).url}>
                <Button variant="outline">
                    <EyeIcon />
                </Button>
            </Link>
        ),
    },
];

export default columns;
