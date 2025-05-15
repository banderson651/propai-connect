
import { Loader2 } from 'lucide-react';

// Export as named export to match the import in App.tsx
export const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );
}; 

// Also add default export for backward compatibility
export default LoadingSpinner;
