import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import { create, index } from '@/routes/batch-stocks';
import { BreadcrumbItem, Material } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import FormBatchStock from '../FormBatchStock';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Riwayat Kulakan',
        href: index().url,
    },
    {
        title: 'Kulakan Baru',
        href: create().url,
    },
];

type BatchStockCreatePageProps = {
    materials: Material[];
};

function BatchStockCreatePage({ materials }: BatchStockCreatePageProps) {
    const { flash } = usePage<{ flash: { error: string } }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kulakan Baru" />
            <div className="p-4">
                {flash.error && (
                    <Alert>
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}
                <FormBatchStock materials={materials} />
            </div>
        </AppLayout>
    );
}

export default BatchStockCreatePage;
