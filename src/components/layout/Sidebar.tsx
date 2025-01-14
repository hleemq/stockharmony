import { Home, Package, ShoppingCart, Users, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: Package, label: "Stock", path: "/stock" },
    { icon: ShoppingCart, label: "Orders", path: "/orders" },
    { icon: Users, label: "Customers", path: "/customers" },
  ];

  const sidebarClasses = `fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-200 bg-white p-4 transition-transform duration-300 ease-in-out safe-padding ${
    isOpen || !isMobile ? "translate-x-0" : "-translate-x-full"
  } md:translate-x-0`;

  return (
    <>
      <aside className={sidebarClasses}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Stock Manager</h1>
            {isMobile && (
              <button 
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-gray-100 active:bg-gray-200 md:hidden"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            )}
          </div>
          <nav className="mt-8 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={isMobile ? onClose : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:bg-gray-50 active:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
    </>
  );
};