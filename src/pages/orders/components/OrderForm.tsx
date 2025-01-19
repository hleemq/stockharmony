import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Search } from "lucide-react";
import ProductSearchResults from "./ProductSearchResults";
import OrderSummary from "./OrderSummary";
import { StockItem } from "@/types/stock";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Order } from "@/types/order";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const customerFormSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal(""))
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface OrderFormProps {
  initialData?: Order;
  onComplete: () => void;
}

export default function OrderForm({ initialData, onComplete }: OrderFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<(StockItem & { 
    orderQuantity: number;
    applyDiscount: boolean;
    discountPercentage: number;
  })[]>(
    initialData?.order_items?.map(item => ({
      id: item.item_id,
      stockCode: item.inventory_items?.sku || "",
      productName: item.inventory_items?.name || "",
      boxes: 0,
      unitsPerBox: item.inventory_items?.quantity_per_box || 1,
      shipmentFees: 0,
      boughtPrice: 0,
      initialPrice: item.unit_price,
      sellingPrice: item.unit_price,
      price: item.unit_price,
      location: "",
      stockAvailable: 0,
      quantity_per_box: item.inventory_items?.quantity_per_box || 1,
      orderQuantity: item.quantity,
      applyDiscount: false,
      discountPercentage: 0
    })) || []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: initialData?.customers?.name || "",
      email: initialData?.customers?.email || "",
      phone: initialData?.customers?.phone || "",
      address: initialData?.customers?.address || ""
    }
  });

  const handleAddToOrder = (product: StockItem, quantity: number, discountPercentage: number) => {
    setSelectedProducts(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => 
          p.id === product.id 
            ? { ...p, orderQuantity: quantity, discountPercentage, applyDiscount: discountPercentage > 0 }
            : p
        );
      }
      return [...prev, { 
        ...product, 
        orderQuantity: quantity,
        discountPercentage,
        applyDiscount: discountPercentage > 0
      }];
    });
  };

  const handleRemoveFromOrder = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((sum, product) => {
      const price = product.applyDiscount 
        ? product.price * (1 - product.discountPercentage / 100)
        : product.price;
      return sum + (price * product.orderQuantity);
    }, 0);
  };

  const onSubmit = async (data: CustomerFormValues) => {
    if (selectedProducts.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one product to the order",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .upsert({
          id: initialData?.customer_id,
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || null
        })
        .select()
        .single();

      if (customerError) throw customerError;

      const orderNumber = `ORD-${Date.now()}`;
      const orderDate = new Date().toISOString();

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .upsert({
          id: initialData?.id,
          order_number: orderNumber,
          customer_id: customerData.id,
          total_amount: calculateTotal(),
          status: initialData?.status || "pending",
          order_date: orderDate
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = selectedProducts.map(product => ({
        order_id: orderData.id,
        item_id: product.id,
        quantity: product.orderQuantity,
        unit_price: product.applyDiscount 
          ? product.price * (1 - product.discountPercentage / 100)
          : product.price,
        total_price: product.orderQuantity * (
          product.applyDiscount 
            ? product.price * (1 - product.discountPercentage / 100)
            : product.price
        )
      }));

      if (initialData?.id) {
        const { error: deleteError } = await supabase
          .from("order_items")
          .delete()
          .eq("order_id", initialData.id);

        if (deleteError) throw deleteError;
      }

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Success",
        description: initialData ? "Order updated successfully" : "Order created successfully",
      });

      form.reset();
      setSelectedProducts([]);
      onComplete();
    } catch (error) {
      console.error("Error saving order:", error);
      toast({
        title: "Error",
        description: "Failed to save order",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

          <ProductSearchResults
            searchQuery={searchQuery}
            onAddToOrder={handleAddToOrder}
            selectedProducts={selectedProducts}
          />

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
              orderId={initialData?.id}
            />
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : initialData ? "Update Order" : "Create Order"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
