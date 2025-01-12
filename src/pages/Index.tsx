import { Card } from "@/components/ui/card";
import { Package, ShoppingCart, TrendingUp, Users } from "lucide-react";

const stats = [
  {
    title: "Total Stock",
    value: "2,345",
    icon: Package,
    trend: "+12.5%",
  },
  {
    title: "Active Orders",
    value: "45",
    icon: ShoppingCart,
    trend: "+3.2%",
  },
  {
    title: "Customers",
    value: "1,234",
    icon: Users,
    trend: "+2.4%",
  },
  {
    title: "Revenue",
    value: "$12,345",
    icon: TrendingUp,
    trend: "+15.3%",
  },
];

const Index = () => {
  return (
    <div className="container mx-auto p-6 pt-20 md:pl-72">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-gray-500">Welcome back to your stock management</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-6 glass-card animate-enter">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <h3 className="text-2xl font-semibold">{stat.value}</h3>
                </div>
                <div className="rounded-full bg-gray-100 p-3">
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-green-500">{stat.trend}</span>
                <span className="text-sm text-gray-500"> vs last month</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Index;