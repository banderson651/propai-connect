
import { v4 as uuidv4 } from 'uuid';
import { Contact, ContactTag } from '@/types/contact';
import { saveContact, analyzeTextForTags } from './mockData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ImportMapping {
  sourceColumn: string;
  targetField: string;
}

export interface ImportProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  errors: string[];
}

export interface ColumnPreview {
  name: string;
  values: string[];
}

export const parseCSV = (fileContent: string): string[][] => {
  const lines = fileContent.split('\n');
  return lines.map(line => {
    // Handle quoted values that may contain commas
    const values: string[] = [];
    let currentValue = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Add the last value
    values.push(currentValue.trim());
    return values;
  }).filter(row => row.length > 0 && row.some(cell => cell.trim() !== ''));
};

export const parseExcel = async (file: File): Promise<string[][]> => {
  try {
    // We'll use the xlsx library to parse Excel files
    const XLSX = await import('xlsx');
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });
          resolve(json.filter(row => row.length > 0));
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error('Failed to parse Excel file. Please check the file format.');
  }
};

export const getColumnPreviews = (data: string[][], maxPreviewRows: number = 5): ColumnPreview[] => {
  if (data.length < 2) return [];
  
  const headers = data[0];
  const previewData = data.slice(1, maxPreviewRows + 1);
  
  return headers.map((header, index) => ({
    name: header,
    values: previewData.map(row => row[index] || '')
  }));
};

export const createImportRecord = async (filename: string, totalRows: number): Promise<string | null> => {
  try {
    // Get current user id from local storage
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      console.error('User not authenticated');
      return null;
    }
    
    const user = JSON.parse(storedUser);
    const userId = user.email; // Using email as user_id since we don't have UUID in the mock auth
    
    const { data, error } = await supabase
      .from('contact_imports')
      .insert({
        filename,
        total_rows: totalRows,
        status: 'mapping',
        user_id: userId
      })
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Error creating import record:', error);
    return null;
  }
};

export const saveColumnMappings = async (importId: string, mappings: ImportMapping[]): Promise<boolean> => {
  try {
    const mappingsToInsert = mappings.map(mapping => ({
      import_id: importId,
      source_column: mapping.sourceColumn,
      target_field: mapping.targetField
    }));
    
    const { error } = await supabase
      .from('contact_import_mappings')
      .insert(mappingsToInsert);
    
    if (error) throw error;
    
    // Update import status
    const { error: updateError } = await supabase
      .from('contact_imports')
      .update({ status: 'processing' })
      .eq('id', importId);
      
    if (updateError) throw updateError;
    
    return true;
  } catch (error) {
    console.error('Error saving column mappings:', error);
    return false;
  }
};

export const processImport = async (
  importId: string, 
  data: string[][], 
  mappings: ImportMapping[],
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportProgress> => {
  const progress: ImportProgress = {
    total: data.length - 1, // Exclude header row
    processed: 0,
    successful: 0,
    failed: 0,
    errors: []
  };
  
  try {
    // Update import status
    await supabase
      .from('contact_imports')
      .update({ status: 'processing' })
      .eq('id', importId);
    
    const headers = data[0];
    const rows = data.slice(1);
    
    const fieldIndexMap = new Map<string, number>();
    mappings.forEach(mapping => {
      const index = headers.findIndex(h => h === mapping.sourceColumn);
      if (index !== -1) {
        fieldIndexMap.set(mapping.targetField, index);
      }
    });
    
    for (const row of rows) {
      try {
        progress.processed++;
        
        const contactData: any = {
          tags: []
        };
        
        // Extract fields based on mapping
        for (const [field, index] of fieldIndexMap.entries()) {
          const value = row[index]?.trim();
          
          if (field === 'tags' && value) {
            // Split comma-separated tags
            contactData.tags = value.split(',').map(tag => tag.trim()) as ContactTag[];
          } else if (value) {
            contactData[field] = value;
          }
        }
        
        // Ensure required fields
        if (!contactData.name || !contactData.email) {
          throw new Error('Missing required fields: name and email');
        }
        
        // Auto-generate tags from notes
        if (contactData.notes && contactData.notes.length > 20) {
          const suggestedTags = analyzeTextForTags(contactData.notes);
          suggestedTags.forEach(tag => {
            if (!contactData.tags.includes(tag)) {
              contactData.tags.push(tag);
            }
          });
        }
        
        // Save the contact
        saveContact(contactData);
        progress.successful++;
        
        // Update progress every 10 contacts
        if (progress.processed % 10 === 0 && onProgress) {
          onProgress({ ...progress });
          
          // Update import record with progress
          await supabase
            .from('contact_imports')
            .update({ 
              imported_rows: progress.successful,
              status: 'processing'
            })
            .eq('id', importId);
        }
      } catch (error) {
        progress.failed++;
        if (error instanceof Error) {
          progress.errors.push(`Row ${progress.processed}: ${error.message}`);
        } else {
          progress.errors.push(`Row ${progress.processed}: Unknown error`);
        }
      }
    }
    
    // Final update to import record
    await supabase
      .from('contact_imports')
      .update({ 
        imported_rows: progress.successful,
        status: 'completed'
      })
      .eq('id', importId);
    
    if (onProgress) onProgress({ ...progress });
    return progress;
    
  } catch (error) {
    console.error('Error processing import:', error);
    
    // Update import status to failed
    await supabase
      .from('contact_imports')
      .update({ status: 'failed' })
      .eq('id', importId);
    
    throw error;
  }
};
