import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StockTable } from "./components/StockTable";
import { useState } from "react";
import { AddStockForm } from "./components/AddStockForm";
import { StockItem } from "@/types/stock";

export default function StockPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [items, setItems] = useState<StockItem[]>([]);

  const handleAddItem = (newItem: StockItem) => {
    setItems([...items, newItem]);
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

      <StockTable items={items} />

      <AddStockForm 
        open={showAddForm} 
        onClose={() => setShowAddForm(false)} 
        onAddItem={handleAddItem}
      />
    </div>
  );
}