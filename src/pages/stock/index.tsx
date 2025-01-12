import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StockTable } from "./components/StockTable";
import { useState, useEffect } from "react";
import { AddStockForm } from "./components/AddStockForm";
import { StockItem } from "@/types/stock";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function StockPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [items, setItems] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    fetchStockItems();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Please login to access this page");
      navigate("/login");
      return;
    }
  };

  const fetchStockItems = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          id,
          sku,
          name,
          box_count,
          quantity_per_box,
          price,
          unit_price,
          warehouse_id,
          image_url,
          total_quantity
        `);

      if (error) {
        throw error;
      }

      const stockItems: StockItem[] = data.map(item => ({
        stockCode: item.sku,
        productName: item.name,
        boxes: item.box_count || 0,
        unitsPerBox: item.quantity_per_box,
        shipmentFees: 0, // Add this to the database if needed
        boughtPrice: item.price,
        initialPrice: item.price,
        sellingPrice: item.unit_price || 0,
        location: item.warehouse_id || '',
        imageUrl: item.image_url,
        stockAvailable: item.total_quantity
      }));

      setItems(stockItems);
    } catch (error) {
      console.error('Error fetching stock items:', error);
      toast.error('Failed to load stock items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async (newItem: StockItem) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login to add items");
        return;
      }

      const { data, error } = await supabase
        .from('inventory_items')
        .insert([{
          name: newItem.productName,
          sku: newItem.stockCode,
          box_count: newItem.boxes,
          quantity_per_box: newItem.unitsPerBox,
          price: newItem.boughtPrice,
          unit_price: newItem.sellingPrice,
          warehouse_id: newItem.location,
          image_url: newItem.imageUrl,
          total_quantity: newItem.stockAvailable,
          size: 'default',
          category: 'homme',
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setItems(prevItems => [...prevItems, newItem]);
      toast.success('Stock item added successfully');
    } catch (error) {
      console.error('Error adding stock item:', error);
      toast.error('Failed to add stock item');
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Stock Management</h1>
          <p className="text-muted-foreground">
            Manage your inventory and track stock levels
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2" />
          Add Item
        </Button>
      </div>

      <StockTable items={items} isLoading={isLoading} />

      <AddStockForm 
        open={showAddForm} 
        onClose={() => setShowAddForm(false)} 
        onAddItem={handleAddItem}
      />
    </div>
  );
}