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
import { generateOrderNumber, generateOrderPDF } from "@/utils/pdfGenerator";
import { OrderProduct } from "@/types/stock";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [selectedProducts, setSelectedProducts] = useState<OrderProduct[]>([]);
  const { toast } = useToast();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: ""
    }
  });

  const handleAddToOrder = (product: StockItem, quantity: number, discountPercentage: number) => {
    setSelectedProducts([...selectedProducts, { 
      ...product, 
      orderQuantity: quantity,
      discountPercentage,
      applyDiscount: discountPercentage > 0
    }]);
  };

  const handleRemoveFromOrder = (stockCode: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.stockCode !== stockCode));
  };

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      // First, create or update customer
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .upsert(
          {
            name: data.name,
            email: data.email || null,
            phone: data.phone || null,
            address: data.address || null
          },
          { onConflict: "email" }
        )
        .select()
        .single();

      if (customerError) throw customerError;

      const orderNumber = generateOrderNumber();
      const totalAmount = selectedProducts.reduce((sum, product) => {
        const price = product.applyDiscount 
          ? product.sellingPrice * (1 - product.discountPercentage / 100)
          : product.sellingPrice;
        return sum + (price * product.orderQuantity);
      }, 0);

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: customerData.id,
          total_amount: totalAmount,
          status: "pending"
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = selectedProducts.map(product => ({
        order_id: orderData.id,
        item_id: product.id,
        quantity: product.orderQuantity,
        unit_price: product.applyDiscount 
          ? product.sellingPrice * (1 - product.discountPercentage / 100)
          : product.sellingPrice,
        total_price: product.orderQuantity * (
          product.applyDiscount 
            ? product.sellingPrice * (1 - product.discountPercentage / 100)
            : product.sellingPrice
        )
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Generate PDF
      const order = generateOrderPDF({
        name: data.name,
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || ""
      }, selectedProducts, orderNumber);
      
      if (typeof window !== 'undefined' && (window as any).addOrderToTable) {
        (window as any).addOrderToTable(order);
      }
      
      toast({
        title: "Success",
        description: "Order created successfully",
      });

      onClose();
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive"
      });
    }
  };

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
                  customerDetails={{
                    name: form.getValues().name,
                    email: form.getValues().email || "",
                    phone: form.getValues().phone || "",
                    address: form.getValues().address || ""
                  }}
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