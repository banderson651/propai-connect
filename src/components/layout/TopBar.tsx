
import { Bell, Menu, LogOut, User, ChevronLeft, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate, useLocation } from 'react-router-dom';

interface TopBarProps {
  onMenuClick: () => void;
  pageTitle?: string;
}

export const TopBar = ({
  onMenuClick,
  pageTitle
}: TopBarProps) => {
  const { user, signOut } = useAuth();
  const displayName = user?.email ? user.email.split('@')[0] : 'User';
  const navigate = useNavigate();
  const location = useLocation();
  const canGoBack = location.pathname !== '/' && location.pathname !== '/dashboard';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-4 py-4 shadow-sm sm:px-6 lg:px-10">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden text-muted-foreground hover:text-primary"
        >
          <Menu className="h-5 w-5" />
        </Button>
        {canGoBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="hidden md:flex text-muted-foreground hover:text-primary"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{pageTitle || 'Dashboard'}</h1>
          <p className="text-sm text-muted-foreground">Manage your contacts, properties, and workflows</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Input
          placeholder="Search"
          className="hidden w-48 rounded-lg md:block"
        />
        <Button variant="outline" className="gap-2">
          Customize
        </Button>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Widget
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
          <Bell className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden text-sm font-semibold text-foreground md:inline">{displayName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="focus:bg-secondary">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut} className="focus:bg-secondary">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
