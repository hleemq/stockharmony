import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Trash2 } from "lucide-react";
import { OrderProduct } from "@/types/stock";
import { generateOrderNumber, generateOrderPDF } from "@/utils/pdfGenerator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OrderSummaryProps {
  products: OrderProduct[];
  onRemoveProduct: (stockCode: string) => void;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  orderId?: string;
}

export default function OrderSummary({ products, onRemoveProduct, customerDetails, orderId }: OrderSummaryProps) {
  const { toast } = useToast();

  const calculateTotal = () => {
    return products.reduce((total, product) => {
      const price = (product.price || 0) * product.orderQuantity;
      return total + (price - (product.applyDiscount ? (price * product.discountPercentage / 100) : 0));
    }, 0);
  };

  const calculateBoxes = (quantity: number, unitsPerBox: number) => {
    return Math.floor(quantity / unitsPerBox);
  };

  const calculateRemainingUnits = (quantity: number, unitsPerBox: number) => {
    return quantity % unitsPerBox;
  };

  const handleExportOrder = async () => {
    const orderNumber = generateOrderNumber();
    const productsWithBoxes = products.map(product => ({
      ...product,
      boxes: calculateBoxes(product.orderQuantity, product.quantity_per_box),
      units: calculateRemainingUnits(product.orderQuantity, product.quantity_per_box)
    }));

    try {
      // Generate PDF
      const pdfBlob = await generateOrderPDF(customerDetails, productsWithBoxes, orderNumber);
      
      // Upload to Supabase Storage
      const fileName = `order_${orderNumber}.pdf`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('order_documents')
        .upload(fileName, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('order_documents')
        .getPublicUrl(fileName);

      // Update order with PDF URL if orderId exists
      if (orderId) {
        const { error: updateError } = await supabase
          .from('orders')
          .update({ pdf_url: publicUrl })
          .eq('id', orderId);

        if (updateError) throw updateError;
      }

      // Create download link and trigger download
      const downloadUrl = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast({
        title: "Success",
        description: "Order PDF has been generated and saved",
      });
    } catch (error) {
      console.error('Error exporting order:', error);
      toast({
        title: "Error",
        description: "Failed to export order PDF",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Order Summary</h3>
        <Button onClick={handleExportOrder}>
          <FileText className="mr-2 h-4 w-4" />
          Export Order
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stock Code</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Boxes</TableHead>
              <TableHead>Units</TableHead>
              <TableHead>Total Quantity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Final Price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const boxes = calculateBoxes(product.orderQuantity, product.quantity_per_box);
              const units = calculateRemainingUnits(product.orderQuantity, product.quantity_per_box);
              const basePrice = (product.price || 0) * product.orderQuantity;
              const discountAmount = product.applyDiscount ? (basePrice * product.discountPercentage / 100) : 0;
              const finalPrice = basePrice - discountAmount;

              return (
                <TableRow key={product.stockCode}>
                  <TableCell>{product.stockCode}</TableCell>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell>{boxes}</TableCell>
                  <TableCell>{units}</TableCell>
                  <TableCell>{product.orderQuantity}</TableCell>
                  <TableCell>${(product.price || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    {product.applyDiscount ? `${product.discountPercentage}%` : '-'}
                  </TableCell>
                  <TableCell>
                    ${((product.price || 0) * (1 - (product.applyDiscount ? product.discountPercentage / 100 : 0))).toFixed(2)}
                  </TableCell>
                  <TableCell>${finalPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveProduct(product.stockCode)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow>
              <TableCell colSpan={8} className="text-right font-semibold">
                Total Amount:
              </TableCell>
              <TableCell colSpan={2} className="font-semibold">
                ${calculateTotal().toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}