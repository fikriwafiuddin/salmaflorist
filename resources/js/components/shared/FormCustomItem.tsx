import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { FormEvent, ReactNode, useState } from 'react';

type FormCustomItemProps = {
    customItem?: {
        custom_name?: string | null;
        custom_description?: string | null;
        unit_price?: number;
        quantity?: number;
    };
    children: ReactNode;
    type: 'ADD' | 'UPDATE';
    index?: number;
    id?: number;
};

function FormCustomItem({
    id,
    customItem,
    children,
    type,
}: FormCustomItemProps) {
    const [open, setOpen] = useState<boolean>(false);
    const { post, patch, data, setData, processing, errors, isDirty, reset } =
        useForm({
            custom_name: customItem?.custom_name || '',
            custom_description: customItem?.custom_description || '',
            unit_price: customItem?.unit_price || 0,
            quantity: customItem?.quantity || 1,
            is_custom: 1,
        });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const options = {
            onSuccess: () => {
                setOpen(false);
                if (type === 'ADD') reset();
            },
            onError: (errors: Record<string, string>) => {
                console.log(errors);
            },
        };

        if (type === 'ADD') {
            post('/cart', options);
        } else {
            patch(`/cart/${id}`, options);
        }
    };

    return (
        <>
            <div onClick={() => setOpen(true)} className="cursor-pointer">
                {children}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {type === 'ADD'
                                ? 'Tambah Item Custom'
                                : 'Edit Item Custom'}
                        </DialogTitle>
                        <DialogDescription>
                            {type === 'ADD'
                                ? 'Masukkan detail pesanan kustom sesuai kesepakatan dengan florist.'
                                : 'Perbarui detail item kustom Anda.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="min-w-0 space-y-4">
                            <div>
                                <Label
                                    htmlFor="custom_name"
                                    className={
                                        errors.custom_name
                                            ? 'text-destructive'
                                            : ''
                                    }
                                >
                                    Nama Item
                                </Label>
                                <Input
                                    id="custom_name"
                                    name="custom_name"
                                    placeholder="Contoh: Tambahan 5 Mawar Merah"
                                    value={data.custom_name}
                                    onChange={(e) =>
                                        setData('custom_name', e.target.value)
                                    }
                                    className={
                                        errors.custom_name
                                            ? 'border-destructive focus-visible:ring-destructive'
                                            : ''
                                    }
                                />
                                <InputError message={errors.custom_name} />
                            </div>
                            <div>
                                <Label
                                    htmlFor="custom_description"
                                    className={
                                        errors.custom_description
                                            ? 'text-destructive'
                                            : ''
                                    }
                                >
                                    Deskripsi / Catatan
                                </Label>
                                <Textarea
                                    id="custom_description"
                                    name="custom_description"
                                    placeholder="Jelaskan detail kustomisasi di sini..."
                                    className={`max-h-36 ${errors.custom_description ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                    value={data.custom_description}
                                    onChange={(e) =>
                                        setData(
                                            'custom_description',
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={errors.custom_description}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label
                                        htmlFor="unit_price"
                                        className={
                                            errors.unit_price
                                                ? 'text-destructive'
                                                : ''
                                        }
                                    >
                                        Harga Satuan (Rp)
                                    </Label>
                                    <Input
                                        id="unit_price"
                                        name="unit_price"
                                        type="number"
                                        value={data.unit_price}
                                        onChange={(e) =>
                                            setData(
                                                'unit_price',
                                                Number(e.target.value),
                                            )
                                        }
                                        className={
                                            errors.unit_price
                                                ? 'border-destructive focus-visible:ring-destructive'
                                                : ''
                                        }
                                    />
                                    <InputError message={errors.unit_price} />
                                </div>
                                <div>
                                    <Label
                                        htmlFor="quantity"
                                        className={
                                            errors.quantity
                                                ? 'text-destructive'
                                                : ''
                                        }
                                    >
                                        Jumlah
                                    </Label>
                                    <Input
                                        id="quantity"
                                        name="quantity"
                                        type="number"
                                        value={data.quantity}
                                        onChange={(e) =>
                                            setData(
                                                'quantity',
                                                Number(e.target.value),
                                            )
                                        }
                                        className={
                                            errors.quantity
                                                ? 'border-destructive focus-visible:ring-destructive'
                                                : ''
                                        }
                                    />
                                    <InputError message={errors.quantity} />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="mt-4">
                            <DialogClose asChild>
                                <Button variant="outline">Batal</Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                disabled={processing || !isDirty}
                            >
                                {processing
                                    ? 'Memproses...'
                                    : type === 'ADD'
                                      ? 'Tambahkan'
                                      : 'Simpan Perubahan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default FormCustomItem;
