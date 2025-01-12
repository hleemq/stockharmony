import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import { StockItem } from "@/types/stock";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Warehouse {
  id: string;
  name: string;
  location: string;
}

const formSchema = z.object({
  stockCode: z.string().min(1, "Stock code is required"),
  productName: z.string().min(1, "Product name is required"),
  boxes: z.string().min(1, "Number of boxes is required"),
  unitsPerBox: z.string().min(1, "Units per box is required"),
  shipmentFees: z.string().min(1, "Shipment fees are required"),
  boughtPrice: z.string().min(1, "Bought price is required"),
  sellingPrice: z.string().min(1, "Selling price is required"),
  location: z.string().min(1, "Location is required"),
});

interface AddStockFormProps {
  open: boolean;
  onClose: () => void;
  onAddItem: (item: StockItem) => void;
}

export function AddStockForm({ open, onClose, onAddItem }: AddStockFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(true);
  
  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      setIsLoadingWarehouses(true);
      const { data, error } = await supabase
        .from('warehouses')
        .select('id, name, location');
      
      if (error) {
        toast.error('Failed to load warehouses');
        throw error;
      }

      setWarehouses(data || []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    } finally {
      setIsLoadingWarehouses(false);
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stockCode: "",
      productName: "",
      boxes: "",
      unitsPerBox: "",
      shipmentFees: "",
      boughtPrice: "",
      sellingPrice: "",
      location: "",
    },
  });

  const calculateInitialPrice = (shipmentFees: string, boughtPrice: string) => {
    const fees = parseFloat(shipmentFees) || 0;
    const price = parseFloat(boughtPrice) || 0;
    return fees + price;
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    const initialPrice = calculateInitialPrice(values.shipmentFees, values.boughtPrice);
    const boxes = parseInt(values.boxes) || 0;
    const unitsPerBox = parseInt(values.unitsPerBox) || 0;
    
    const newItem: StockItem = {
      stockCode: values.stockCode,
      productName: values.productName,
      boxes: boxes,
      unitsPerBox: unitsPerBox,
      shipmentFees: parseFloat(values.shipmentFees),
      boughtPrice: parseFloat(values.boughtPrice),
      initialPrice,
      sellingPrice: parseFloat(values.sellingPrice),
      location: values.location,
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : undefined,
      stockAvailable: boxes * unitsPerBox,
    };
    
    onAddItem(newItem);
    onClose();
    form.reset();
    setImageFile(null);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Stock Item</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new item to your inventory
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stockCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter stock code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="boxes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Boxes</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter number of boxes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unitsPerBox"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Units per Box</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter units per box" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shipmentFees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shipment Fees</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter shipment fees"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="boughtPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bought Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter bought price"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sellingPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter selling price"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select warehouse" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingWarehouses ? (
                          <SelectItem value="loading" disabled>Loading warehouses...</SelectItem>
                        ) : warehouses.length === 0 ? (
                          <SelectItem value="none" disabled>No warehouses available</SelectItem>
                        ) : (
                          warehouses.map((warehouse) => (
                            <SelectItem key={warehouse.id} value={warehouse.id}>
                              {warehouse.name} - {warehouse.location}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-center">
              <Button type="button" variant="outline" className="w-full max-w-md" onClick={() => document.getElementById('image-upload')?.click()}>
                <Upload className="mr-2" />
                Upload Image
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </Button>
            </div>

            {imageFile && (
              <p className="text-sm text-muted-foreground text-center">
                Selected file: {imageFile.name}
              </p>
            )}

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Add Item</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}