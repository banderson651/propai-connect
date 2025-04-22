
import React from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, Rows, Images } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type ContactViewType = 'grid' | 'list' | 'table' | 'carousel';

interface ContactsViewSwitcherProps {
  currentView: ContactViewType;
  onChange: (view: ContactViewType) => void;
}

export const ContactsViewSwitcher: React.FC<ContactsViewSwitcherProps> = ({ 
  currentView, 
  onChange 
}) => {
  const views = [
    { id: 'grid', icon: LayoutGrid, label: 'Grid View' },
    { id: 'list', icon: List, label: 'List View' },
    { id: 'table', icon: Rows, label: 'Table View' },
    { id: 'carousel', icon: Images, label: 'Carousel View' }
  ] as const;
  
  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-md">
      {views.map((view) => (
        <TooltipProvider key={view.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant={currentView === view.id ? "default" : "ghost"}
                onClick={() => onChange(view.id)}
                className={`px-3 py-1.5 ${currentView === view.id ? "" : "text-gray-600"}`}
              >
                <view.icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{view.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};
