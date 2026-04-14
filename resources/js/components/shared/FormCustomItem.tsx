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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Material } from '@/types';
import { useForm } from '@inertiajs/react';
import { InfoIcon, PlusIcon, Trash2 } from 'lucide-react';
import { FormEvent, ReactNode, useState } from 'react';

type SelectedMaterial = {
    material_id: number;
    name: string;
    quantity: number;
    unit: string;
    price: number;
};

type FormCustomItemProps = {
    customItem?: {
        name?: string | null;
        description?: string | null;
        unit_price?: number;
        quantity?: number;
        custom_detail?: {
            name?: string;
            description?: string;
            materials?: {
                material_id: number;
                quantity: number;
                material: Material;
            }[];
        };
    };
    availableMaterials?: Material[];
    children: ReactNode;
    type: 'ADD' | 'UPDATE';
    id?: number;
};

function formatRupiah(amount: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

function FormCustomItem({
    id,
    customItem,
    availableMaterials = [],
    children,
    type,
}: FormCustomItemProps) {
    const [open, setOpen] = useState<boolean>(false);
    const [currentMaterialId, setCurrentMaterialId] = useState<string>('');
    const [currentQuantity, setCurrentQuantity] = useState<string>('');

    // Pre-calculate initial materials if updating
    const initialMaterials: SelectedMaterial[] =
        customItem?.custom_detail?.materials?.map((m) => ({
            material_id: m.material_id,
            name: m.material.name,
            quantity: m.quantity,
            unit: m.material.unit,
            price: m.material.price,
        })) || [];

    const { post, patch, data, setData, processing, errors, isDirty, reset } =
        useForm({
            name: customItem?.name || customItem?.custom_detail?.name || '',
            description:
                customItem?.description ||
                customItem?.custom_detail?.description ||
                '',
            quantity: customItem?.quantity || 1,
            is_custom: 1,
            materials: initialMaterials,
        });
    console.log(errors);
    const SERVICE_FEE = 50000;

    const handleAddMaterial = () => {
        if (!currentMaterialId || !currentQuantity) return;

        const material = availableMaterials.find(
            (m) => m.id.toString() === currentMaterialId,
        );
        if (!material) return;

        const existing = data.materials.find(
            (m) => m.material_id === material.id,
        );

        if (existing) {
            const updated = data.materials.map((m) =>
                m.material_id === material.id
                    ? { ...m, quantity: m.quantity + Number(currentQuantity) }
                    : m,
            );
            setData('materials', updated);
        } else {
            setData('materials', [
                ...data.materials,
                {
                    material_id: material.id,
                    name: material.name,
                    quantity: Number(currentQuantity),
                    unit: material.unit,
                    price: material.price,
                },
            ]);
        }

        setCurrentMaterialId('');
        setCurrentQuantity('');
    };
    const subtotal = data.materials.reduce((acc, material) => {
        return acc + material.price * material.quantity;
    }, 0);

    const handleRemoveMaterial = (materialId: number) => {
        setData(
            'materials',
            data.materials.filter((m) => m.material_id !== materialId),
        );
    };

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
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-playfair-display text-2xl font-bold text-primary">
                            {type === 'ADD'
                                ? 'Buat Pesanan Kustom'
                                : 'Edit Pesanan Kustom'}
                        </DialogTitle>
                        <DialogDescription>
                            Sesuai keinginan Anda, pilih bahan dan berikan
                            detail pesanan kustom.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6 py-4">
                        <div className="grid gap-6 md:grid-cols-1">
                            {/* Left Side: General Info */}
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Nama Item</Label>
                                    <Input
                                        id="name"
                                        placeholder="Misal: Buket Mawar Putih Besar"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        className={
                                            errors.name
                                                ? 'border-destructive'
                                                : ''
                                        }
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div>
                                    <Label htmlFor="description">
                                        Catatan / Detail
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Pita warna gold, bungkus kertas pink..."
                                        className="h-24"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError message={errors.description} />
                                </div>

                                <div className="rounded-xl border border-pink-100 bg-pink-50/50 p-4">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            Biaya Jasa
                                        </span>
                                        <span className="font-semibold text-primary">
                                            {formatRupiah(SERVICE_FEE)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-pink-100 pt-2">
                                        <span className="text-base font-bold">
                                            Total Harga
                                        </span>
                                        <span className="text-xl font-bold text-primary">
                                            {formatRupiah(
                                                subtotal + SERVICE_FEE,
                                            )}
                                        </span>
                                    </div>
                                    <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground italic">
                                        <InfoIcon className="h-3 w-3" />
                                        Harga dihitung otomatis dari (Bahan +
                                        Jasa)
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="quantity">
                                        Jumlah Pesanan
                                    </Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        min="1"
                                        value={data.quantity}
                                        onChange={(e) =>
                                            setData(
                                                'quantity',
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                    <InputError message={errors.quantity} />
                                </div>
                            </div>

                            {/* Right Side: Material Selection */}
                            <div className="space-y-4">
                                <Label className="flex items-center gap-2 text-sm font-bold">
                                    Pilih Bahan{' '}
                                    <span className="text-xs font-normal text-muted-foreground">
                                        (Bahan yang tersedia)
                                    </span>
                                </Label>

                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <Select
                                            value={currentMaterialId}
                                            onValueChange={setCurrentMaterialId}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih bahan..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {availableMaterials.map(
                                                        (m) => (
                                                            <SelectItem
                                                                key={m.id}
                                                                value={m.id.toString()}
                                                                disabled={data.materials.some(
                                                                    (dm) =>
                                                                        dm.material_id ===
                                                                        m.id,
                                                                )}
                                                            >
                                                                {m.name} (
                                                                {formatRupiah(
                                                                    m.price,
                                                                )}
                                                                /{m.unit})
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-20">
                                        <Input
                                            type="number"
                                            placeholder="Qty"
                                            value={currentQuantity}
                                            onChange={(e) =>
                                                setCurrentQuantity(
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        size="icon"
                                        onClick={handleAddMaterial}
                                        disabled={
                                            !currentMaterialId ||
                                            !currentQuantity
                                        }
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="max-h-[250px] overflow-x-hidden overflow-y-auto rounded-md border">
                                    <Table>
                                        <TableHeader className="bg-muted/50">
                                            <TableRow>
                                                <TableHead className="h-8 py-2 text-xs">
                                                    Bahan
                                                </TableHead>
                                                <TableHead className="h-8 py-2 text-xs">
                                                    Jml
                                                </TableHead>
                                                <TableHead className="h-8 py-2 text-right text-xs">
                                                    Subtotal
                                                </TableHead>
                                                <TableHead className="h-8 w-8 py-2"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.materials.length === 0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={4}
                                                        className="h-20 text-center text-xs text-muted-foreground"
                                                    >
                                                        Belum ada bahan dipilih
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                data.materials.map((m) => (
                                                    <TableRow
                                                        key={m.material_id}
                                                    >
                                                        <TableCell className="h-8 py-2 text-xs font-medium">
                                                            {m.name}
                                                        </TableCell>
                                                        <TableCell className="h-8 py-2 text-xs">
                                                            {m.quantity}{' '}
                                                            {m.unit}
                                                        </TableCell>
                                                        <TableCell className="h-8 py-2 text-right text-xs">
                                                            {formatRupiah(
                                                                m.price *
                                                                    m.quantity,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="h-8 py-2 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleRemoveMaterial(
                                                                        m.material_id,
                                                                    )
                                                                }
                                                                className="text-muted-foreground hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                                <InputError message={errors.materials} />
                            </div>
                        </div>

                        <DialogFooter className="">
                            <DialogClose asChild>
                                <Button variant="outline">Batal</Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                disabled={
                                    processing ||
                                    data.materials.length === 0 ||
                                    isDirty
                                }
                                className="bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90"
                            >
                                {processing
                                    ? 'Memproses...'
                                    : type === 'ADD'
                                      ? 'Tambahkan ke Keranjang'
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
