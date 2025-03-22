import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

const navigation = [
  {
    name: 'Calendar',
    href: '/calendar',
    icon: CalendarIcon,
  },
];

export function DashboardNav() {
  return (
    <nav className="space-y-1">
      {navigation.map((item) => (
        <a
          key={item.name}
          href={item.href}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
        >
          <item.icon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
          {item.name}
        </a>
      ))}
    </nav>
  );
} 