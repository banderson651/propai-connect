import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Papa from 'papaparse';

interface ImportedContact {
  name: string;
  email: string;
  [key: string]: any;
}

export function ImportContactsModal({ open, onOpenChange, onImported } : {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: (contacts: ImportedContact[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<ImportedContact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as ImportedContact[];
        // Only keep contacts with email
        setPreview(data.filter(row => row.email));
      },
      error: (err) => setError(err.message),
    });
  };

  const handleImport = async () => {
    setLoading(true);
    setError(null);
    // Pass contacts to parent for actual import
    onImported(preview);
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Contacts from CSV</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Label>CSV File (columns: name, email, ...)</Label>
          <Input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileChange} />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {preview.length > 0 && (
            <div>
              <div className="font-semibold mb-1">Preview ({preview.length} contacts):</div>
              <ul className="max-h-32 overflow-y-auto text-xs">
                {preview.slice(0, 10).map((row, i) => (
                  <li key={i}>{row.name || '(No Name)'} - {row.email}</li>
                ))}
                {preview.length > 10 && <li>...and {preview.length - 10} more</li>}
              </ul>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleImport} disabled={loading || preview.length === 0}>Import</Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
