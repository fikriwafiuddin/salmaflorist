import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store, update } from '@/routes/materials';
import { Material } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type FormMaterialProps = {
    material?: Material;
};

function FormMaterial({ material }: FormMaterialProps) {
    const { data, setData, processing, submit, errors, isDirty } = useForm({
        name: material?.name || '',
        price: material?.price || '',
        unit: material?.unit || '',
        weight: material?.weight || '',
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (material) {
            submit(update(material.id));
        } else {
            submit(store());
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <Label
                            htmlFor="name"
                            className={errors.name ? 'text-destructive' : ''}
                        >
                            Nama Bahan
                        </Label>
                        <Input
                            name="name"
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className={
                                errors.name
                                    ? 'border-destructive focus-visible:ring-destructive'
                                    : ''
                            }
                            placeholder="Masukkan nama"
                        />
                        {errors.name && (
                            <span className="text-sm text-destructive">
                                {errors.name}
                            </span>
                        )}
                    </div>

                    <div>
                        <Label
                            htmlFor="price"
                            className={errors.price ? 'text-destructive' : ''}
                        >
                            Harga
                        </Label>
                        <Input
                            name="price"
                            id="price"
                            type="text"
                            value={data.price}
                            onChange={(e) => setData('price', e.target.value)}
                            className={
                                errors.price
                                    ? 'border-destructive focus-visible:ring-destructive'
                                    : ''
                            }
                            placeholder="Masukkan harga"
                        />
                        {errors.price && (
                            <span className="text-sm text-destructive">
                                {errors.price}
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <Label
                            htmlFor="weight"
                            className={errors.weight ? 'text-destructive' : ''}
                        >
                            Berat (Gram)
                        </Label>
                        <Input
                            name="weight"
                            id="weight"
                            type="text"
                            value={data.weight}
                            onChange={(e) => setData('weight', e.target.value)}
                            className={
                                errors.weight
                                    ? 'border-destructive focus-visible:ring-destructive'
                                    : ''
                            }
                            placeholder="Masukkan berat"
                        />
                        {errors.weight && (
                            <span className="text-sm text-destructive">
                                {errors.weight}
                            </span>
                        )}
                    </div>

                    <div>
                        <Label
                            htmlFor="unit"
                            className={errors.unit ? 'text-destructive' : ''}
                        >
                            Unit
                        </Label>
                        <Input
                            name="unit"
                            id="unit"
                            type="text"
                            value={data.unit}
                            onChange={(e) => setData('unit', e.target.value)}
                            className={
                                errors.unit
                                    ? 'border-destructive focus-visible:ring-destructive'
                                    : ''
                            }
                            placeholder="Masukkan unit (contoh: Pcs, Kg)"
                        />
                        {errors.unit && (
                            <span className="text-sm text-destructive">
                                {errors.unit}
                            </span>
                        )}
                    </div>
                </div>

                <Button type="submit" disabled={processing || !isDirty}>
                    {processing ? <Spinner /> : 'Simpan'}
                </Button>
            </div>
        </form>
    );
}

export default FormMaterial;
