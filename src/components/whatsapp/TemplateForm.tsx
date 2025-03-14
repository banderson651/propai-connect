
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Trash2 } from 'lucide-react';

interface TemplateFormProps {
  newTemplate: {
    name: string;
    content: string;
    language: string;
    category: string;
    variables: string[];
  };
  setNewTemplate: React.Dispatch<React.SetStateAction<{
    name: string;
    content: string;
    language: string;
    category: string;
    variables: string[];
  }>>;
  handleCreateTemplate: () => Promise<void>;
  handleAddVariable: () => void;
  handleVariableChange: (index: number, value: string) => void;
  handleRemoveVariable: (index: number) => void;
  onClose: () => void;
}

export const TemplateForm: React.FC<TemplateFormProps> = ({
  newTemplate,
  setNewTemplate,
  handleCreateTemplate,
  handleAddVariable,
  handleVariableChange,
  handleRemoveVariable,
  onClose
}) => {
  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="template-name">Template Name</Label>
          <Input
            id="template-name"
            value={newTemplate.name}
            onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. welcome_message"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="template-category">Category</Label>
          <Select 
            value={newTemplate.category}
            onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UTILITY">Utility</SelectItem>
              <SelectItem value="MARKETING">Marketing</SelectItem>
              <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="template-language">Language</Label>
        <Select 
          value={newTemplate.language}
          onValueChange={(value) => setNewTemplate(prev => ({ ...prev, language: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en_US">English (US)</SelectItem>
            <SelectItem value="es_ES">Spanish (Spain)</SelectItem>
            <SelectItem value="pt_BR">Portuguese (Brazil)</SelectItem>
            <SelectItem value="fr_FR">French</SelectItem>
            <SelectItem value="de_DE">German</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="template-content">Template Content</Label>
        <Textarea
          id="template-content"
          value={newTemplate.content}
          onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
          placeholder="Hello {{1}}, welcome to our service!"
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Use {{1}}, {{2}}, etc. as placeholders for variables
        </p>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Variables</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddVariable}>
            Add Variable
          </Button>
        </div>
        
        <div className="space-y-2">
          {newTemplate.variables.map((variable, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={variable}
                onChange={(e) => handleVariableChange(index, e.target.value)}
                placeholder={`Variable ${index + 1} (e.g. name)`}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={() => handleRemoveVariable(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleCreateTemplate} disabled={!newTemplate.name || !newTemplate.content}>
          Create Template
        </Button>
      </DialogFooter>
    </div>
  );
};
