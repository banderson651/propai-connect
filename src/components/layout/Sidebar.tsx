
import { Link } from 'react-router-dom';
import { Home, Users, Building2, PieChart, Settings, Menu, Mail, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const Sidebar = ({ open, onOpenChange }: SidebarProps) => {
  const { isAdmin } = useAuth();
  
  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Contacts', path: '/contacts' },
    { icon: Mail, label: 'Email Campaigns', path: '/email' },
    { icon: Building2, label: 'Properties', path: '/properties' },
    { icon: PieChart, label: 'Analytics', path: '/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];
  
  // Only show admin options to admin users
  const adminItems = [
    { icon: Shield, label: 'Admin Dashboard', path: '/admin' },
  ];

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
                className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
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
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
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
};
