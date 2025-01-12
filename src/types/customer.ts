export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  lastOrderDate: string;
  status: 'active' | 'inactive';
}