import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Order } from "@/types/order";
import { useToast } from "@/hooks/use-toast";
import { generateOrderPDF } from "@/utils/pdfGenerator";
import EditOrderDialog from "./EditOrderDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
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
              sku,
              quantity_per_box
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order status updated successfully"
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  const handlePreviewClick = async (order: Order) => {
    try {
      const customerDetails = {
        name: order.customers?.name || '',
        email: order.customers?.email || '',
        phone: order.customers?.phone || '',
        address: order.customers?.address || ''
      };

      const productsWithBoxes = order.order_items?.map(item => ({
        id: item.item_id,
        stockCode: item.inventory_items?.sku || "",
        productName: item.inventory_items?.name || "",
        boxes: Math.floor(item.quantity / (item.inventory_items?.quantity_per_box || 1)),
        unitsPerBox: item.inventory_items?.quantity_per_box || 1,
        shipmentFees: 0,
        boughtPrice: 0,
        initialPrice: item.unit_price,
        sellingPrice: item.unit_price,
        price: item.unit_price,
        location: "",
        stockAvailable: 0,
        quantity_per_box: item.inventory_items?.quantity_per_box || 1,
        orderQuantity: item.quantity,
        units: item.quantity % (item.inventory_items?.quantity_per_box || 1),
        discountPercentage: 0,
        applyDiscount: false
      })) || [];

      const pdfBlob = await generateOrderPDF(customerDetails, productsWithBoxes, order.order_number);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${order.order_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive"
      });
    }
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
              <TableCell>{order.order_number}</TableCell>
              <TableCell>{order.customers?.name}</TableCell>
              <TableCell>{new Date(order.order_date || order.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <Select
                  defaultValue={order.status}
                  onValueChange={(value) => handleStatusChange(order.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>${order.total_amount.toFixed(2)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePreviewClick(order)}
                    title="Preview Order"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowEditDialog(true);
                    }}
                    title="Edit Order"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedOrder && (
        <EditOrderDialog
          open={showEditDialog}
          onClose={() => {
            setShowEditDialog(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
        />
      )}
    </div>
  );
}