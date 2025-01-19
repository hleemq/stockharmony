export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  totalOrders: number;
  lastOrderDate: string | null;
  status: 'active' | 'inactive';
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  orders?: {
    id: string;
    order_number: string;
    created_at: string;
    total_amount: number;
  }[];
}