import { Button } from '@/components/ui/button';
import {
    Dialog,
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

const STATUS_ORDER_PICKUP = [
    'pending',
    'paid',
    'process',
    'ready_for_pickup',
    'completed',
    'canceled',
];
const STATUS_ORDER_DELIVERY = [
    'pending',
    'paid',
    'process',
    'delivered',
    'completed',
    'canceled',
];

function UpdateStatus({ order }: UpdateStatusProps) {
    const [status, setStatus] = useState(order.status);
    const [processing, setProcessing] = useState(false);
    const [openTracking, setOpenTracking] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState(
        order.shipment?.tracking_number || '',
    );

    const getIsStatusDisabled = (statusItem: string) => {
        if (statusItem === order.status) return false;

        // 1. Jika status order masih pending, hanya paid dan canceled yang tidak disabled
        if (order.status === 'pending') {
            return !['pending', 'paid', 'canceled'].includes(statusItem);
        }

        // 2. Jika order belum dibayar, batasi transisi status
        if (!order.is_paid) {
            const postPaymentStatuses = order.shipping_method === 'pickup'
                ? ['process', 'ready_for_pickup', 'completed']
                : ['process', 'delivered', 'completed'];
            if (postPaymentStatuses.includes(statusItem)) {
                return true;
            }
        }

        // 3. Pada pesanan yang diantar (delivery), disabled status completed ketika belum dikirim
        if (
            order.shipping_method === 'delivery' &&
            statusItem === 'completed' &&
            order.status !== 'delivered' &&
            order.status !== 'completed'
        ) {
            return true;
        }

        return false;
    };

    const handleStatusChange = (newStatus: string) => {
        if (newStatus === status) return;

        // Validasi status pending
        if (order.status === 'pending' && !['pending', 'paid', 'canceled'].includes(newStatus)) {
            toast.error('Pesanan pending hanya bisa diubah ke status Paid atau Canceled.');
            return;
        }

        // Validasi pembayaran
        if (!order.is_paid) {
            const postPaymentStatuses = order.shipping_method === 'pickup'
                ? ['process', 'ready_for_pickup', 'completed']
                : ['process', 'delivered', 'completed'];
            if (postPaymentStatuses.includes(newStatus)) {
                toast.error('Status tidak bisa diubah jika pesanan belum dibayar.');
                return;
            }
        }

        // Validasi pengiriman untuk delivery order
        if (
            order.shipping_method === 'delivery' &&
            newStatus === 'completed' &&
            order.status !== 'delivered' &&
            order.status !== 'completed'
        ) {
            toast.error('Pesanan harus dikirim terlebih dahulu sebelum diselesaikan.');
            return;
        }

        if (newStatus === 'delivered' && order.shipping_method === 'delivery') {
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
                disabled={processing || order.status === 'canceled'}
                value={status}
                onValueChange={handleStatusChange}
            >
                <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {order.shipping_method === 'pickup' &&
                            STATUS_ORDER_PICKUP.map((statusItem) => {
                                const isDisabled = getIsStatusDisabled(statusItem);
                                return (
                                    <SelectItem
                                        key={statusItem}
                                        value={statusItem}
                                        disabled={isDisabled}
                                    >
                                        <span className={isDisabled ? 'opacity-50' : ''}>
                                            {translateStatus(statusItem)}
                                        </span>
                                        {processing && statusItem === status && (
                                            <Spinner className="ml-2 h-4 w-4" />
                                        )}
                                    </SelectItem>
                                );
                            })}
                        {order.shipping_method === 'delivery' &&
                            STATUS_ORDER_DELIVERY.map((statusItem) => {
                                const isDisabled = getIsStatusDisabled(statusItem);
                                return (
                                    <SelectItem
                                        key={statusItem}
                                        value={statusItem}
                                        disabled={isDisabled}
                                    >
                                        <span className={isDisabled ? 'opacity-50' : ''}>
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

            <Dialog
                open={openTracking}
                onOpenChange={(open) => !processing && setOpenTracking(open)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Input Nomor Resi</DialogTitle>
                        <DialogDescription>
                            Pesanan dari web membutuhkan nomor resi sebelum
                            diubah statusnya menjadi Dikirim.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="tracking_number">Nomor Resi</Label>
                            <Input
                                id="tracking_number"
                                value={trackingNumber}
                                onChange={(e) =>
                                    setTrackingNumber(e.target.value)
                                }
                                placeholder="Masukkan nomor resi..."
                                disabled={processing}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpenTracking(false)}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleConfirmTracking}
                            disabled={processing}
                        >
                            {processing ? (
                                <Spinner className="mr-2 h-4 w-4" />
                            ) : null}
                            Simpan & Kirim
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default UpdateStatus;
