import { useState } from "react";
import { Plus } from "lucide-react";
import OrdersTable from "./components/OrdersTable";
import CreateOrderDialog from "./components/CreateOrderDialog";
import { Button } from "@/components/ui/button";

const OrdersPage = () => {
  const [showCreateOrder, setShowCreateOrder] = useState(false);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Manage your orders here
          </p>
        </div>
        <Button onClick={() => setShowCreateOrder(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </div>
      <OrdersTable />
      <CreateOrderDialog open={showCreateOrder} onClose={() => setShowCreateOrder(false)} />
    </div>
  );
};

export default OrdersPage;