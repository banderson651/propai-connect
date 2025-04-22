
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export const NotConnectedState: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Message Templates</CardTitle>
      </CardHeader>
      <CardContent className="text-center py-10">
        <p className="text-muted-foreground mb-4">
          Connect your WhatsApp Business account first to manage message templates
        </p>
        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
      </CardContent>
    </Card>
  );
};
