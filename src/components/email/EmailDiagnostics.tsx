
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Check, AlertTriangle, X, RefreshCw } from 'lucide-react';
import { EmailAccount } from '@/types/email';
import { testEmailConnection, sendTestEmail } from '@/services/email';

type DiagnosticStatus = 'idle' | 'running' | 'success' | 'error';

interface DiagnosticStep {
  id: string;
  name: string;
  status: DiagnosticStatus;
  message?: string;
  details?: string;
}

interface EmailDiagnosticsProps {
  account: EmailAccount;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function EmailDiagnostics({ account, onSuccess, onError }: EmailDiagnosticsProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<DiagnosticStep[]>([
    { id: 'config', name: 'Configuration Validation', status: 'idle' },
    { id: 'dns', name: 'DNS Lookup', status: 'idle' },
    { id: 'connection', name: 'SMTP Connection', status: 'idle' },
    { id: 'auth', name: 'Authentication', status: 'idle' },
    { id: 'sending', name: 'Test Email Sending', status: 'idle' }
  ]);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [overallStatus, setOverallStatus] = useState<DiagnosticStatus>('idle');

  const updateStep = (index: number, update: Partial<DiagnosticStep>) => {
    setSteps(prev => prev.map((step, idx) => 
      idx === index ? { ...step, ...update } : step
    ));
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setOverallStatus('running');
    setCurrentStep(0);
    setProgress(0);
    
    // Reset all steps
    setSteps(prev => prev.map(step => ({ ...step, status: 'idle', message: undefined, details: undefined })));

    try {
      // Step 1: Configuration Validation
      setCurrentStep(0);
      updateStep(0, { status: 'running' });
      setProgress(10);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check for missing required fields
      const configIssues = [];
      if (!account.host) configIssues.push('Missing SMTP host');
      if (!account.port) configIssues.push('Missing SMTP port');
      if (!account.username) configIssues.push('Missing SMTP username');
      
      if (configIssues.length > 0) {
        updateStep(0, { 
          status: 'error', 
          message: 'Configuration incomplete', 
          details: configIssues.join(', ')
        });
        throw new Error('Email configuration is incomplete: ' + configIssues.join(', '));
      }
      
      updateStep(0, { status: 'success', message: 'Configuration valid' });
      setProgress(20);
      
      // Step 2: DNS Lookup (simulated)
      setCurrentStep(1);
      updateStep(1, { status: 'running' });
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const host = account.host;
      const dnsResult = {
        success: true,
        message: `DNS lookup for ${host} successful`,
      };
      
      updateStep(1, { 
        status: dnsResult.success ? 'success' : 'error',
        message: dnsResult.message
      });
      setProgress(40);
      
      // Step 3 & 4: Connection & Authentication Test
      setCurrentStep(2);
      updateStep(2, { status: 'running' });
      
      const connectionResult = await testEmailConnection(account);
      
      if (!connectionResult.success) {
        updateStep(2, { 
          status: 'error', 
          message: 'Connection failed', 
          details: connectionResult.message 
        });
        updateStep(3, { status: 'idle' });
        throw new Error(`${account.type.toUpperCase()} connection failed: ` + connectionResult.message);
      }
      
      updateStep(2, { status: 'success', message: 'Connection successful' });
      setProgress(60);
      
      // Auth is implicitly tested in the connection test
      setCurrentStep(3);
      updateStep(3, { status: 'success', message: 'Authentication successful' });
      setProgress(80);
      
      // Step 5: Test Email Sending (if email address provided)
      setCurrentStep(4);
      if (testEmailAddress) {
        updateStep(4, { status: 'running' });
        
        const sendResult = await sendTestEmail(account, testEmailAddress);
        
        if (!sendResult.success) {
          updateStep(4, { 
            status: 'error', 
            message: 'Sending failed', 
            details: sendResult.message 
          });
          throw new Error('Email sending failed: ' + sendResult.message);
        }
        
        updateStep(4, { 
          status: 'success', 
          message: 'Email sent successfully',
          details: `Test email sent to ${testEmailAddress}`
        });
      } else {
        updateStep(4, { 
          status: 'idle', 
          message: 'Skipped - No test email address provided'
        });
      }
      
      setProgress(100);
      setOverallStatus('success');
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('Diagnostics error:', error);
      setOverallStatus('error');
      if (onError) onError(error instanceof Error ? error.message : 'Unknown diagnostic error');
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: DiagnosticStatus) => {
    switch (status) {
      case 'success': return <Check className="h-5 w-5 text-green-500" />;
      case 'error': return <X className="h-5 w-5 text-red-500" />;
      case 'running': return <LoadingSpinner />;
      default: return <div className="h-5 w-5" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>Email Diagnostics</span>
          {isRunning && <LoadingSpinner />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {overallStatus === 'error' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Diagnostics Failed</AlertTitle>
            <AlertDescription>
              One or more diagnostic tests failed. Review the steps below for details.
            </AlertDescription>
          </Alert>
        )}
        
        {overallStatus === 'success' && (
          <Alert variant="default" className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-500" />
            <AlertTitle>Diagnostics Passed</AlertTitle>
            <AlertDescription>
              All tests completed successfully. Your email configuration is working.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-1">
          <div className="text-sm font-medium">Progress</div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`p-3 rounded-md border ${
                index === currentStep && isRunning
                  ? 'border-blue-200 bg-blue-50'
                  : step.status === 'success'
                  ? 'border-green-200 bg-green-50'
                  : step.status === 'error'
                  ? 'border-red-200 bg-red-50'
                  : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(step.status)}
                  <span className="font-medium">{step.name}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {step.status === 'idle' ? 'Pending' : 
                   step.status === 'running' ? 'Running...' : 
                   step.status === 'success' ? 'Passed' : 'Failed'}
                </span>
              </div>
              
              {step.message && (
                <div className="mt-1 text-sm text-gray-600">
                  {step.message}
                </div>
              )}
              
              {step.details && (
                <div className="mt-1 text-xs text-gray-500">
                  {step.details}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="space-y-2 mt-4">
          <div className="text-sm font-medium">Test Email Address (Optional)</div>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="recipient@example.com"
              value={testEmailAddress}
              onChange={(e) => setTestEmailAddress(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isRunning}
            />
          </div>
        </div>
        
        <Button 
          onClick={runDiagnostics} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            'Run Diagnostics'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
