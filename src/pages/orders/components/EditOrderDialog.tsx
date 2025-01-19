import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Order } from "@/types/order";
import OrderForm from "./OrderForm";

interface EditOrderDialogProps {
  open: boolean;
  onClose: () => void;
  order: Order;
}

export default function EditOrderDialog({ open, onClose, order }: EditOrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Order - {order.order_number}</DialogTitle>
        </DialogHeader>
        <OrderForm initialData={order} onComplete={onClose} />
      </DialogContent>
    </Dialog>
  );
}