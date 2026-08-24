import { Customer } from '@/features/customers/types/customers.types';

export interface OrderItem {
  productId: string;
  productName: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  items: OrderItem[];
  total: number;
  date: string;
  rawDate?: string;
  paymentMethod: 'cod' | 'bank_transfer';
  paymentStatus: 'paid' | 'pending';
  shippingStatus: 'pending' | 'processing' | 'shipping' | 'completed' | 'cancelled';
  notes?: string;
}

// Deprecated empty arrays maintained for backwards compatibility
export const MOCK_CUSTOMERS: Customer[] = [];
export const MOCK_ORDERS: Order[] = [];
