import { Menu } from "lucide-react";
import { Button } from "../ui/button";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b bg-background">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
        <div className="ml-4 flex-1">
          <h1 className="text-lg font-semibold">Inventory Management</h1>
        </div>
      </div>
    </header>
  );
}