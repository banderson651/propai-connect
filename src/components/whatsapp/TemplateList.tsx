import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { WhatsAppTemplate } from '@/types/whatsapp';
import { TemplateCard } from './TemplateCard';

interface TemplateListProps {
  templates: WhatsAppTemplate[];
  loading: boolean;
}

export const TemplateList: React.FC<TemplateListProps> = ({ templates, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-10">
        <p>Loading templates...</p>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-10">
          <p className="text-muted-foreground mb-4">
            No message templates found. Create your first template to get started.
          </p>
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
};
