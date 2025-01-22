import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StockItem } from "@/types/stock";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Image } from "lucide-react";

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
    id: '',
    stockCode: "",
    productName: "",
    boxes: 0,
    unitsPerBox: 0,
    shipmentFees: 0,
    boughtPrice: 0,
    initialPrice: 0,
    sellingPrice: 0,
    price: 0,
    location: "",
    stockAvailable: 0,
    quantity_per_box: 1
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('inventory_images')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('inventory_images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
        if (!imageUrl) {
          toast.error('Failed to upload image');
          setIsSubmitting(false);
          return;
        }
      }

      const updatedFormData = {
        ...formData,
        initialPrice: formData.boughtPrice + formData.shipmentFees,
        stockAvailable: formData.boxes * formData.unitsPerBox,
        imageUrl
      };

      await onAddItem(updatedFormData);
      
      // Clean up the preview URL
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setSelectedImage(null);
      setImagePreview(null);
      setFormData({
        id: '',
        stockCode: "",
        productName: "",
        boxes: 0,
        unitsPerBox: 0,
        shipmentFees: 0,
        boughtPrice: 0,
        initialPrice: 0,
        sellingPrice: 0,
        price: 0,
        location: "",
        stockAvailable: 0,
        quantity_per_box: 1
      });
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to add item');
    } finally {
      setIsSubmitting(false);
    }
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
              <Label htmlFor="image">Product Image</Label>
              <div className="flex flex-col items-center gap-4">
                {imagePreview ? (
                  <div className="relative w-32 h-32">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-0 right-0 -mt-2 -mr-2"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed rounded-md flex items-center justify-center">
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Image className="w-8 h-8 text-gray-400" />
                    </label>
                  </div>
                )}
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  {imagePreview ? 'Change Image' : 'Upload Image'}
                </Button>
              </div>
            </div>
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
              <Label htmlFor="shipmentFees">Shipment Fees</Label>
              <Input
                id="shipmentFees"
                type="number"
                value={formData.shipmentFees}
                onChange={(e) => handleChange("shipmentFees", parseFloat(e.target.value))}
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
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding Item...' : 'Add Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}