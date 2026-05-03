import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { translateStatus } from '@/lib/utils';
import { updateStatus } from '@/routes/orders';
import { Order } from '@/types';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

type UpdateStatusProps = {
    order: Order;
};

function UpdateStatus({ order }: UpdateStatusProps) {
    const [status, setStatus] = useState(order.status);
    const [processing, setProcessing] = useState(false);
    const [openTracking, setOpenTracking] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState(order.shipment?.tracking_number || '');

    const statuses = ['pending', 'paid', 'process', 'ready_for_pickup', 'delivered', 'completed', 'canceled'];

    const handleStatusChange = (newStatus: string) => {
        if (newStatus === status) return;

        // Validation: Cannot set to process or completed if not paid
        if (!order.is_paid && ['process', 'ready_for_pickup', 'delivered', 'completed'].includes(newStatus)) {
            alert('Status tidak bisa diubah jika pesanan belum dibayar.');
            return;
        }

        if (newStatus === 'delivered' && order.order_source === 'web') {
            setOpenTracking(true);
            return;
        }

        submitStatusChange(newStatus);
    };

    const submitStatusChange = (newStatus: string, trackNum?: string) => {
        setStatus(newStatus);
        setProcessing(true);

        router.post(
            updateStatus(order.id).url,
            {
                _method: 'PATCH',
                status: newStatus,
                tracking_number: trackNum,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setProcessing(false);
                    setOpenTracking(false);
                    toast.success('Status pesanan berhasil diperbarui');
                },
                onError: (errors) => {
                    setProcessing(false);
                    setStatus(order.status);
                    if (errors.tracking_number) {
                        toast.error(errors.tracking_number);
                    } else {
                        toast.error('Gagal memperbarui status pesanan');
                    }
                },
            },
        );
    };

    const handleConfirmTracking = () => {
        if (!trackingNumber.trim()) {
            toast.error('Nomor resi harus diisi');
            return;
        }
        submitStatusChange('delivered', trackingNumber);
    };

    return (
        <>
            <Select
                disabled={processing}
                value={status}
                onValueChange={handleStatusChange}
            >
                <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {statuses.map((statusItem) => {
                            const isDisabled = !order.is_paid && ['process', 'ready_for_pickup', 'delivered', 'completed'].includes(statusItem);
                            
                            return (
                                <SelectItem 
                                    key={statusItem} 
                                    value={statusItem}
                                    disabled={isDisabled}
                                >
                                    <span className={isDisabled ? "opacity-50" : ""}>
                                        {translateStatus(statusItem)}
                                    </span>
                                    {processing && statusItem === status && (
                                        <Spinner className="ml-2 h-4 w-4" />
                                    )}
                                </SelectItem>
                            );
                        })}
                    </SelectGroup>
                </SelectContent>
            </Select>

            <Dialog open={openTracking} onOpenChange={(open) => !processing && setOpenTracking(open)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Input Nomor Resi</DialogTitle>
                        <DialogDescription>
                            Pesanan dari web membutuhkan nomor resi sebelum diubah statusnya menjadi Dikirim.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="tracking_number">Nomor Resi</Label>
                            <Input
                                id="tracking_number"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                placeholder="Masukkan nomor resi..."
                                disabled={processing}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenTracking(false)} disabled={processing}>
                            Batal
                        </Button>
                        <Button onClick={handleConfirmTracking} disabled={processing}>
                            {processing ? <Spinner className="mr-2 h-4 w-4" /> : null}
                            Simpan & Kirim
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default UpdateStatus;
