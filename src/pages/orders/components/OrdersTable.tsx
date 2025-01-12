import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Order } from "@/types/order";

// Temporary mock data - replace with actual data fetching
const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-001",
    customerName: "John Doe",
    orderDate: "2024-03-20",
    status: "pending",
    items: [
      {
        id: "1",
        productName: "Product 1",
        quantity: 2,
        price: 100,
        total: 200,
      },
    ],
    totalAmount: 200,
  },
  // Add more mock orders as needed
];

const OrdersTable = () => {
  const getStatusColor = (status: Order["status"]) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status];
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order Number</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.orderNumber}</TableCell>
              <TableCell>{order.customerName}</TableCell>
              <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdersTable;