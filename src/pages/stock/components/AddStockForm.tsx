import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StockItem } from "@/types/stock";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Warehouse {
  id: string;
  name: string;
  location: string;
}

interface AddStockFormProps {
  open: boolean;
  onClose: () => void;
  onAddItem: (item: StockItem) => void;
  warehouses: Warehouse[];
}

export function AddStockForm({ open, onClose, onAddItem, warehouses }: AddStockFormProps) {
  const [formData, setFormData] = useState<StockItem>({
    stockCode: "",
    productName: "",
    boxes: 0,
    unitsPerBox: 0,
    shipmentFees: 0,
    boughtPrice: 0,
    initialPrice: 0,
    sellingPrice: 0,
    location: "",
    stockAvailable: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddItem(formData);
  };

  const handleChange = (field: keyof StockItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Stock Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="stockCode">Stock Code</Label>
              <Input
                id="stockCode"
                value={formData.stockCode}
                onChange={(e) => handleChange("stockCode", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => handleChange("productName", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="boxes">Boxes</Label>
              <Input
                id="boxes"
                type="number"
                value={formData.boxes}
                onChange={(e) => handleChange("boxes", parseInt(e.target.value))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="unitsPerBox">Units Per Box</Label>
              <Input
                id="unitsPerBox"
                type="number"
                value={formData.unitsPerBox}
                onChange={(e) => handleChange("unitsPerBox", parseInt(e.target.value))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="boughtPrice">Bought Price</Label>
              <Input
                id="boughtPrice"
                type="number"
                value={formData.boughtPrice}
                onChange={(e) => handleChange("boughtPrice", parseFloat(e.target.value))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sellingPrice">Selling Price</Label>
              <Input
                id="sellingPrice"
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => handleChange("sellingPrice", parseFloat(e.target.value))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Warehouse</Label>
              <Select 
                value={formData.location} 
                onValueChange={(value) => handleChange("location", value)}
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
            <div className="grid gap-2">
              <Label htmlFor="stockAvailable">Stock Available</Label>
              <Input
                id="stockAvailable"
                type="number"
                value={formData.stockAvailable}
                onChange={(e) => handleChange("stockAvailable", parseInt(e.target.value))}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Item</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}