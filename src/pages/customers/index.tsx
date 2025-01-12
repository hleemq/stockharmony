import { Plus } from "lucide-react";
import CustomersTable from "./components/CustomersTable";
import { Button } from "@/components/ui/button";

const CustomersPage = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Customers</h1>
          <p className="text-muted-foreground">Manage your customers here</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>
      <CustomersTable />
    </div>
  );
};

export default CustomersPage;