import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import ProductSearchResults from "./ProductSearchResults";
import OrderSummary from "./OrderSummary";
import { StockItem } from "@/types/stock";

interface CreateOrderDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateOrderDialog({ open, onClose }: CreateOrderDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<(StockItem & { orderQuantity: number })[]>([]);

  const handleAddToOrder = (product: StockItem, quantity: number) => {
    setSelectedProducts([...selectedProducts, { ...product, orderQuantity: quantity }]);
  };

  const handleRemoveFromOrder = (stockCode: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.stockCode !== stockCode));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Search Section */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Search Results */}
          <ProductSearchResults
            searchQuery={searchQuery}
            onAddToOrder={handleAddToOrder}
            selectedProducts={selectedProducts}
          />

          {/* Order Summary */}
          {selectedProducts.length > 0 && (
            <OrderSummary
              products={selectedProducts}
              onRemoveProduct={handleRemoveFromOrder}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}