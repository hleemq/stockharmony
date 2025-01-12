import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StockTable } from "./components/StockTable";
import { useState } from "react";
import { AddStockForm } from "./components/AddStockForm";

export default function StockPage() {
  const [showAddForm, setShowAddForm] = useState(false);

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

      <StockTable />

      <AddStockForm open={showAddForm} onClose={() => setShowAddForm(false)} />
    </div>
  );
}