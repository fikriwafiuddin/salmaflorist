import {
    QueryClient,
    QueryClientProvider as ReactQueryClientProvider,
} from '@tanstack/react-query';
import { useState } from 'react';

function QueryClientProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 5 * 60 * 1000,
                        gcTime: 10 * 60 * 1000,
                        retry: 2,
                        refetchOnWindowFocus: false,
                        refetchOnMount: false,
                    },
                },
            }),
    );

    return (
        <ReactQueryClientProvider client={queryClient}>
            {children}
        </ReactQueryClientProvider>
    );
}

export default QueryClientProvider;
