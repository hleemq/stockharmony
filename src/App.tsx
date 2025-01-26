import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import StockPage from "./pages/stock";
import OrdersPage from "./pages/orders";
import CustomersPage from "./pages/customers";
import LoginPage from "./pages/login";
import DashboardPage from "./pages/Index";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useIsMobile } from "./hooks/use-mobile";
import { toast } from "sonner";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Enable real-time subscriptions
    supabase.realtime.setAuth(session?.access_token || null);

    // Check active session and enable session persistence
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Listen for auth changes with enhanced error handling
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.expires_at) {
        // Calculate time until token expires (in seconds)
        const expiresIn = session.expires_at - Math.floor(Date.now() / 1000);
        
        // If token expires in less than 1 hour, refresh it
        if (expiresIn < 3600) {
          const { data, error } = await supabase.auth.refreshSession();
          if (error) {
            console.error('Error refreshing session:', error);
            toast.error("Session refresh failed. Please log in again.");
          } else if (data.session) {
            setSession(data.session);
          }
        } else {
          setSession(session);
        }
      } else {
        setSession(session);
      }
    });

    // Handle device orientation changes
    const handleOrientationChange = () => {
      window.dispatchEvent(new Event('resize'));
    };

    window.addEventListener('orientationchange', handleOrientationChange);

    // Set up periodic session refresh (every 30 minutes)
    const refreshInterval = setInterval(async () => {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Error in periodic session refresh:', error);
      } else if (data.session) {
        setSession(data.session);
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('orientationchange', handleOrientationChange);
      clearInterval(refreshInterval);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <Router>
        <div className="min-h-[100dvh] bg-background safe-padding">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex min-h-[100dvh] flex-col bg-background safe-padding overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex flex-1 relative">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          <main className="flex-1 content-padding pt-20 md:ml-64 overflow-auto h-[calc(100vh-5rem)]">
            <div className="table-container">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/stock" element={<StockPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;