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
  customerAddress: string;
  customerNote?: string;
  orderDate: string;
  items: OrderItem[];
  shippingFee: number;
  totalAmount: number;
  paymentMethod: 'cod' | 'qr';
  paymentStatus: 'pending' | 'completed' | 'failed';
  shippingStatus: 'pending' | 'processing' | 'shipping' | 'completed' | 'cancelled';
}
