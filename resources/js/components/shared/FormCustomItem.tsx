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
import useCartStore from '@/hooks/useCartStore';
import { ReactNode, useState } from 'react';
import { z, ZodError } from 'zod';

const customItemSchema = z.object({
    custom_name: z
        .string('Kolom nama custom harus berupa string')
        .trim()
        .min(3, 'Kolom nama custom harus minimal 3 karakter')
        .max(55, 'Kolom nama custom tidak boleh lebih dari 55 karakter'),
    custom_description: z
        .string('Kolom deskripsi custom harus berupa string')
        .trim()
        .min(3, 'Kolom deskripsi custom harus minimal 3 karakter'),
    unit_price: z
        .number('Kolom harga harus berupa angka')
        .positive('Kolom harga harus berupa angka positif'),
    quantity: z
        .number('Kolom jumlah harus berupa angka')
        .positive('Kolom jumlah harus berupa angka positif'),
});

type FormCustomItemProps = {
    customItem?: z.infer<typeof customItemSchema>;
    children: ReactNode;
    type: 'ADD' | 'UPDATE';
    index?: number;
};

function FormCustomItem({
    customItem,
    children,
    type,
    index,
}: FormCustomItemProps) {
    const [open, setOpen] = useState<boolean>(false);
    const [form, setForm] = useState({
        custom_name: customItem?.custom_name || '',
        custom_description: customItem?.custom_description || '',
        unit_price: customItem?.unit_price || 0,
        quantity: customItem?.quantity || 1,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const addItem = useCartStore((state) => state.addItem);
    const updateCustomItem = useCartStore((state) => state.updateCustomItem);

    const handleAddItem = () => {
        try {
            const validatedData = customItemSchema.parse(form);
            if (type === 'UPDATE' && index !== undefined) {
                updateCustomItem({ ...validatedData }, index);
            } else {
                addItem(
                    {
                        ...validatedData,
                        is_custom: true,
                        product: null,
                    },
                    validatedData.quantity,
                );
            }
            if (type === 'ADD') {
                setForm({
                    custom_name: '',
                    custom_description: '',
                    unit_price: 0,
                    quantity: 1,
                });
            }
            setErrors({});
            setOpen(false);
        } catch (error) {
            if (error instanceof ZodError) {
                const fieldErrors: Record<string, string> = {};
                error.issues.forEach((err) => {
                    const path = err.path.join('.');
                    fieldErrors[path] = err.message;
                });
                setErrors(fieldErrors);
            }
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
                    <div className="min-w-0 space-y-4">
                        <div>
                            <Label
                                htmlFor="custom_name"
                                className={
                                    errors.custom_name ? 'text-destructive' : ''
                                }
                            >
                                Nama Item
                            </Label>
                            <Input
                                id="custom_name"
                                name="custom_name"
                                placeholder="Contoh: Tambahan 5 Mawar Merah"
                                value={form.custom_name}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        custom_name: e.target.value,
                                    }))
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
                                value={form.custom_description}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        custom_description: e.target.value,
                                    }))
                                }
                            />
                            <InputError message={errors.custom_description} />
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
                                    value={form.unit_price}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            unit_price:
                                                parseInt(e.target.value) || 0,
                                        }))
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
                                    value={form.quantity}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            quantity:
                                                parseInt(e.target.value) || 0,
                                        }))
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

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Batal</Button>
                        </DialogClose>
                        <Button onClick={handleAddItem}>
                            {type === 'ADD' ? 'Tambahkan' : 'Simpan Perubahan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default FormCustomItem;
