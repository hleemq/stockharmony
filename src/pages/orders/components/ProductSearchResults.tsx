import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StockItem } from "@/types/stock";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProductSearchResultsProps {
  searchQuery: string;
  onAddToOrder: (product: StockItem, quantity: number, discountPercentage: number) => void;
  selectedProducts: (StockItem & { orderQuantity: number; discountPercentage: number })[];
}

const discountOptions = [
  { value: "0", label: "No Discount" },
  { value: "5", label: "5%" },
  { value: "10", label: "10%" },
  { value: "15", label: "15%" },
  { value: "20", label: "20%" },
];

export default function ProductSearchResults({
  searchQuery,
  onAddToOrder,
  selectedProducts
}: ProductSearchResultsProps) {
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [discounts, setDiscounts] = useState<{ [key: string]: number }>({});
  const [products, setProducts] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      fetchProducts();
    }
  }, [searchQuery]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('inventory_items')
        .select(`
          id,
          name,
          sku,
          total_quantity,
          unit_price,
          price,
          quantity_per_box,
          status
        `);

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,sku.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const stockItems: StockItem[] = data.map(item => ({
        id: item.id,
        stockCode: item.sku,
        productName: item.name,
        boxes: 0,
        unitsPerBox: 1,
        shipmentFees: 0,
        boughtPrice: 0,
        initialPrice: item.unit_price,
        sellingPrice: item.unit_price,
        price: item.price,
        location: '',
        stockAvailable: item.total_quantity,
        quantity_per_box: item.quantity_per_box
      }));

      setProducts(stockItems);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (stockCode: string, value: string) => {
    const quantity = parseInt(value) || 0;
    setQuantities({ ...quantities, [stockCode]: quantity });
  };

  const handleDiscountChange = (stockCode: string, value: string) => {
    setDiscounts({ ...discounts, [stockCode]: parseInt(value) });
  };

  const handleSelect = (product: StockItem) => {
    const quantity = quantities[product.stockCode] || 0;
    if (quantity > 0 && quantity <= product.stockAvailable) {
      onAddToOrder(product, quantity, discounts[product.stockCode] || 0);
      setQuantities({ ...quantities, [product.stockCode]: 0 });
      setDiscounts({ ...discounts, [product.stockCode]: 0 });
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading products...</div>;
  }

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
            <TableHead>Discount</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                No products found
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
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
                  <Select
                    value={String(discounts[product.stockCode] || "0")}
                    onValueChange={(value) => handleDiscountChange(product.stockCode, value)}
                    disabled={selectedProducts.some(p => p.stockCode === product.stockCode)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Discount" />
                    </SelectTrigger>
                    <SelectContent>
                      {discountOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}