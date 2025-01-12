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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { StockItem } from "@/types/stock";

const formSchema = z.object({
  stockCode: z.string().min(1, "Stock code is required"),
  productName: z.string().min(1, "Product name is required"),
  boxDetails: z.string().min(1, "Box details are required"),
  unit: z.string().min(1, "Unit is required"),
  shipmentFees: z.string().min(1, "Shipment fees are required"),
  boughtPrice: z.string().min(1, "Bought price is required"),
  sellingPrice: z.string().min(1, "Selling price is required"),
  discount: z.string(),
  location: z.string().min(1, "Location is required"),
});

interface AddStockFormProps {
  open: boolean;
  onClose: () => void;
  onAddItem: (item: StockItem) => void;
}

export function AddStockForm({ open, onClose, onAddItem }: AddStockFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stockCode: "",
      productName: "",
      boxDetails: "",
      unit: "",
      shipmentFees: "",
      boughtPrice: "",
      sellingPrice: "",
      discount: "",
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
    
    const newItem: StockItem = {
      stockCode: values.stockCode,
      productName: values.productName,
      boxDetails: values.boxDetails,
      unit: values.unit,
      shipmentFees: parseFloat(values.shipmentFees),
      boughtPrice: parseFloat(values.boughtPrice),
      initialPrice,
      sellingPrice: parseFloat(values.sellingPrice),
      discount: values.discount || "0",
      location: values.location,
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : undefined,
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
                name="boxDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Box Details</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Box of 13 pieces" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pcs">Pieces</SelectItem>
                        <SelectItem value="box">Box</SelectItem>
                        <SelectItem value="kg">Kilogram</SelectItem>
                      </SelectContent>
                    </Select>
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
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter discount amount"
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
                        <SelectItem value="warehouse-a">Warehouse A</SelectItem>
                        <SelectItem value="warehouse-b">Warehouse B</SelectItem>
                        <SelectItem value="warehouse-c">Warehouse C</SelectItem>
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