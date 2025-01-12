import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Trash2 } from "lucide-react";
import { StockItem } from "@/types/stock";
import { generateOrderNumber, generateOrderPDF } from "@/utils/pdfGenerator";

interface OrderSummaryProps {
  products: (StockItem & { orderQuantity: number; applyDiscount: boolean })[];
  onRemoveProduct: (stockCode: string) => void;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
}

export default function OrderSummary({ products, onRemoveProduct, customerDetails }: OrderSummaryProps) {
  const calculateTotal = () => {
    return products.reduce((total, product) => {
      const price = product.sellingPrice * product.orderQuantity;
      const discount = product.applyDiscount ? (parseFloat(product.discount) || 0) : 0;
      return total + (price - (price * discount / 100));
    }, 0);
  };

  const handleExportOrder = () => {
    const orderNumber = generateOrderNumber();
    generateOrderPDF(customerDetails, products, orderNumber);
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
              <TableHead>Price</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Price with Discount</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const basePrice = product.sellingPrice * product.orderQuantity;
              const discount = product.applyDiscount ? (parseFloat(product.discount) || 0) : 0;
              const discountedPrice = basePrice - (basePrice * discount / 100);
              const boxes = Math.floor(product.orderQuantity / product.unitsPerBox);
              const remainingUnits = product.orderQuantity % product.unitsPerBox;

              return (
                <TableRow key={product.stockCode}>
                  <TableCell>{product.stockCode}</TableCell>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell>{boxes}</TableCell>
                  <TableCell>{remainingUnits}</TableCell>
                  <TableCell>${product.sellingPrice}</TableCell>
                  <TableCell>{product.applyDiscount ? product.discount : '-'}</TableCell>
                  <TableCell>${discountedPrice.toFixed(2)}</TableCell>
                  <TableCell>${discountedPrice.toFixed(2)}</TableCell>
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
              <TableCell colSpan={7} className="text-right font-semibold">
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
