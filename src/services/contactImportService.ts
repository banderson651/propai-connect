
import { v4 as uuidv4 } from 'uuid';
import { Contact, ContactTag } from '@/types/contact';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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
          if (!data) {
            throw new Error('Failed to read file data');
          }
          
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });
          
          console.log('Parsed Excel data:', json.slice(0, 3)); // Debug log
          resolve(json.filter(row => Array.isArray(row) && row.length > 0));
        } catch (error) {
          console.error('Error processing Excel file:', error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(error);
      };
      
      reader.readAsArrayBuffer(file);
    });
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    toast.error('Failed to parse Excel file. Please check the file format.');
    throw new Error('Failed to parse Excel file. Please check the file format.');
  }
};

export const getColumnPreviews = (data: string[][], maxPreviewRows: number = 5): ColumnPreview[] => {
  if (!data || data.length < 2) {
    console.error('Invalid data for column previews:', data);
    return [];
  }
  
  const headers = data[0];
  const previewData = data.slice(1, maxPreviewRows + 1);
  
  console.log('Generating column previews. Headers:', headers);
  
  return headers.map((header, index) => ({
    name: header,
    values: previewData.map(row => (row[index] || '').toString().trim())
  }));
};

export const createImportRecord = async (filename: string, totalRows: number): Promise<string | null> => {
  try {
    // Get current user id from supabase auth
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      toast.error('You must be logged in to import contacts');
      return null;
    }
    
    console.log('Creating import record for file:', filename, 'with', totalRows, 'rows');
    
    const { data, error } = await supabase
      .from('contact_imports')
      .insert({
        filename,
        total_rows: totalRows,
        status: 'mapping',
        user_id: user.id
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating import record:', error);
      toast.error('Failed to start import process');
      throw error;
    }
    
    console.log('Import record created with ID:', data.id);
    return data.id;
  } catch (error) {
    console.error('Error creating import record:', error);
    toast.error('Failed to start import process');
    return null;
  }
};

export const saveColumnMappings = async (importId: string, mappings: ImportMapping[]): Promise<boolean> => {
  try {
    console.log('Saving column mappings for import ID:', importId, mappings);
    
    const mappingsToInsert = mappings.map(mapping => ({
      import_id: importId,
      source_column: mapping.sourceColumn,
      target_field: mapping.targetField
    }));
    
    const { error } = await supabase
      .from('contact_import_mappings')
      .insert(mappingsToInsert);
    
    if (error) {
      console.error('Error saving column mappings:', error);
      toast.error('Failed to save column mappings');
      throw error;
    }
    
    // Update import status
    const { error: updateError } = await supabase
      .from('contact_imports')
      .update({ status: 'processing' })
      .eq('id', importId);
      
    if (updateError) {
      console.error('Error updating import status:', updateError);
      toast.error('Failed to update import status');
      throw updateError;
    }
    
    console.log('Column mappings saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving column mappings:', error);
    toast.error('Failed to save column mappings');
    return false;
  }
};

export const processImport = async (
  importId: string, 
  data: string[][], 
  mappings: ImportMapping[],
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportProgress> => {
  console.log('Starting import process for ID:', importId);
  console.log('Data sample:', data.slice(0, 2));
  console.log('Mappings:', mappings);
  
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
    
    console.log('Processing', rows.length, 'rows with', headers.length, 'columns');
    
    const fieldIndexMap = new Map<string, number>();
    mappings.forEach(mapping => {
      const index = headers.findIndex(h => h === mapping.sourceColumn);
      if (index !== -1) {
        fieldIndexMap.set(mapping.targetField, index);
        console.log(`Mapped field ${mapping.targetField} to column index ${index}`);
      }
    });
    
    for (const row of rows) {
      try {
        progress.processed++;
        
        if (progress.processed % 10 === 0) {
          console.log(`Processed ${progress.processed} of ${progress.total} rows`);
        }
        
        const contactData: any = {
          tags: []
        };
        
        // Extract fields based on mapping
        for (const [field, index] of fieldIndexMap.entries()) {
          const value = row[index]?.toString().trim();
          
          if (field === 'tags' && value) {
            // Split comma-separated tags
            contactData.tags = value.split(',').map(tag => tag.trim()) as ContactTag[];
          } else if (value) {
            contactData[field] = value;
          }
        }
        
        // Ensure required fields
        if (!contactData.name || !contactData.email) {
          throw new Error(`Missing required fields: ${!contactData.name ? 'name' : ''} ${!contactData.email ? 'email' : ''}`);
        }
        
        // Generate a new UUID for the contact
        const contactId = uuidv4();
        const now = new Date().toISOString();
        
        // Insert the contact into Supabase
        const { error } = await supabase
          .from('contacts')
          .insert({
            id: contactId,
            name: contactData.name,
            email: contactData.email,
            phone: contactData.phone || null,
            address: contactData.address || null,
            tags: contactData.tags,
            notes: contactData.notes || null,
            created_at: now,
            updated_at: now
          });
          
        if (error) {
          console.error('Error inserting contact:', error);
          throw error;
        }
        
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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error processing row ${progress.processed}:`, errorMessage);
        progress.errors.push(`Row ${progress.processed}: ${errorMessage}`);
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
    
    console.log('Import completed successfully');
    console.log(`Processed: ${progress.processed}, Successful: ${progress.successful}, Failed: ${progress.failed}`);
    
    if (onProgress) onProgress({ ...progress });
    toast.success(`Successfully imported ${progress.successful} contacts`);
    return progress;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error processing import:', errorMessage);
    toast.error('Import failed. Please try again.');
    
    // Update import status to failed
    await supabase
      .from('contact_imports')
      .update({ status: 'failed' })
      .eq('id', importId);
    
    throw error;
  }
};
