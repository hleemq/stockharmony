import { Menu, Search } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-sm safe-padding">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 active:bg-gray-200 md:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex flex-1 items-center gap-4 md:gap-6">
          <form 
            className="flex-1 md:max-w-md"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className={`relative transition-all duration-300 ${
              isSearchFocused ? "scale-105" : ""
            }`}>
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="search"
                placeholder="Search products, orders..."
                className="h-9 w-full appearance-none rounded-full border border-gray-200 bg-gray-50 pl-8 pr-4 text-sm outline-none transition-colors focus:border-gray-300"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
          </form>
        </div>
      </div>
    </header>
  );
};