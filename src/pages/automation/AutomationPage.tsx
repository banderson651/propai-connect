
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAutomation } from '@/contexts/AutomationContext';
import { RulesList } from '@/components/automation/RulesList';
import { DeadlineAlerts } from '@/components/automation/DeadlineAlerts';

const AutomationPage = () => {
  const navigate = useNavigate();
  const { rules, loading, toggleRuleStatus } = useAutomation();

  return (
    <DashboardLayout>
      <div className="w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Automation</h1>
            <p className="text-muted-foreground">
              Create automated workflows and rules to streamline your business processes
            </p>
          </div>
          <Button onClick={() => navigate('/automation/new')} size="sm">
            <Plus className="mr-2 h-4 w-4" /> New Rule
          </Button>
        </div>

        <Tabs defaultValue="rules" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="rules">Automation Rules</TabsTrigger>
            <TabsTrigger value="deadlines">Deadline Alerts</TabsTrigger>
            <TabsTrigger value="workflows">Visual Workflows</TabsTrigger>
          </TabsList>
          
          <TabsContent value="rules" className="space-y-4">
            <RulesList />
          </TabsContent>
          
          <TabsContent value="deadlines" className="space-y-4">
            <DeadlineAlerts />
          </TabsContent>
          
          <TabsContent value="workflows" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Visual Workflow Builder</CardTitle>
                <CardDescription>
                  Create advanced workflows with our drag-and-drop interface
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-8 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-xl font-medium mb-2">Visual Workflow Builder</h3>
                    <p className="text-muted-foreground mb-4">
                      Create complex workflows by dragging and connecting nodes
                    </p>
                    <Button>Open Workflow Editor</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AutomationPage;
