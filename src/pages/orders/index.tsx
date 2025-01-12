import { Plus } from "lucide-react";
import OrdersTable from "./components/OrdersTable";
import { Button } from "@/components/ui/button";

const OrdersPage = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Orders</h1>
          <p className="text-muted-foreground">Manage your orders here</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </div>
      <OrdersTable />
    </div>
  );
};

export default OrdersPage;