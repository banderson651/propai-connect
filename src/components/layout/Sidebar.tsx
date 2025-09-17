
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
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const Sidebar = ({ open }: SidebarProps) => {
  const { isAdmin, user, signOut } = useAuth();
  const location = useLocation();
  const displayName = user?.email ? user.email.split('@')[0] : 'User';
  
  const menuItems = [
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
  
  const adminItems = [
    { icon: Shield, label: 'Admin Panel', path: '/admin-panel' },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/') return true;
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return location.pathname === path;
  };

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground border-r border-border shadow-md transition-transform duration-300 z-50',
      open ? 'w-64' : 'w-16'
    )}>
      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b border-border">
        <div className="size-8 text-primary">
          <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fill="currentColor" fillRule="evenodd"></path>
          </svg>
        </div>
        {open && (
          <h2 className="text-xl font-bold leading-tight tracking-tight text-foreground">
            PropAI
          </h2>
        )}
      </div>
      
      {/* Navigation */}
      <div className="flex flex-col h-[calc(100vh-160px)] justify-between">
        <nav className="flex flex-col gap-2 p-4 flex-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium leading-normal transition-all duration-200",
                isActive(item.path) 
                  ? "bg-primary text-primary-foreground font-semibold shadow-md" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                !open && "justify-center"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {open && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
          
          {isAdmin && adminItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium leading-normal transition-all duration-200",
                isActive(item.path) 
                  ? "bg-primary text-primary-foreground font-semibold shadow-md" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                !open && "justify-center"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {open && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 rounded-full size-10 flex items-center justify-center border border-primary/60">
            <span className="text-primary font-semibold text-sm">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          {open && (
            <>
              <div className="flex flex-col flex-1">
                <p className="text-sm font-semibold text-foreground">{displayName}</p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                className="ml-auto text-muted-foreground hover:text-primary"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
