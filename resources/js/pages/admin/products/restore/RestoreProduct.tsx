import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useForm } from '@inertiajs/react';
import { RefreshCcw } from 'lucide-react';
import { FormEvent, useState } from 'react';

type RestoreProductProps = {
    id: number;
};

function RestoreProduct({ id }: RestoreProductProps) {
    const [openConfirm, setOpenConfirm] = useState<boolean>(false);
    const { put, processing } = useForm();

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(`/admin/products/${id}/restore`);
    };

    return (
        <>
            <Button variant="outline" onClick={() => setOpenConfirm(true)}>
                <RefreshCcw />
            </Button>

            <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Restore Produk</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah anda yakin untuk mengembalikan produk ini?
                        </AlertDialogDescription>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <form onSubmit={handleSubmit}>
                                <Button
                                    className="w-full"
                                    type="submit"
                                    disabled={processing}
                                >
                                    {processing ? <Spinner /> : 'Restore'}
                                </Button>
                            </form>
                        </AlertDialogFooter>
                    </AlertDialogHeader>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export default RestoreProduct;
