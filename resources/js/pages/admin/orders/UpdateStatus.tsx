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

type UpdateStatusProps = {
    order: Order;
};

function UpdateStatus({ order }: UpdateStatusProps) {
    const [status, setStatus] = useState(order.status);
    const [processing, setProcessing] = useState(false);

    const statuses = ['pending', 'paid', 'process', 'completed', 'canceled'];

    const handleStatusChange = (newStatus: string) => {
        if (newStatus === status) return;

        // Validation: Cannot set to process or completed if not paid
        if (!order.is_paid && (newStatus === 'process' || newStatus === 'completed')) {
            alert('Status tidak bisa diubah ke Progres atau Selesai jika pesanan belum dibayar.');
            return;
        }

        setStatus(newStatus);
        setProcessing(true);

        router.post(
            updateStatus(order.id).url,
            {
                _method: 'PATCH',
                status: newStatus,
            },
            {
                preserveScroll: true,
                onSuccess: () => setProcessing(false),
                onError: () => {
                    setProcessing(false);
                    setStatus(order.status);
                },
            },
        );
    };

    return (
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
                        const isDisabled = !order.is_paid && (statusItem === 'completed' || statusItem === 'process');
                        
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
    );
}

export default UpdateStatus;
