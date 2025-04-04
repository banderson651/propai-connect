
import { Bell, Menu, Search, LogOut, User, ChevronLeft } from 'lucide-react';
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
  const today = new Date();
  
  const canGoBack = location.pathname !== '/' && location.pathname !== '/dashboard';

  return (
    <header className="h-16 bg-background border-b border-border px-4 md:px-6 flex items-center justify-between">
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
            <h1 className="text-xl font-medium">{pageTitle || 'Dashboard'}</h1>
            <p className="text-sm text-muted-foreground">{formatDate(today)}</p>
          </div>
        </div>
      </div>
      
      <div className="hidden md:flex items-center max-w-md flex-1">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-10 bg-background border w-full"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
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
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium hidden md:inline">{displayName}</span>
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
