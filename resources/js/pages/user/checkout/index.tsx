import { Cart, Province } from '@/types';
import QueryClientProvider from '@/wrappers/QueryClientProvider';
import ContentCheckoutPage from './Content';

type CheckoutPageProps = {
    provinces: Province[];
    cart: Cart;
};

function CheckoutPage({ provinces, cart }: CheckoutPageProps) {
    return (
        <QueryClientProvider>
            <ContentCheckoutPage provinces={provinces} cart={cart} />
        </QueryClientProvider>
    );
}

export default CheckoutPage;
