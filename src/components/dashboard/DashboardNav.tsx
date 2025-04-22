
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
    <nav className="flex flex-wrap md:flex-nowrap md:space-x-2 gap-2">
      {navigation.map((item) => {
        const isActive = location.pathname === item.href || 
                         location.pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors grow md:grow-0",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "bg-card hover:bg-muted text-foreground border"
            )}
          >
            <item.icon className="mr-2 h-5 w-5" aria-hidden="true" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
