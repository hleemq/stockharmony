import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StockItem } from "@/types/stock";

interface EditStockDialogProps {
  item: StockItem | null;
  warehouses: { id: string; name: string; location: string; }[];
  onClose: () => void;
  onSave: (item: StockItem) => void;
}

export function EditStockDialog({ item, warehouses, onClose, onSave }: EditStockDialogProps) {
  if (!item) return null;

  return (
    <Dialog open={!!item} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Stock Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSave(item);
        }} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                value={item.productName}
                onChange={(e) => item.productName = e.target.value}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="boxes">Boxes</Label>
              <Input
                id="boxes"
                type="number"
                value={item.boxes}
                onChange={(e) => item.boxes = parseInt(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="unitsPerBox">Units Per Box</Label>
              <Input
                id="unitsPerBox"
                type="number"
                value={item.unitsPerBox}
                onChange={(e) => item.unitsPerBox = parseInt(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="boughtPrice">Bought Price</Label>
              <Input
                id="boughtPrice"
                type="number"
                step="0.01"
                value={item.boughtPrice}
                onChange={(e) => item.boughtPrice = parseFloat(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sellingPrice">Selling Price</Label>
              <Input
                id="sellingPrice"
                type="number"
                step="0.01"
                value={item.sellingPrice}
                onChange={(e) => item.sellingPrice = parseFloat(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Warehouse</Label>
              <Select 
                value={item.location} 
                onValueChange={(value) => item.location = value}
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}