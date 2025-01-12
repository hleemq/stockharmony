import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { StockItem } from "@/types/stock";

interface ProductSearchResultsProps {
  searchQuery: string;
  onAddToOrder: (product: StockItem, quantity: number, applyDiscount: boolean) => void;
  selectedProducts: (StockItem & { orderQuantity: number; applyDiscount: boolean })[];
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
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [applyDiscounts, setApplyDiscounts] = useState<{ [key: string]: boolean }>({});

  const filteredProducts = mockProducts.filter(product =>
    product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.stockCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleQuantityChange = (stockCode: string, value: string) => {
    const quantity = parseInt(value) || 0;
    setQuantities({ ...quantities, [stockCode]: quantity });
  };

  const handleDiscountToggle = (stockCode: string) => {
    setApplyDiscounts(prev => ({
      ...prev,
      [stockCode]: !prev[stockCode]
    }));
  };

  const handleSelect = (product: StockItem) => {
    const quantity = quantities[product.stockCode] || 0;
    if (quantity > 0 && quantity <= product.stockAvailable) {
      onAddToOrder(product, quantity, applyDiscounts[product.stockCode] || false);
      setQuantities({ ...quantities, [product.stockCode]: 0 });
      setApplyDiscounts({ ...applyDiscounts, [product.stockCode]: false });
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>Stock Code</TableHead>
            <TableHead>Available Quantity</TableHead>
            <TableHead>Order Quantity</TableHead>
            <TableHead>Selling Price</TableHead>
            <TableHead>Apply Discount</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.map((product) => (
            <TableRow key={product.stockCode}>
              <TableCell>{product.productName}</TableCell>
              <TableCell>{product.stockCode}</TableCell>
              <TableCell>{product.stockAvailable}</TableCell>
              <TableCell className="w-32">
                <Input
                  type="number"
                  min="1"
                  max={product.stockAvailable}
                  value={quantities[product.stockCode] || ""}
                  onChange={(e) => handleQuantityChange(product.stockCode, e.target.value)}
                  disabled={selectedProducts.some(p => p.stockCode === product.stockCode)}
                />
              </TableCell>
              <TableCell>${product.sellingPrice}</TableCell>
              <TableCell>
                <Toggle
                  pressed={applyDiscounts[product.stockCode]}
                  onPressedChange={() => handleDiscountToggle(product.stockCode)}
                  disabled={selectedProducts.some(p => p.stockCode === product.stockCode)}
                >
                  {product.discount}
                </Toggle>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelect(product)}
                  disabled={
                    selectedProducts.some(p => p.stockCode === product.stockCode) ||
                    !quantities[product.stockCode] ||
                    quantities[product.stockCode] <= 0 ||
                    quantities[product.stockCode] > product.stockAvailable
                  }
                >
                  Select
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}