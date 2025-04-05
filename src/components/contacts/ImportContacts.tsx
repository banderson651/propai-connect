import React, { useState, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { toast } from 'sonner';
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { 
  parseCSV, 
  parseExcel, 
  getColumnPreviews, 
  ImportMapping, 
  ColumnPreview,
  ImportProgress,
  createImportRecord,
  saveColumnMappings,
  processImport
} from '@/services/contactImportService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const fieldOptions = [
  { value: 'name', label: 'Full Name' },
  { value: 'email', label: 'Email Address' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'address', label: 'Address' },
  { value: 'tags', label: 'Tags (comma separated)' },
  { value: 'notes', label: 'Notes' },
];

export const ImportContacts: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<string[][]>([]);
  const [columnPreviews, setColumnPreviews] = useState<ColumnPreview[]>([]);
  const [mappings, setMappings] = useState<ImportMapping[]>([]);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importId, setImportId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast: uiToast } = useToast();
  
  const resetState = () => {
    setFile(null);
    setFileData([]);
    setColumnPreviews([]);
    setMappings([]);
    setProgress(null);
    setIsProcessing(false);
    setImportId(null);
    setIsUploading(false);
    setStep(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setIsUploading(true);
    setFile(selectedFile);
    
    try {
      console.log('Processing file:', selectedFile.name, selectedFile.type);
      let parsedData: string[][] = [];
      
      if (selectedFile.name.endsWith('.csv')) {
        console.log('Parsing CSV file...');
        const text = await selectedFile.text();
        parsedData = parseCSV(text);
      } else if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        console.log('Parsing Excel file...');
        parsedData = await parseExcel(selectedFile);
      } else {
        throw new Error('Unsupported file format. Please upload a CSV or Excel file.');
      }
      
      if (parsedData.length < 2) {
        throw new Error('The file appears to be empty or has invalid format.');
      }
      
      console.log('File parsed successfully. Row count:', parsedData.length);
      setFileData(parsedData);
      
      // Generate column previews
      const previews = getColumnPreviews(parsedData);
      setColumnPreviews(previews);
      
      // Generate initial mappings based on header names
      const initialMappings: ImportMapping[] = [];
      parsedData[0].forEach(header => {
        const normalizedHeader = header.toLowerCase().trim();
        
        // Try to match header with field
        const matchedField = fieldOptions.find(field => {
          return field.label.toLowerCase().includes(normalizedHeader) || 
                 normalizedHeader.includes(field.value);
        });
        
        if (matchedField) {
          initialMappings.push({
            sourceColumn: header,
            targetField: matchedField.value
          });
        }
      });
      
      setMappings(initialMappings);
      
      // Create import record
      const newImportId = await createImportRecord(selectedFile.name, parsedData.length - 1);
      if (newImportId) {
        setImportId(newImportId);
      }
      
      // Move to next step
      setStep(2);
      toast.success('File uploaded successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('File parsing error:', errorMessage);
      toast.error(`Error uploading file: ${errorMessage}`);
      uiToast({
        variant: "destructive",
        title: "Error uploading file",
        description: errorMessage,
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleUpdateMapping = (sourceColumn: string, targetField: string) => {
    setMappings(prev => {
      // Check if mapping already exists
      const existingIndex = prev.findIndex(m => m.sourceColumn === sourceColumn);
      
      if (existingIndex !== -1) {
        // Update existing mapping
        const updated = [...prev];
        if (targetField) {
          updated[existingIndex] = { ...updated[existingIndex], targetField };
        } else {
          // Remove mapping if no target field is selected
          updated.splice(existingIndex, 1);
        }
        return updated;
      } else if (targetField) {
        // Add new mapping
        return [...prev, { sourceColumn, targetField }];
      }
      
      return prev;
    });
  };
  
  const handleStartImport = async () => {
    if (!fileData.length || !mappings.length || !importId) {
      toast.error('Cannot start import. Please upload a file and map at least name and email fields.');
      return;
    }
    
    // Check if required fields are mapped
    const hasNameMapping = mappings.some(m => m.targetField === 'name');
    const hasEmailMapping = mappings.some(m => m.targetField === 'email');
    
    if (!hasNameMapping || !hasEmailMapping) {
      toast.error('You must map both Name and Email fields to proceed.');
      uiToast({
        variant: "destructive",
        title: "Missing required fields",
        description: "You must map both Name and Email fields to proceed.",
      });
      return;
    }
    
    setIsProcessing(true);
    setStep(3);
    
    try {
      console.log('Starting import process...');
      // Save mappings to database
      await saveColumnMappings(importId, mappings);
      
      // Process the import
      await processImport(importId, fileData, mappings, (progressUpdate) => {
        setProgress(progressUpdate);
        console.log('Import progress:', progressUpdate);
      });
      
      toast.success(`Successfully imported ${progress?.successful || 0} contacts.`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Import error:', errorMessage);
      toast.error(`Import failed: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleClose = () => {
    if (isProcessing) {
      toast.info('Import is in progress. It will continue in the background.');
    }
    resetState();
    setIsOpen(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const file = droppedFiles[0];
      
      // Create a synthetic event object with the file
      const syntheticEvent = {
        target: {
          files: droppedFiles
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      
      await handleFileChange(syntheticEvent);
    }
  };
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="py-8 flex flex-col items-center">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin mb-4">
                    <svg className="h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Processing file...</h3>
                </>
              ) : (
                <>
                  <UploadCloud className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Upload Contact File</h3>
                  <p className="text-sm text-gray-500 text-center mb-6">
                    Drag and drop a CSV or Excel file, or click to browse
                  </p>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Select File
                  </Button>
                </>
              )}
            </div>
            <div className="mt-6 text-sm text-gray-500">
              <p>Supported file formats: CSV, Excel (.xlsx, .xls)</p>
              <p className="mt-1">Your file should include headers in the first row</p>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="py-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Map Columns</h3>
              <p className="text-sm text-gray-500">
                Match the columns from your file to contact fields
              </p>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto mb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Column in File</TableHead>
                    <TableHead className="w-1/3">Map to Field</TableHead>
                    <TableHead>Preview (first 5 rows)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {columnPreviews.map((column) => (
                    <TableRow key={column.name}>
                      <TableCell className="font-medium">{column.name}</TableCell>
                      <TableCell>
                        <Select
                          value={mappings.find(m => m.sourceColumn === column.name)?.targetField || "none"}
                          onValueChange={(value) => handleUpdateMapping(column.name, value === "none" ? "" : value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select field..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">-- Do not import --</SelectItem>
                            {fieldOptions.map(option => (
                              <SelectItem 
                                key={option.value} 
                                value={option.value}
                                disabled={mappings.some(m => 
                                  m.targetField === option.value && 
                                  m.sourceColumn !== column.name &&
                                  // Allow multiple tag mappings
                                  option.value !== 'tags'
                                )}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {column.values.map((value, idx) => (
                            <div key={idx} className="truncate max-w-[200px]">
                              {value || <span className="text-gray-300">Empty</span>}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleStartImport}>
                Start Import
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="py-6">
            <h3 className="text-lg font-medium mb-4">Importing Contacts</h3>
            
            {progress && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>
                      {progress.processed} of {progress.total} ({Math.round((progress.processed / progress.total) * 100)}%)
                    </span>
                  </div>
                  <Progress value={(progress.processed / progress.total) * 100} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{progress.successful}</div>
                        <div className="text-sm text-gray-500">Successfully Imported</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{progress.failed}</div>
                        <div className="text-sm text-gray-500">Failed</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {progress.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Import Errors</AlertTitle>
                    <AlertDescription>
                      <div className="max-h-32 overflow-y-auto text-sm mt-2">
                        {progress.errors.map((error, idx) => (
                          <div key={idx}>{error}</div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
                
                {!isProcessing && (
                  <div className="flex justify-center">
                    <Button onClick={handleClose}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Done
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {!progress && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin mr-2">
                  <svg className="h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <span>Preparing import...</span>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          <UploadCloud className="mr-2 h-4 w-4" />
          Import Contacts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import Contacts</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to import contacts into your CRM
          </DialogDescription>
        </DialogHeader>
        
        {renderStep()}
        
        {step < 3 && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
