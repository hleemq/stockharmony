import { LogOut, Menu } from "lucide-react";
import { Button } from "../ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b bg-background">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
        <div className="ml-4 flex-1">
          <h1 className="text-lg font-semibold">Inventory Management</h1>
        </div>
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="flex items-center gap-2 hover:text-destructive"
        >
          <LogOut className="h-5 w-5" />
          <span className="hidden md:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}