import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit2, Search, Trash2 } from "lucide-react";
import { StockItem } from "@/types/stock";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StockTableProps {
  items: StockItem[];
  isLoading?: boolean;
  onEdit?: (item: StockItem) => void;
  onDelete?: (item: StockItem) => void;
  warehouses: { id: string; name: string; location: string; }[];
}

export function StockTable({ items, isLoading, onEdit, onDelete, warehouses }: StockTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  useEffect(() => {
    // Subscribe to real-time updates for inventory changes
    const channel = supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'inventory_items' 
        },
        (payload) => {
          console.log('Inventory change received:', payload);
          // Refresh the parent component's data
          if (payload.eventType === 'UPDATE') {
            const updatedItem = payload.new;
            const existingItemIndex = items.findIndex(item => item.id === updatedItem.id);
            if (existingItemIndex !== -1) {
              const updatedItems = [...items];
              updatedItems[existingItemIndex] = {
                ...items[existingItemIndex],
                stockAvailable: updatedItem.total_quantity
              };
              // Update the items through the parent component
              if (onEdit) {
                onEdit(updatedItems[existingItemIndex]);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [items, onEdit]);

  const getStockStatus = (available: number) => {
    if (available <= 0) return "Out of Stock";
    if (available < 10) return "Low Stock";
    return "In Stock";
  };

  const handleDelete = async (item: StockItem) => {
    try {
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

      const { error: analyticsError } = await supabase
        .from('inventory_analytics')
        .delete()
        .eq('item_id', inventoryItem.id);

      if (analyticsError) {
        console.error('Error deleting analytics:', analyticsError);
        toast.error("Failed to delete related analytics");
        return;
      }

      const { error: orderItemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('item_id', inventoryItem.id);

      if (orderItemsError) {
        console.error('Error deleting order items:', orderItemsError);
        toast.error("Failed to delete related orders");
        return;
      }

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
    setEditingItem(item);
  };

  const handleSaveEdit = async (updatedItem: StockItem) => {
    if (onEdit) {
      onEdit(updatedItem);
      setEditingItem(null);
    }
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
                <TableHead>Image</TableHead>
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
                  {[...Array(11)].map((_, cellIndex) => (
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
              <TableHead>Image</TableHead>
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
                <TableCell>
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                      <Image className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </TableCell>
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

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Stock Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSaveEdit(editingItem);
            }} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    value={editingItem.productName}
                    onChange={(e) => setEditingItem({...editingItem, productName: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="boxes">Boxes</Label>
                  <Input
                    id="boxes"
                    type="number"
                    value={editingItem.boxes}
                    onChange={(e) => setEditingItem({...editingItem, boxes: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unitsPerBox">Units Per Box</Label>
                  <Input
                    id="unitsPerBox"
                    type="number"
                    value={editingItem.unitsPerBox}
                    onChange={(e) => setEditingItem({...editingItem, unitsPerBox: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="boughtPrice">Bought Price</Label>
                  <Input
                    id="boughtPrice"
                    type="number"
                    step="0.01"
                    value={editingItem.boughtPrice}
                    onChange={(e) => setEditingItem({...editingItem, boughtPrice: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sellingPrice">Selling Price</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    step="0.01"
                    value={editingItem.sellingPrice}
                    onChange={(e) => setEditingItem({...editingItem, sellingPrice: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Warehouse</Label>
                  <Select 
                    value={editingItem.location} 
                    onValueChange={(value) => setEditingItem({...editingItem, location: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.name}>
                          {warehouse.name} ({warehouse.location})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
