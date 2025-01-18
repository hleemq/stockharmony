import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Order } from "@/types/order";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const OrdersTable = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        customers (
          name,
          email,
          phone,
          address
        ),
        order_items (
          *,
          inventory_items (
            name,
            sku
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive"
      });
      return;
    }

    setOrders(data || []);
  };

  const handleViewOrder = async (orderNumber: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('order_documents')
        .download(`${orderNumber}.pdf`);

      if (error) throw error;

      // Create a URL for the downloaded file and open it
      const url = URL.createObjectURL(data);
      window.open(url, '_blank');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download order PDF",
        variant: "destructive"
      });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order deleted successfully"
      });

      fetchOrders();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete order",
        variant: "destructive"
      });
    }
  };

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
          {orders.map((order) => (
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
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleViewOrder(order.orderNumber)}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="text-red-500"
                    onClick={() => handleDeleteOrder(order.id)}
                  >
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