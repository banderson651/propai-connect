
import { Bell, Menu, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TopBarProps {
  onMenuClick: () => void;
}

export const TopBar = ({ onMenuClick }: TopBarProps) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <Button variant="ghost" size="icon" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="max-w-md w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-10 bg-gray-50 border-0 focus-visible:ring-1"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
        </Button>
        <Button
          variant="ghost"
          className="flex items-center gap-2"
        >
          <div className="h-8 w-8 rounded-full bg-gray-200" />
          <span className="font-medium">John Doe</span>
        </Button>
      </div>
    </header>
  );
};
