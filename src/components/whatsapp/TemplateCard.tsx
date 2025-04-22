import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Copy, CheckCircle2, Clock, AlertCircle, MoreHorizontal } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { WhatsAppTemplate } from '@/types/whatsapp';

interface TemplateCardProps {
  template: WhatsAppTemplate;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="outline" className="text-green-600 bg-green-50 hover:bg-green-100 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="text-yellow-600 bg-yellow-50 hover:bg-yellow-100 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" /> Pending Review
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="text-red-600 bg-red-50 hover:bg-red-100 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" /> Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium">{template.name}</CardTitle>
          <div className="flex items-center">
            {getStatusBadge(template.status)}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-0" align="end">
                <div className="flex flex-col">
                  <Button variant="ghost" className="justify-start h-9 px-2 py-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="ghost" className="justify-start h-9 px-2 py-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button variant="ghost" className="justify-start h-9 px-2 py-1 text-red-600 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{template.content}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          <Badge variant="secondary" className="text-xs">
            {template.language.split('_')[0].toUpperCase()}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {template.category}
          </Badge>
          {template.variables.map((variable, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {variable}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
