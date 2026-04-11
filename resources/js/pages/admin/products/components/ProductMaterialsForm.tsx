import { Button } from '@/components/ui/button';
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
import { Material } from '@/types';
import { PlusIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';

interface SelectedMaterial {
    id: number;
    name: string;
    quantity: number;
    unit: string;
}

interface ProductMaterialsFormProps {
    availableMaterials: Material[];
    selectedMaterials: SelectedMaterial[];
    onChange: (materials: SelectedMaterial[]) => void;
    error?: string;
}

export default function ProductMaterialsForm({
    availableMaterials,
    selectedMaterials,
    onChange,
    error,
}: ProductMaterialsFormProps) {
    const [currentMaterialId, setCurrentMaterialId] = useState<string>('');
    const [currentQuantity, setCurrentQuantity] = useState<string>('');

    const handleAddMaterial = () => {
        if (!currentMaterialId || !currentQuantity) return;

        const material = availableMaterials.find(
            (m) => m.id.toString() === currentMaterialId,
        );
        if (!material) return;

        // Check if material already added
        if (selectedMaterials.find((m) => m.id === material.id)) {
            // Option: update quantity or show alert. Let's update quantity.
            const updated = selectedMaterials.map((m) =>
                m.id === material.id
                    ? { ...m, quantity: m.quantity + Number(currentQuantity) }
                    : m,
            );
            onChange(updated);
        } else {
            onChange([
                ...selectedMaterials,
                {
                    id: material.id,
                    name: material.name,
                    quantity: Number(currentQuantity),
                    unit: material.unit,
                },
            ]);
        }

        setCurrentMaterialId('');
        setCurrentQuantity('');
    };

    const handleRemoveMaterial = (id: number) => {
        onChange(selectedMaterials.filter((m) => m.id !== id));
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4">
                <Label className="text-lg font-medium">Bahan Produk</Label>
                <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="material-select">Pilih Bahan</Label>
                        <Select
                            value={currentMaterialId}
                            onValueChange={setCurrentMaterialId}
                        >
                            <SelectTrigger
                                id="material-select"
                                className="mb-0"
                            >
                                <SelectValue placeholder="Pilih bahan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {availableMaterials.map((material) => (
                                        <SelectItem
                                            key={material.id}
                                            value={material.id.toString()}
                                            disabled={selectedMaterials.some(
                                                (m) => m.id === material.id,
                                            )}
                                        >
                                            {material.name} ({material.unit})
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quantity-input">Jumlah</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="quantity-input"
                                type="number"
                                min="1"
                                placeholder="Jumlah"
                                value={currentQuantity}
                                onChange={(e) =>
                                    setCurrentQuantity(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddMaterial();
                                    }
                                }}
                            />
                            {currentMaterialId && (
                                <span className="text-sm text-muted-foreground">
                                    {
                                        availableMaterials.find(
                                            (m) =>
                                                m.id.toString() ===
                                                currentMaterialId,
                                        )?.unit
                                    }
                                </span>
                            )}
                        </div>
                    </div>
                    <Button
                        type="button"
                        onClick={handleAddMaterial}
                        disabled={!currentMaterialId || !currentQuantity}
                        className="w-full sm:w-auto"
                    >
                        <PlusIcon className="mr-2 h-4 w-4" /> Tambah
                    </Button>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama Bahan</TableHead>
                            <TableHead>Jumlah</TableHead>
                            <TableHead className="w-[100px]">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {selectedMaterials.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={3}
                                    className="h-24 text-center"
                                >
                                    Belum ada bahan yang ditambahkan.
                                </TableCell>
                            </TableRow>
                        ) : (
                            selectedMaterials.map((m) => (
                                <TableRow key={m.id}>
                                    <TableCell>{m.name}</TableCell>
                                    <TableCell>
                                        {m.quantity} {m.unit}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            onClick={() =>
                                                handleRemoveMaterial(m.id)
                                            }
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
