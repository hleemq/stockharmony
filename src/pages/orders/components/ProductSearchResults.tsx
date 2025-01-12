import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { StockItem } from "@/types/stock";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface ProductSearchResultsProps {
  searchQuery: string;
  onAddToOrder: (product: StockItem, quantity: number) => void;
  selectedProducts: (StockItem & { orderQuantity: number })[];
}

// Mock data - replace with actual data fetching
const mockProducts: StockItem[] = [
  {
    stockCode: "PRD001",
    productName: "Product 1",
    boxes: 10,
    unitsPerBox: 20,
    shipmentFees: 50,
    boughtPrice: 100,
    initialPrice: 150,
    sellingPrice: 200,
    discount: "10%",
    location: "Warehouse A",
    stockAvailable: 200
  },
  // Add more mock products as needed
];

export default function ProductSearchResults({
  searchQuery,
  onAddToOrder,
  selectedProducts
}: ProductSearchResultsProps) {
  const [selectedProduct, setSelectedProduct] = useState<StockItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showQuantityDialog, setShowQuantityDialog] = useState(false);

  const filteredProducts = mockProducts.filter(product =>
    product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.stockCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (product: StockItem) => {
    setSelectedProduct(product);
    setShowQuantityDialog(true);
  };

  const handleAddToOrder = () => {
    if (selectedProduct && quantity > 0) {
      onAddToOrder(selectedProduct, quantity);
      setShowQuantityDialog(false);
      setSelectedProduct(null);
      setQuantity(1);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Select</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Stock Code</TableHead>
              <TableHead>Available Quantity</TableHead>
              <TableHead>Selling Price</TableHead>
              <TableHead>Discount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.stockCode}>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelect(product)}
                    disabled={selectedProducts.some(p => p.stockCode === product.stockCode)}
                  >
                    Select
                  </Button>
                </TableCell>
                <TableCell>{product.productName}</TableCell>
                <TableCell>{product.stockCode}</TableCell>
                <TableCell>{product.stockAvailable}</TableCell>
                <TableCell>${product.sellingPrice}</TableCell>
                <TableCell>{product.discount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showQuantityDialog} onOpenChange={setShowQuantityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Order Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Quantity</label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min={1}
                max={selectedProduct?.stockAvailable}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuantityDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddToOrder}>Add to Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}