import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { PAYMENT_METHODS } from '@/constants';
import { formatCurrency } from '@/lib/utils';
import { store } from '@/routes/batch-stocks';
import { Material } from '@/types';
import { useForm } from '@inertiajs/react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { FormEvent } from 'react';

type FormBatchStockProps = {
    materials: Material[];
};

interface RestockItem {
    material_id: string;
    quantity: string;
    price: string;
    expired_date: string;
}

function FormBatchStock({ materials }: FormBatchStockProps) {
    const { data, setData, post, processing, errors } = useForm({
        supplier: '',
        payment_method: '',
        items: [
            { material_id: '', quantity: '', price: '', expired_date: '' },
        ] as RestockItem[],
    });
    console.log(errors);

    const addItem = () => {
        setData('items', [
            ...data.items,
            { material_id: '', quantity: '', price: '', expired_date: '' },
        ]);
    };

    const removeItem = (index: number) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const updateItem = (
        index: number,
        field: keyof RestockItem,
        value: string,
    ) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setData('items', newItems);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(store().url);
    };

    const calculateTotal = () => {
        return data.items.reduce((acc, item) => {
            const q = parseInt(item.quantity) || 0;
            const p = parseInt(item.price) || 0;
            return acc + q * p;
        }, 0);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Informasi Batch Kulakan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label
                            htmlFor="supplier"
                            className={
                                errors.supplier ? 'text-destructive' : ''
                            }
                        >
                            Supplier
                        </Label>
                        <Input
                            id="supplier"
                            value={data.supplier}
                            onChange={(e) =>
                                setData('supplier', e.target.value)
                            }
                            placeholder="Masukkan nama supplier"
                            className={
                                errors.supplier ? 'border-destructive' : ''
                            }
                        />
                        {errors.supplier && (
                            <span className="text-xs text-destructive">
                                {errors.supplier}
                            </span>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label
                            htmlFor="payment_method"
                            className={
                                errors.payment_method ? 'text-destructive' : ''
                            }
                        >
                            Metode Pembayaran
                        </Label>
                        <Select
                            value={data.payment_method}
                            onValueChange={(value) =>
                                setData('payment_method', value)
                            }
                        >
                            <SelectTrigger
                                className={
                                    errors.payment_method
                                        ? 'border-destructive'
                                        : ''
                                }
                            >
                                <SelectValue placeholder="Pilih Metode Pembayaran" />
                            </SelectTrigger>
                            <SelectContent>
                                {PAYMENT_METHODS.map((method) => (
                                    <SelectItem key={method} value={method}>
                                        {method}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.payment_method && (
                            <span className="text-xs text-destructive">
                                {errors.payment_method}
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Daftar Item Bahan</CardTitle>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addItem}
                    >
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Tambah Item
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data.items.map((item, index) => (
                            <div
                                key={index}
                                className="relative grid grid-cols-1 items-end gap-4 rounded-lg border p-4 md:grid-cols-12"
                            >
                                <div className="space-y-2 md:col-span-3">
                                    <Label>Bahan</Label>
                                    <Select
                                        value={item.material_id}
                                        onValueChange={(value) =>
                                            updateItem(
                                                index,
                                                'material_id',
                                                value,
                                            )
                                        }
                                    >
                                        <SelectTrigger
                                            className={
                                                errors[
                                                    `items.${index}.material_id`
                                                ]
                                                    ? 'border-destructive'
                                                    : ''
                                            }
                                        >
                                            <SelectValue placeholder="Pilih Bahan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {materials.map((m) => (
                                                <SelectItem
                                                    key={m.id}
                                                    value={m.id.toString()}
                                                >
                                                    {m.name} ({m.unit})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors[`items.${index}.material_id`] && (
                                        <span className="text-xs text-destructive">
                                            {
                                                errors[
                                                    `items.${index}.material_id`
                                                ]
                                            }
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label>Jumlah</Label>
                                    <Input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) =>
                                            updateItem(
                                                index,
                                                'quantity',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Qty"
                                        className={
                                            errors[`items.${index}.quantity`]
                                                ? 'border-destructive'
                                                : ''
                                        }
                                    />
                                    {errors[`items.${index}.quantity`] && (
                                        <span className="text-xs text-destructive">
                                            {errors[`items.${index}.quantity`]}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2 md:col-span-3">
                                    <Label>Harga Satuan</Label>
                                    <Input
                                        type="number"
                                        value={item.price}
                                        onChange={(e) =>
                                            updateItem(
                                                index,
                                                'price',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Harga"
                                        className={
                                            errors[`items.${index}.price`]
                                                ? 'border-destructive'
                                                : ''
                                        }
                                    />
                                    {errors[`items.${index}.price`] && (
                                        <span className="text-xs text-destructive">
                                            {errors[`items.${index}.price`]}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2 md:col-span-3">
                                    <Label>Kadaluarsa (Opsional)</Label>
                                    <Input
                                        type="date"
                                        value={item.expired_date}
                                        onChange={(e) =>
                                            updateItem(
                                                index,
                                                'expired_date',
                                                e.target.value,
                                            )
                                        }
                                        className={
                                            errors[
                                                `items.${index}.expired_date`
                                            ]
                                                ? 'border-destructive'
                                                : ''
                                        }
                                    />
                                    {errors[`items.${index}.expired_date`] && (
                                        <span className="text-xs text-destructive">
                                            {
                                                errors[
                                                    `items.${index}.expired_date`
                                                ]
                                            }
                                        </span>
                                    )}
                                </div>

                                <div className="md:col-span-1">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        disabled={data.items.length === 1}
                                        onClick={() => removeItem(index)}
                                    >
                                        <Trash2Icon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex flex-col items-end gap-2 border-t pt-4">
                        <div className="text-sm font-medium text-muted-foreground">
                            Total Keseluruhan
                        </div>
                        <div className="text-2xl font-bold">
                            {formatCurrency(calculateTotal())}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button
                    type="submit"
                    size="lg"
                    disabled={processing}
                    className="w-full min-w-[200px] md:w-auto"
                >
                    {processing ? (
                        <Spinner className="mr-2" />
                    ) : (
                        'Simpan Transaksi Kulakan'
                    )}
                </Button>
            </div>
        </form>
    );
}

export default FormBatchStock;
