
import { Bell, Menu, Search, LogOut, User, ChevronLeft, Filter, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate, useLocation } from 'react-router-dom';

interface TopBarProps {
  onMenuClick: () => void;
  pageTitle?: string;
}

export const TopBar = ({ onMenuClick, pageTitle }: TopBarProps) => {
  const { user, signOut } = useAuth();
  const displayName = user?.email ? user.email.split('@')[0] : 'User';
  const navigate = useNavigate();
  const location = useLocation();
  
  const canGoBack = location.pathname !== '/' && location.pathname !== '/dashboard';

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-gray-200 px-10 py-4 bg-white shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          
          {canGoBack && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{pageTitle || 'Dashboard'}</h1>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Action Buttons */}
        <Button 
          variant="outline" 
          className="flex items-center gap-2 text-primary border-primary hover:bg-primary hover:text-white transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filter</span>
        </Button>
        
        <Button className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary">
                <span className="text-primary font-semibold text-sm">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="font-medium hidden md:inline text-gray-900">{displayName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
