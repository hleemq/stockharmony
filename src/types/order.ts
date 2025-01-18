export interface OrderItem {
  id: string;
  order_id: string;
  item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  inventory_items?: {
    name: string;
    sku: string;
  };
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total_amount: number;
  created_at: string;
  updated_at: string;
  pdf_url?: string;
  customers?: {
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  order_items: OrderItem[];
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
}