import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit2, Search, Trash2 } from "lucide-react";
import { StockItem } from "@/types/stock";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface StockTableProps {
  items: StockItem[];
  isLoading?: boolean;
  onEdit?: (item: StockItem) => void;
  onDelete?: (item: StockItem) => void;
}

export function StockTable({ items, isLoading, onEdit, onDelete }: StockTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const getStockStatus = (available: number) => {
    if (available <= 0) return "Out of Stock";
    if (available < 10) return "Low Stock";
    return "In Stock";
  };

  const handleDelete = async (item: StockItem) => {
    try {
      // First, get the inventory item ID using the SKU
      const { data: inventoryItem, error: fetchError } = await supabase
        .from('inventory_items')
        .select('id')
        .eq('sku', item.stockCode)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching inventory item:', fetchError);
        toast.error("Failed to fetch item details");
        return;
      }

      if (!inventoryItem?.id) {
        toast.error("Item not found");
        return;
      }

      // Delete related analytics records first
      const { error: analyticsError } = await supabase
        .from('inventory_analytics')
        .delete()
        .eq('item_id', inventoryItem.id);

      if (analyticsError) {
        console.error('Error deleting analytics:', analyticsError);
        toast.error("Failed to delete related analytics");
        return;
      }

      // Delete related order items
      const { error: orderItemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('item_id', inventoryItem.id);

      if (orderItemsError) {
        console.error('Error deleting order items:', orderItemsError);
        toast.error("Failed to delete related orders");
        return;
      }

      // Finally delete the inventory item
      const { error: deleteError } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', inventoryItem.id);

      if (deleteError) {
        console.error('Error deleting item:', deleteError);
        toast.error("Failed to delete item: " + deleteError.message);
        return;
      }

      toast.success("Item deleted successfully");
      if (onDelete) onDelete(item);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error("Failed to delete item");
    }
  };

  const handleEdit = (item: StockItem) => {
    if (onEdit) onEdit(item);
  };

  // Filter items based on search query
  const filteredItems = items.filter((item) =>
    item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.stockCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Skeleton className="h-10 w-full md:max-w-sm" />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stock Code</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Boxes</TableHead>
                <TableHead>Units/Box</TableHead>
                <TableHead>Initial Price</TableHead>
                <TableHead>Selling Price</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Stock Status</TableHead>
                <TableHead>Units Left</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  {[...Array(10)].map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          className="pl-10 w-full md:max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stock Code</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Boxes</TableHead>
              <TableHead>Units/Box</TableHead>
              <TableHead>Initial Price</TableHead>
              <TableHead>Selling Price</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Stock Status</TableHead>
              <TableHead>Units Left</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.stockCode}>
                <TableCell className="font-medium">{item.stockCode}</TableCell>
                <TableCell>{item.productName}</TableCell>
                <TableCell>{item.boxes}</TableCell>
                <TableCell>{item.unitsPerBox}</TableCell>
                <TableCell>${item.initialPrice.toFixed(2)}</TableCell>
                <TableCell>${item.sellingPrice.toFixed(2)}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.stockAvailable <= 0 
                      ? 'bg-red-100 text-red-800' 
                      : item.stockAvailable < 10 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                  }`}>
                    {getStockStatus(item.stockAvailable)}
                  </span>
                </TableCell>
                <TableCell>{item.stockAvailable}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(item)}
                      className="h-8 w-8"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item)}
                      className="h-8 w-8 text-red-500 hover:text-red-700"
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
    </div>
  );
}