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
    <header className="h-16 bg-white/80 dark:bg-minimal-grey-900/80 border-b border-minimal-grey-200 dark:border-minimal-grey-800 px-4 md:px-6 flex items-center justify-between shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
            <Menu className="h-5 w-5 text-minimal-grey-600 dark:text-minimal-grey-200" />
          </Button>
          {canGoBack && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ChevronLeft className="h-5 w-5 text-minimal-grey-600 dark:text-minimal-grey-200" />
            </Button>
          )}
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-minimal-blue-700 dark:text-minimal-blue-200">{pageTitle || 'Dashboard'}</h1>
            <p className="text-sm text-minimal-grey-600 dark:text-minimal-grey-400">{formatDate(today)}</p>
          </div>
        </div>
      </div>
      <div className="hidden md:flex items-center max-w-md flex-1">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-minimal-grey-500 dark:text-minimal-grey-400" />
          <Input
            placeholder="Search..."
            className="pl-10 bg-white/70 dark:bg-minimal-grey-900/70 border border-minimal-grey-200 dark:border-minimal-grey-700 w-full rounded-lg focus:ring-2 focus:ring-minimal-blue-400 dark:focus:ring-minimal-blue-600 transition"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-minimal-grey-600 dark:text-minimal-grey-200" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-error rounded-full" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2"
            >
              <div className="h-8 w-8 rounded-full bg-minimal-blue-100 dark:bg-minimal-blue-800 flex items-center justify-center">
                <User className="h-4 w-4 text-minimal-blue-600 dark:text-minimal-blue-200" />
              </div>
              <span className="hidden md:inline text-minimal-grey-700 dark:text-minimal-grey-200 font-medium">{displayName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-minimal-grey-900 border border-minimal-grey-200 dark:border-minimal-grey-800 rounded-lg shadow-md">
            <DropdownMenuLabel className="font-semibold text-minimal-blue-600 dark:text-minimal-blue-200">{displayName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')} className="hover:bg-minimal-blue-100 dark:hover:bg-minimal-blue-800">Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={signOut} className="hover:bg-error/10 text-error">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
