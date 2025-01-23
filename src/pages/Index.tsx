import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Package, TrendingUp, DollarSign, LineChart, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChartContainer } from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalStockCost: 0,
    totalStockValue: 0,
    revenue: 0,
    growth: 0,
    revenueData: [] as { date: string; amount: number }[]
  });

  const fetchDashboardData = async () => {
    try {
      // Fetch inventory items for stock values
      const { data: stockData, error: stockError } = await supabase
        .from("inventory_items")
        .select("total_quantity, price");
      
      if (stockError) throw stockError;
      
      const totalStockCost = stockData.reduce((sum, item) => 
        sum + (item.total_quantity * item.price), 0);
      
      const totalStockValue = stockData.reduce((sum, item) => 
        sum + (item.total_quantity * (item.price * 1.3)), 0); // Assuming 30% markup

      // Fetch revenue data for completed orders only
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: revenueData, error: revenueError } = await supabase
        .from("orders")
        .select("total_amount, created_at, status")
        .eq("status", "completed")
        .gte("created_at", thirtyDaysAgo.toISOString());
      
      if (revenueError) throw revenueError;

      const revenue = revenueData.reduce((sum, order) => sum + Number(order.total_amount), 0);

      // Calculate previous month's revenue for growth comparison
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      
      const { data: previousRevenueData } = await supabase
        .from("orders")
        .select("total_amount")
        .eq("status", "completed")
        .gte("created_at", sixtyDaysAgo.toISOString())
        .lt("created_at", thirtyDaysAgo.toISOString());

      const previousRevenue = previousRevenueData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const growth = previousRevenue ? ((revenue - previousRevenue) / previousRevenue * 100) : 0;

      // Prepare chart data for completed orders only
      const revenueByDay = revenueData.reduce((acc: Record<string, number>, order) => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + Number(order.total_amount);
        return acc;
      }, {});

      const chartData = Object.entries(revenueByDay).map(([date, amount]) => ({
        date,
        amount: Number(amount)
      })).sort((a, b) => a.date.localeCompare(b.date));

      setDashboardData({
        totalStockCost,
        totalStockValue,
        revenue,
        growth,
        revenueData: chartData
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

    const ordersChannel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Order change detected:', payload);
          fetchDashboardData();
        }
      )
      .subscribe();

    const inventoryChannel = supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory_items' },
        (payload) => {
          console.log('Inventory change detected:', payload);
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(inventoryChannel);
    };
  }, []);

  const stats = [
    {
      title: "Total Stock Cost",
      value: `$${dashboardData.totalStockCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Package,
      description: "Including purchase price",
      color: "bg-blue-500"
    },
    {
      title: "Total Stock Value",
      value: `$${dashboardData.totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: "Potential revenue at selling price",
      color: "bg-green-500"
    },
    {
      title: "Revenue (30d)",
      value: `$${dashboardData.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      description: "Last 30 days",
      color: "bg-purple-500"
    },
    {
      title: "Growth",
      value: `${dashboardData.growth.toFixed(1)}%`,
      icon: dashboardData.growth >= 0 ? ArrowUpRight : ArrowDownRight,
      description: "Compared to previous month",
      trend: dashboardData.growth >= 0 ? "positive" : "negative",
      color: dashboardData.growth >= 0 ? "bg-emerald-500" : "bg-red-500"
    },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-28 mt-2" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-[400px] w-full" />
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Real-time business overview and analytics</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isTrend = stat.hasOwnProperty('trend');
          
          return (
            <Card key={stat.title} className="p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`rounded-full ${stat.color} bg-opacity-10 p-3`}>
                  <Icon className={`h-6 w-6 ${stat.color} text-opacity-100`} />
                </div>
                {isTrend && (
                  <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${
                    stat.trend === 'positive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {stat.value}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                {!isTrend && <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>}
                <p className="text-sm text-muted-foreground mt-2">{stat.description}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">Revenue Trends</h2>
            <p className="text-sm text-muted-foreground">Daily revenue over the last 30 days</p>
          </div>
          <LineChart className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dashboardData.revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
                stroke="#6b7280"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                stroke="#6b7280"
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-4 border rounded-lg shadow-lg">
                        <p className="text-sm text-gray-600 mb-1">
                          {new Date(label).toLocaleDateString(undefined, { 
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-lg font-semibold">
                          ${payload[0].value.toLocaleString()}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default Index;
