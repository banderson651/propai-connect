
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, AlertCircle, Mail, Tag, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAutomation } from '@/contexts/AutomationContext';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const RulesList = () => {
  const navigate = useNavigate();
  const { rules, loading, toggleRuleStatus, deleteRule } = useAutomation();
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const handleDelete = async () => {
    if (deleteId) {
      await deleteRule(deleteId);
      setDeleteId(null);
    }
  };

  const getTriggerTypeLabel = (type: string) => {
    switch(type) {
      case 'email': return 'Email Interaction';
      case 'lead': return 'Lead Activity';
      case 'property': return 'Property Update';
      case 'deadline': return 'Deadline';
      default: return type;
    }
  };

  const getActionIcon = (type: string) => {
    switch(type) {
      case 'notification': return <AlertCircle className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'task': return <CheckSquare className="h-4 w-4" />;
      case 'tag': return <Tag className="h-4 w-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
            <CardFooter>
              <div className="w-full flex justify-between">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (rules.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Automation Rules</CardTitle>
          <CardDescription>
            Create your first rule to automate your workflows
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Button onClick={() => navigate('/automation/new')}>Create Rule</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {rules.map((rule) => (
        <Card key={rule.id} className={`${!rule.isActive ? 'opacity-70' : ''}`}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{rule.name}</CardTitle>
                <CardDescription>{rule.description}</CardDescription>
              </div>
              <Switch 
                checked={rule.isActive} 
                onCheckedChange={(checked) => toggleRuleStatus(rule.id, checked)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex space-x-2 mb-1">
                <Badge variant="outline">Trigger</Badge>
                <Badge>{getTriggerTypeLabel(rule.triggerType)}</Badge>
              </div>
              <p className="text-sm">{rule.triggerCondition}</p>
            </div>
            
            <div>
              <Badge variant="outline" className="mb-2">Actions</Badge>
              <ul className="space-y-2">
                {rule.actions.map((action, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm">
                    {getActionIcon(action.type)}
                    <span>
                      {action.type === 'notification' && `Send notification: ${action.details.message?.substring(0, 40)}${action.details.message && action.details.message?.length > 40 ? '...' : ''}`}
                      {action.type === 'email' && `Send email: ${action.details.subject}`}
                      {action.type === 'task' && `Create task: ${action.details.taskTitle}`}
                      {action.type === 'tag' && `Add tag: ${action.details.tagName}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full flex justify-between">
              <Button variant="outline" size="sm" onClick={() => navigate(`/automation/${rule.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <AlertDialog open={deleteId === rule.id} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" onClick={() => setDeleteId(rule.id)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the automation rule "{rule.name}".
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
