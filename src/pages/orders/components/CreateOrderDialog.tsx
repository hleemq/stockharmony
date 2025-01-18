import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      // First, create the customer
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .insert({
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || null
        })
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

      const customerDetails = {
        name: data.name,
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || ''
      };

      const productsWithBoxes = selectedProducts.map(product => ({
        ...product,
        boxes: Math.floor(product.orderQuantity / product.unitsPerBox),
        units: product.orderQuantity % product.unitsPerBox
      }));

      console.log('Generating PDF...');
      try {
        // Generate the PDF
        const pdfBlob = await generateOrderPDF(customerDetails, productsWithBoxes, orderNumber);
        console.log('PDF generated successfully');

        // First check if the file already exists and delete it if it does
        const { data: existingFile, error: checkError } = await supabase.storage
          .from('order_documents')
          .list('', {
            search: orderNumber + '.pdf'
          });

        if (checkError) {
          console.error('Error checking existing file:', checkError);
          throw checkError;
        }

        if (existingFile && existingFile.length > 0) {
          const { error: deleteError } = await supabase.storage
            .from('order_documents')
            .remove([`${orderNumber}.pdf`]);

          if (deleteError) {
            console.error('Error deleting existing file:', deleteError);
            throw deleteError;
          }
        }

        // Create a File object from the Blob with proper MIME type
        const pdfFile = new File([pdfBlob], `${orderNumber}.pdf`, { 
          type: 'application/pdf'
        });

        console.log('Uploading PDF to Supabase storage...');
        // Upload PDF to storage with explicit content type
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('order_documents')
          .upload(`${orderNumber}.pdf`, pdfFile, {
            contentType: 'application/pdf',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }
        console.log('PDF uploaded successfully');

        // Get the public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('order_documents')
          .getPublicUrl(`${orderNumber}.pdf`);

        console.log('Creating order in database...');
        // Create order with PDF URL
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .insert({
            order_number: orderNumber,
            customer_id: customerData.id,
            total_amount: totalAmount,
            status: "pending",
            pdf_url: publicUrl
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

        toast({
          title: "Success",
          description: "Order created successfully",
        });

        // Reset form and close dialog
        form.reset();
        setSelectedProducts([]);
        onClose();
      } catch (error) {
        console.error('PDF generation or upload error:', error);
        throw error;
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>Fill in the customer details and add products to create a new order.</DialogDescription>
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
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Creating Order..." : "Create Order"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}