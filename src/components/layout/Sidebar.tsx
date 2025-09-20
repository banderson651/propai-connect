
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Building2,
  Settings,
  Mail,
  Shield,
  Zap,
  CheckSquare,
  Calendar,
  BarChart3,
  LogOut,
  ChevronLeft,
  Menu,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const Sidebar = ({ open, onOpenChange }: SidebarProps) => {
  const { isAdmin, user, signOut } = useAuth();
  const location = useLocation();
  const displayName = user?.email ? user.email.split('@')[0] : 'User';
  
  type NavItem = { icon: LucideIcon; label: string; path: string };

  const menuItems: NavItem[] = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Contacts', path: '/contacts' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: Building2, label: 'Properties', path: '/properties' },
    { icon: Mail, label: 'Email Campaigns', path: '/email/campaigns' },
    { icon: Zap, label: 'Automation', path: '/automation' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];
  
  const adminItems: NavItem[] = [
    { icon: Shield, label: 'Admin Panel', path: '/admin-panel' },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/') return true;
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return location.pathname === path;
  };

  const renderNavLink = (item: NavItem) => {
    const active = isActive(item.path);
    const linkContent = (
      <Link
        key={item.path}
        to={item.path}
        className={cn(
          'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-200',
          open ? 'justify-start' : 'justify-center',
          active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        )}
      >
        <span
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg border transition-colors duration-200',
            active
              ? 'border-transparent bg-primary text-primary-foreground'
              : 'border-transparent bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
          )}
        >
          <item.icon className="h-5 w-5" />
        </span>
        {open && <span className="truncate text-base">{item.label}</span>}
      </Link>
    );

    if (open) {
      return linkContent;
    }

    return (
      <Tooltip key={item.path} delayDuration={100}>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" className="border border-white/60 bg-white/80 text-foreground shadow-lg">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider delayDuration={120}>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
      <div className="flex h-full flex-col px-6 py-8">
        <div className="mb-10 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
              <span>P</span>
            </div>
            {open && (
              <div className="leading-tight">
                <p className="text-base font-semibold text-foreground">PropAI</p>
                <p className="text-xs text-muted-foreground">Connect</p>
              </div>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(!open)}
            className="md:hidden text-muted-foreground hover:text-primary"
          >
            {open ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          {menuItems.map(renderNavLink)}

          {isAdmin && (
            <div className="mt-6 space-y-2">
              {open && <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Admin</p>}
              {adminItems.map(renderNavLink)}
            </div>
          )}
        </nav>

        <div className="mt-10 space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-3 text-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            {open && (
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">{displayName}</span>
                <span className="text-xs text-muted-foreground">{isAdmin ? 'Administrator' : 'Member'}</span>
              </div>
            )}
          </div>
          {open ? (
            <Button variant="outline" className="w-full justify-start gap-2" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          ) : (
            <Button variant="outline" size="icon" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </aside>
    </TooltipProvider>
  );
}
