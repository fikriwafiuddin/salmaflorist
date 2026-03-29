import { PropsWithChildren } from 'react';
import { Toaster } from 'sonner';

export default function UserLayout({ children }: PropsWithChildren) {
    return (
        <div>
            <Toaster position="top-right" richColors />
            {children}
        </div>
    );
}
