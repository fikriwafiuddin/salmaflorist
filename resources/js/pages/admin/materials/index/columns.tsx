import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { edit, show } from '@/routes/materials';
import { Material } from '@/types';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { EditIcon, HistoryIcon } from 'lucide-react';
import DeleteMaterial from '../DeleteMaterial';
import AddItemCalculator from './AddItemCalculator';

const columns: ColumnDef<Material>[] = [
    {
        accessorKey: 'id',
        header: 'ID',
    },
    {
        accessorKey: 'name',
        header: 'Nama',
    },
    {
        accessorKey: 'price',
        header: 'Harga',
        cell: ({ row }) => formatCurrency(row.getValue('price')),
    },
    {
        accessorKey: 'stock',
        header: 'Stok',
        cell: ({ row }) => (row.getValue('stock') as number).toLocaleString(),
    },
    {
        accessorKey: 'unit',
        header: 'Unit',
    },
    {
        accessorKey: 'weight',
        header: 'Berat (Gr)',
        cell: ({ row }) => (row.getValue('weight') as number).toLocaleString(),
    },
    {
        header: 'Aksi',
        cell: ({ row }) => {
            const id = row.getValue('id') as number;

            return (
                <div className="flex gap-2">
                    <Link href={show(id).url}>
                        <Button variant="outline" title="Riwayat Stok">
                            <HistoryIcon />
                        </Button>
                    </Link>
                    <Link href={edit(id)}>
                        <Button>
                            <EditIcon />
                        </Button>
                    </Link>
                    <DeleteMaterial id={id} />
                    <AddItemCalculator material={row.original} />
                </div>
            );
        },
    },
];
export default columns;
