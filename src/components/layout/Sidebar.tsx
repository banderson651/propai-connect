
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Building2, PieChart, Settings, Menu, Mail, Shield, MessageSquare, Zap, CheckSquare, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useWhatsApp } from '@/contexts/WhatsAppContext';

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const Sidebar = ({ open, onOpenChange }: SidebarProps) => {
  const { isAdmin } = useAuth();
  const { isConnected } = useWhatsApp();
  const location = useLocation();
  
  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Contacts', path: '/contacts' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: Mail, label: 'Email Campaigns', path: '/email' },
    { icon: Building2, label: 'Properties', path: '/properties' },
    { icon: Zap, label: 'Automation', path: '/automation' },
    { icon: PieChart, label: 'Analytics', path: '/analytics' },
    { 
      icon: MessageSquare, 
      label: 'WhatsApp', 
      path: '/settings/whatsapp', 
      badge: isConnected ? 'Connected' : undefined,
      badgeColor: 'bg-green-100 text-green-800'
    },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];
  
  // Only show admin options to admin users
  const adminItems = [
    { icon: Shield, label: 'Admin Dashboard', path: '/admin' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 transition-transform duration-300 z-50',
        !open && '-translate-x-full'
      )}
    >
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-800">PropAI</h1>
        <button onClick={() => onOpenChange(!open)} className="p-2 hover:bg-gray-100 rounded-md">
          <Menu className="h-5 w-5" />
        </button>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-md transition-colors",
                  isActive(item.path) && "bg-gray-100 text-blue-600 font-medium"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ml-auto ${item.badgeColor || 'bg-gray-100 text-gray-800'}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
          
          {isAdmin && (
            <>
              <li className="pt-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                  Admin
                </div>
              </li>
              {adminItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-md transition-colors",
                      isActive(item.path) && "bg-gray-100 text-blue-600 font-medium"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
}
