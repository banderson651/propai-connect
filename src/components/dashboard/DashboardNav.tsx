
import React from 'react';
import { 
  Calendar as CalendarIcon,
  Building2,
  Users,
  CheckSquare,
  Settings
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navigation = [
  {
    name: 'Calendar',
    href: '/calendar',
    icon: CalendarIcon,
  },
  {
    name: 'Properties',
    href: '/properties',
    icon: Building2,
  },
  {
    name: 'Contacts',
    href: '/contacts',
    icon: Users,
  },
  {
    name: 'Tasks',
    href: '/tasks',
    icon: CheckSquare,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function DashboardNav() {
  const location = useLocation();
  
  return (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const isActive = location.pathname === item.href || 
                         location.pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
              isActive 
                ? "bg-indigo-50 text-indigo-600" 
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <item.icon className={cn(
              "mr-3 h-5 w-5",
              isActive ? "text-indigo-500" : "text-gray-400"
            )} 
            aria-hidden="true" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
