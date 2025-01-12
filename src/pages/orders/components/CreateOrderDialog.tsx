import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import ProductSearchResults from "./ProductSearchResults";
import OrderSummary from "./OrderSummary";
import { StockItem } from "@/types/stock";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const customerFormSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal(""))
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface CreateOrderDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateOrderDialog({ open, onClose }: CreateOrderDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<(StockItem & { 
    orderQuantity: number;
    applyDiscount: boolean;
  })[]>([]);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: ""
    }
  });

  const handleAddToOrder = (product: StockItem, quantity: number, applyDiscount: boolean) => {
    setSelectedProducts([...selectedProducts, { 
      ...product, 
      orderQuantity: quantity,
      applyDiscount 
    }]);
  };

  const handleRemoveFromOrder = (stockCode: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.stockCode !== stockCode));
  };

  const onSubmit = (data: CustomerFormValues) => {
    console.log("Customer Data:", data);
    console.log("Order Products:", selectedProducts);
    onClose();
  };

  // This ensures the dialog stays open and only closes when explicitly requested
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Customer Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Product Search Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Products</h3>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Search Results */}
              <ProductSearchResults
                searchQuery={searchQuery}
                onAddToOrder={handleAddToOrder}
                selectedProducts={selectedProducts}
              />

              {/* Order Summary */}
              {selectedProducts.length > 0 && (
                <OrderSummary
                  products={selectedProducts}
                  onRemoveProduct={handleRemoveFromOrder}
                  customerDetails={form.getValues()}
                />
              )}

              {/* Submit Button */}
              {selectedProducts.length > 0 && (
                <Button type="submit" className="w-full">
                  Create Order
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}