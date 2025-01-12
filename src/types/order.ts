export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  orderDate: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  items: OrderItem[];
  totalAmount: number;
}