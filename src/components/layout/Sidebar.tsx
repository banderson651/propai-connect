import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Building2, 
  PieChart, 
  Settings, 
  Menu, 
  Shield, 
  MessageSquare, 
  Zap, 
  CheckSquare, 
  Calendar, 
  BarChart3,
  Mail
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
    { icon: Building2, label: 'Properties', path: '/properties' },
    { icon: MessageSquare, label: 'WhatsApp', path: '/settings/whatsapp', badge: isConnected ? 'Connected' : undefined, badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: Zap, label: 'Automation', path: '/automation' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Mail, label: 'Email Campaigns', path: '/email' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];
  
  // Only show admin options to admin users
  const adminItems = [
    { icon: Shield, label: 'Admin', path: '/admin' },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/') return true;
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return location.pathname === path;
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-minimal-grey-100 dark:bg-minimal-grey-900 text-minimal-grey-800 dark:text-minimal-grey-100 border-r border-minimal-grey-200 dark:border-minimal-grey-800 shadow-lg transition-sidebar duration-300 z-50',
        open ? 'w-64' : 'w-16',
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-minimal-grey-200 dark:border-minimal-grey-800 bg-white/80 dark:bg-minimal-grey-900/70 backdrop-blur-md">
        <h1 className={cn(
          'font-bold tracking-tight text-xl transition-opacity text-minimal-blue-600 dark:text-minimal-blue-200',
          open ? 'opacity-100' : 'opacity-0'
        )}>
          PropAI
        </h1>
        <button 
          onClick={() => onOpenChange(!open)} 
          className="p-2 hover:bg-minimal-blue-100 dark:hover:bg-minimal-blue-800 rounded-md transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5 text-minimal-grey-600 dark:text-minimal-grey-200" />
        </button>
      </div>
      <div className="flex flex-col h-[calc(100vh-64px)] justify-between pb-4">
        <nav className="p-2 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors group',
                    isActive(item.path)
                      ? 'bg-minimal-blue-100 dark:bg-minimal-blue-800 text-minimal-blue-700 dark:text-minimal-blue-100 shadow-sm'
                      : 'hover:bg-minimal-grey-200 dark:hover:bg-minimal-grey-800 text-minimal-grey-700 dark:text-minimal-grey-200',
                    !open && 'justify-center px-2'
                  )}
                >
                  <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive(item.path) ? 'text-minimal-blue-600 dark:text-minimal-blue-200' : 'text-minimal-grey-500 dark:text-minimal-grey-400')} />
                  {open && (
                    <span className="truncate">
                      {item.label}
                      {item.badge && (
                        <span className={cn('ml-2 px-2 py-0.5 rounded text-xs font-semibold', item.badgeColor || 'bg-success/10 text-success')}>{item.badge}</span>
                      )}
                    </span>
                  )}
                </Link>
              </li>
            ))}
            {isAdmin && adminItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors group',
                    isActive(item.path)
                      ? 'bg-minimal-purple-100 dark:bg-minimal-purple-800 text-minimal-purple-700 dark:text-minimal-purple-100 shadow-sm'
                      : 'hover:bg-minimal-grey-200 dark:hover:bg-minimal-grey-800 text-minimal-grey-700 dark:text-minimal-grey-200',
                    !open && 'justify-center px-2'
                  )}
                >
                  <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive(item.path) ? 'text-minimal-purple-600 dark:text-minimal-purple-200' : 'text-minimal-grey-500 dark:text-minimal-grey-400')} />
                  {open && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="px-3 mt-auto flex flex-col gap-2">
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
