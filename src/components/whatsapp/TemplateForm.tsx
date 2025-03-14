
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import { WhatsAppTemplate } from '@/contexts/WhatsAppContext';

interface TemplateFormProps {
  newTemplate: Omit<WhatsAppTemplate, 'id' | 'status' | 'createdAt'>;
  setNewTemplate: React.Dispatch<React.SetStateAction<Omit<WhatsAppTemplate, 'id' | 'status' | 'createdAt'>>>;
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
  const languages = [
    { value: 'en_US', label: 'English (US)' },
    { value: 'es_LA', label: 'Spanish (Latin America)' },
    { value: 'pt_BR', label: 'Portuguese (Brazil)' },
    { value: 'fr_FR', label: 'French' },
    { value: 'de_DE', label: 'German' },
    { value: 'it_IT', label: 'Italian' },
    { value: 'zh_CN', label: 'Chinese (Simplified)' },
    { value: 'ja_JP', label: 'Japanese' },
    { value: 'ko_KR', label: 'Korean' },
  ];

  const categories = [
    { value: 'UTILITY', label: 'Utility' },
    { value: 'MARKETING', label: 'Marketing' },
    { value: 'AUTHENTICATION', label: 'Authentication' },
  ];

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <label htmlFor="template-name" className="text-sm font-medium">Template Name</label>
        <Input
          id="template-name"
          placeholder="e.g., Welcome Message"
          value={newTemplate.name}
          onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="template-language" className="text-sm font-medium">Language</label>
          <Select
            value={newTemplate.language}
            onValueChange={(value) => setNewTemplate({ ...newTemplate, language: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="template-category" className="text-sm font-medium">Category</label>
          <Select
            value={newTemplate.category}
            onValueChange={(value) => setNewTemplate({ ...newTemplate, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="template-content" className="text-sm font-medium">Content</label>
        <Textarea
          id="template-content"
          placeholder="Enter your template content here. Use {{1}}, {{2}}, etc. for variables."
          value={newTemplate.content}
          onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
          rows={4}
        />
        <p className="text-xs text-gray-500">
          Example: "Hello {{1}}, your appointment is confirmed for {{2}}."
        </p>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Variables</label>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            onClick={handleAddVariable}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Variable
          </Button>
        </div>
        <div className="space-y-2">
          {newTemplate.variables.map((variable, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder={`Variable ${index + 1} (e.g., name)`}
                value={variable}
                onChange={(e) => handleVariableChange(index, e.target.value)}
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="icon"
                onClick={() => handleRemoveVariable(index)}
                disabled={newTemplate.variables.length <= 1}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleCreateTemplate}
          disabled={!newTemplate.name || !newTemplate.content}
        >
          Create Template
        </Button>
      </div>
    </div>
  );
};
