import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Building2, 
  PieChart, 
  Settings, 
  Menu, 
  Mail, 
  Shield, 
  MessageSquare, 
  Zap, 
  CheckSquare, 
  Calendar, 
  BarChart3 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useWhatsApp } from '@/contexts/WhatsAppContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const Sidebar = ({ open, onOpenChange }: SidebarProps) => {
  const { isAdmin } = useAuth();
  const { isConnected } = useWhatsApp();
  const location = useLocation();
  
  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Contacts', path: '/contacts' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: Building2, label: 'Properties', path: '/properties' },
    { icon: Mail, label: 'Email Accounts', path: '/email/accounts' },
    { icon: Mail, label: 'Email Templates', path: '/email/templates' },
    { icon: Mail, label: 'Email Campaigns', path: '/email/campaigns' },
    { icon: Zap, label: 'Automation', path: '/automation' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { 
      icon: MessageSquare, 
      label: 'WhatsApp', 
      path: '/settings/whatsapp', 
      badge: isConnected ? 'Connected' : undefined,
      badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];
  
  // Only show admin options to admin users
  const adminItems = [
    { icon: Shield, label: 'Admin', path: '/admin' },
  ];

  const isActive = (path: string) => {
    // Handle root path explicitly if needed, though dashboard is usually the landing for auth
    if (path === '/dashboard' && location.pathname === '/') return true; // Assuming root is dashboard for logged-in users
    // Handle nested routes like /email/* or /contacts/*
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    // Fallback for exact path match
    return location.pathname === path;
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground transition-transform duration-300 z-50',
        open ? 'w-64' : 'w-16',
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-foreground/10">
        <h1 className={cn(
          "font-semibold transition-opacity",
          open ? "opacity-100" : "opacity-0"
        )}>
          PropAI
        </h1>
        <button 
          onClick={() => onOpenChange(!open)} 
          className="p-2 hover:bg-sidebar-foreground/10 rounded-md"
        >
          <Menu className="h-5 w-5 text-sidebar-foreground" />
        </button>
      </div>
      
      <div className="flex flex-col h-[calc(100vh-64px)] justify-between pb-4">
        <nav className="p-2 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors",
                    isActive(item.path) 
                      ? "bg-primary/20 text-primary-foreground font-medium" 
                      : "text-sidebar-foreground/80 hover:bg-sidebar-foreground/10",
                    !open && "justify-center"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {open && (
                    <span className="truncate">{item.label}</span>
                  )}
                  {open && item.badge && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ml-auto ${item.badgeColor || 'bg-gray-100 text-gray-800'}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
            
            {isAdmin && open && (
              <li className="pt-2">
                <div className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/60 uppercase">
                  Admin
                </div>
              </li>
            )}
            
            {isAdmin && adminItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors",
                    isActive(item.path) 
                      ? "bg-primary/20 text-primary-foreground font-medium" 
                      : "text-sidebar-foreground/80 hover:bg-sidebar-foreground/10",
                    !open && "justify-center"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {open && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="px-3 mt-auto">
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
