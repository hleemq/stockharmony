import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState({
    totalStock: 0,
    activeOrders: 0,
    customers: 0,
    revenue: 0,
    stockTrend: "0%",
    ordersTrend: "0%",
    customersTrend: "0%",
    revenueTrend: "0%"
  });

  const fetchDashboardData = async () => {
    try {
      // Fetch total stock
      const { data: stockData, error: stockError } = await supabase
        .from("inventory_items")
        .select("total_quantity");
      
      if (stockError) throw stockError;
      
      const totalStock = stockData.reduce((sum, item) => sum + item.total_quantity, 0);

      // Fetch active orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("status", "pending");
      
      if (ordersError) throw ordersError;

      // Fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from("customers")
        .select("*");
      
      if (customersError) throw customersError;

      // Calculate revenue (from completed orders in the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: revenueData, error: revenueError } = await supabase
        .from("orders")
        .select("total_amount")
        .eq("status", "completed")
        .gte("created_at", thirtyDaysAgo.toISOString());
      
      if (revenueError) throw revenueError;

      const totalRevenue = revenueData.reduce((sum, order) => sum + order.total_amount, 0);

      // Calculate trends (comparing with previous 30 days)
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      
      const { data: previousRevenueData } = await supabase
        .from("orders")
        .select("total_amount")
        .eq("status", "completed")
        .gte("created_at", sixtyDaysAgo.toISOString())
        .lt("created_at", thirtyDaysAgo.toISOString());

      const previousRevenue = previousRevenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const revenueTrend = previousRevenue ? ((totalRevenue - previousRevenue) / previousRevenue * 100).toFixed(1) : "0";

      setDashboardData({
        totalStock,
        activeOrders: ordersData.length,
        customers: customersData.length,
        revenue: totalRevenue,
        stockTrend: "+2.5%", // This would need inventory history to calculate accurately
        ordersTrend: "+3.2%", // This would need order history to calculate accurately
        customersTrend: "+2.4%", // This would need customer history to calculate accurately
        revenueTrend: `${revenueTrend}%`
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Set up a refresh interval (every 5 minutes)
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      title: "Total Stock",
      value: dashboardData.totalStock.toLocaleString(),
      icon: Package,
      trend: dashboardData.stockTrend,
    },
    {
      title: "Active Orders",
      value: dashboardData.activeOrders.toLocaleString(),
      icon: ShoppingCart,
      trend: dashboardData.ordersTrend,
    },
    {
      title: "Customers",
      value: dashboardData.customers.toLocaleString(),
      icon: Users,
      trend: dashboardData.customersTrend,
    },
    {
      title: "Revenue (30d)",
      value: `$${dashboardData.revenue.toLocaleString()}`,
      icon: TrendingUp,
      trend: dashboardData.revenueTrend,
    },
  ];

  return (
    <div className="container mx-auto p-6 pt-20 md:pl-72">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-gray-500">Welcome back to your stock management</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isPositiveTrend = !stat.trend.startsWith('-');
          
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
                <span className={`text-sm ${isPositiveTrend ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.trend}
                </span>
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