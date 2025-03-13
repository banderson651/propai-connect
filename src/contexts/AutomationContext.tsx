
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  triggerType: 'email' | 'lead' | 'property' | 'deadline';
  triggerCondition: string;
  actions: AutomationAction[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationAction {
  id: string;
  type: 'notification' | 'email' | 'task' | 'tag';
  details: {
    subject?: string;
    message?: string;
    recipients?: string[];
    taskTitle?: string;
    tagName?: string;
  };
}

interface AutomationContextProps {
  rules: AutomationRule[];
  loading: boolean;
  createRule: (rule: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt'>) => Promise<AutomationRule>;
  updateRule: (id: string, updates: Partial<AutomationRule>) => Promise<boolean>;
  deleteRule: (id: string) => Promise<boolean>;
  toggleRuleStatus: (id: string, isActive: boolean) => Promise<boolean>;
}

const AutomationContext = createContext<AutomationContextProps | undefined>(undefined);

export const AutomationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAutomationRules();
  }, []);

  const fetchAutomationRules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedRules: AutomationRule[] = data.map(rule => ({
          id: rule.id,
          name: rule.name,
          description: rule.description,
          triggerType: rule.trigger_type,
          triggerCondition: rule.trigger_condition,
          actions: rule.actions,
          isActive: rule.is_active,
          createdAt: rule.created_at,
          updatedAt: rule.updated_at
        }));
        setRules(formattedRules);
      }
    } catch (error) {
      console.error('Error fetching automation rules:', error);
      toast({
        title: 'Error',
        description: 'Failed to load automation rules',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createRule = async (rule: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AutomationRule> => {
    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .insert({
          name: rule.name,
          description: rule.description,
          trigger_type: rule.triggerType,
          trigger_condition: rule.triggerCondition,
          actions: rule.actions,
          is_active: rule.isActive
        })
        .select('*')
        .single();

      if (error) throw error;

      const newRule: AutomationRule = {
        id: data.id,
        name: data.name,
        description: data.description,
        triggerType: data.trigger_type,
        triggerCondition: data.trigger_condition,
        actions: data.actions,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setRules(prevRules => [newRule, ...prevRules]);
      
      toast({
        title: 'Rule Created',
        description: `Automation rule "${rule.name}" created successfully`,
      });

      return newRule;
    } catch (error) {
      console.error('Error creating automation rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to create automation rule',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateRule = async (id: string, updates: Partial<AutomationRule>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .update({
          name: updates.name,
          description: updates.description,
          trigger_type: updates.triggerType,
          trigger_condition: updates.triggerCondition,
          actions: updates.actions,
          is_active: updates.isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setRules(prevRules => 
        prevRules.map(rule => 
          rule.id === id ? { ...rule, ...updates, updatedAt: new Date().toISOString() } : rule
        )
      );

      toast({
        title: 'Rule Updated',
        description: `Automation rule updated successfully`,
      });

      return true;
    } catch (error) {
      console.error('Error updating automation rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to update automation rule',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteRule = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRules(prevRules => prevRules.filter(rule => rule.id !== id));

      toast({
        title: 'Rule Deleted',
        description: 'Automation rule deleted successfully',
      });

      return true;
    } catch (error) {
      console.error('Error deleting automation rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete automation rule',
        variant: 'destructive',
      });
      return false;
    }
  };

  const toggleRuleStatus = async (id: string, isActive: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      setRules(prevRules => 
        prevRules.map(rule => 
          rule.id === id ? { ...rule, isActive } : rule
        )
      );

      toast({
        title: isActive ? 'Rule Activated' : 'Rule Deactivated',
        description: `Automation rule ${isActive ? 'activated' : 'deactivated'} successfully`,
      });

      return true;
    } catch (error) {
      console.error('Error toggling automation rule status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update automation rule status',
        variant: 'destructive',
      });
      return false;
    }
  };

  return (
    <AutomationContext.Provider 
      value={{ 
        rules, 
        loading,
        createRule,
        updateRule,
        deleteRule,
        toggleRuleStatus
      }}
    >
      {children}
    </AutomationContext.Provider>
  );
};

export const useAutomation = () => {
  const context = useContext(AutomationContext);
  if (context === undefined) {
    throw new Error('useAutomation must be used within an AutomationProvider');
  }
  return context;
};
