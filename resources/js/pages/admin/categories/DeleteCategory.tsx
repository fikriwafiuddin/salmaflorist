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
import { destroy } from '@/routes/categories';
import { useForm } from '@inertiajs/react';
import { Trash2Icon } from 'lucide-react';
import { FormEvent, useState } from 'react';

type DeleteCategoryProps = {
    id: number;
};

function DeleteCategory({ id }: DeleteCategoryProps) {
    const [openConfirm, setOpenConfirm] = useState<boolean>(false);
    const [openError, setOpenError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const { submit, processing, clearErrors, errors } = useForm();

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearErrors();
        submit(destroy(id), {
            onError: (errors) => {
                setOpenConfirm(false);
                const message = errors.products || errors.error || Object.values(errors)[0] || 'Terjadi kesalahan saat menghapus kategori.';
                setErrorMessage(message);
                setOpenError(true);
            },
        });
    };

    return (
        <>
            <Button variant="destructive" onClick={() => setOpenConfirm(true)}>
                <Trash2Icon />
            </Button>

            {/* Confirmation Dialog */}
            <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Kategori</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah anda yakin untuk menghapus kategori ini?
                            Kategori tidak dapat dikembalikan lagi.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <form onSubmit={handleSubmit}>
                            <Button
                                className="w-full"
                                variant="destructive"
                                type="submit"
                                disabled={processing}
                            >
                                {processing ? <Spinner /> : 'Hapus'}
                            </Button>
                        </form>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Error Dialog */}
            <AlertDialog open={openError} onOpenChange={setOpenError}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-destructive">
                            Gagal Menghapus Kategori
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {errorMessage || 'Terjadi kesalahan saat menghapus kategori.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button
                            onClick={() => {
                                setOpenError(false);
                                setErrorMessage('');
                            }}
                            variant="outline"
                        >
                            Tutup
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export default DeleteCategory;
