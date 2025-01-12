import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Trash2 } from "lucide-react";
import { StockItem } from "@/types/stock";

interface OrderSummaryProps {
  products: (StockItem & { orderQuantity: number })[];
  onRemoveProduct: (stockCode: string) => void;
}

export default function OrderSummary({ products, onRemoveProduct }: OrderSummaryProps) {
  const calculateTotal = () => {
    return products.reduce((total, product) => {
      const price = product.sellingPrice * product.orderQuantity;
      const discount = parseFloat(product.discount) || 0;
      return total + (price - (price * discount / 100));
    }, 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Order Summary</h3>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Export Order
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const price = product.sellingPrice * product.orderQuantity;
              const discount = parseFloat(product.discount) || 0;
              const total = price - (price * discount / 100);

              return (
                <TableRow key={product.stockCode}>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell>{product.orderQuantity}</TableCell>
                  <TableCell>${product.sellingPrice}</TableCell>
                  <TableCell>{product.discount}</TableCell>
                  <TableCell>${total.toFixed(2)}</TableCell>
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
              )
            })}
            <TableRow>
              <TableCell colSpan={4} className="text-right font-semibold">
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