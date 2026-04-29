import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Category {
    id: number;
    name: string;
}

export interface Product {
    id: number;
    name: string;
    price: number;
    weight: number;
    description: string;
    image: string;
    category_id: number;
    category?: {
        id: number;
        name: string;
    };
    materials?: (Material & { pivot: { quantity: number } })[];
}

export interface Testimony {
    id: number;
    customer_name: string;
    rating: number;
    customer_status: string;
    review: string;
    created_at: Date;
}

export interface Material {
    id: number;
    name: string;
    price: number;
    stock: number;
    unit: string;
    weight: number;
}

export interface ProductMaterial {
    id: number;
    product_id: number;
    material_id: number;
    quantity: number;
    material?: Material;
}

export interface Order extends TimeStamp {
    id: number;
    invoice_number: string;
    customer_name: string;
    whatsapp_number: string;
    address:
        | string
        | {
              address_detail: string;
              province?: Province;
              city?: City;
              district?: District;
          };
    schedule: Date;
    total_amount: number;
    is_paid: boolean;
    shipping_method: 'delivery' | 'pickup';
    notes: string | null;
    status: string;
    created_at: Date;
    shipment?: Shipment;
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number | null;
    is_custom: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
    product?: Product | null;
    custom_name?: string | null;
    custom_description?: string | null;
}

export interface TimeStamp {
    created_at: Date;
    updated_at: Date;
}

export interface CashTransaction extends TimeStamp {
    id: number;
    order_id?: number | null;
    batch_stock_id?: number | null;
    type: 'income' | 'expense';
    category: string;
    payment_method: 'cash' | 'transfer' | 'qris';
    amount: number;
    transaction_date: Date;
    notes: string;
}

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Cart {
    id: number;
    user_id: number;
    items: CartItem[];
}

export interface CartItem {
    id: number;
    cart_id: number;
    product_id: number | null;
    is_custom: 0 | 1;
    quantity: number;
    product: Product | null;
    name?: string | null;
    description?: string | null;
    custom_detail?: {
        id: number;
        name: string;
        description: string;
        service_fee: number;
        materials?: {
            id: number;
            custom_item_detail_id: number;
            material_id: number;
            quantity: number;
            material: Material;
        }[];
    };
}

export interface Province {
    id: number;
    name: string;
}

export interface City {
    id: number;
    name: string;
}

export interface District {
    id: number;
    name: string;
}

export interface Courier {
    code: string;
    name: string;
}

export interface ShippingCost {
    name: string;
    code: string;
    service: string;
    description: string;
    cost: number;
    etd: string;
}

export interface BatchStock extends TimeStamp {
    id: number;
    supplier: string;
    payment_method: 'cash' | 'transfer' | 'qris';
    total_amount: number;
    created_by: number;
    user?: User;
    material_stocks?: MaterialStock[];
}

export interface MaterialStock extends TimeStamp {
    id: number;
    batch_stock_id: number;
    material_id: number;
    is_active: boolean;
    initial_quantity: number;
    remaining_quantity: number;
    price: number;
    subtotal: number;
    expired_date: string | null;
    material?: Material;
    batch_stock?: BatchStock;
}

export interface MaterialStockLog extends TimeStamp {
    id: number;
    material_id: number;
    material_stock_id: number;
    created_by: number;
    quantity: number;
    type: 'in' | 'out';
    notes: string | null;
}

export interface Shipment extends TimeStamp {
    id: number;
    order_id: number;
    tracking_number: string | null;
    courier_name: string;
    courier_code: string;
    courier_service: string;
    etd: string | null;
}
