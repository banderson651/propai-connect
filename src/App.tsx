
import { Suspense, lazy, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AuthRoute } from '@/components/auth/AuthRoute'; // Changed import to named import
import PublicRoute from '@/components/auth/PublicRoute';
import { LoadingSpinner } from '@/components/ui/loading-spinner'; // Fix import path
import { AuthProvider } from '@/contexts/AuthContext';
import { WhatsAppProvider } from '@/contexts/WhatsAppContext';
import { AutomationProvider } from '@/contexts/AutomationContext';

// Lazy load pages
const Landing = lazy(() => import('@/pages/Landing'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const IndexPage = lazy(() => import('@/pages/Index')); // Assuming Index.tsx is the dashboard or main protected page
const AnalyticsPage = lazy(() => import('@/app/analytics/page'));
const CalendarPage = lazy(() => import('@/app/calendar/page'));
const EmailAccountsPage = lazy(() => import('@/pages/email/EmailAccountsPage'));
const EmailTemplatesPage = lazy(() => import('@/pages/email/EmailTemplatesPage'));
const EmailCampaignsPage = lazy(() => import('@/pages/email/EmailCampaignsPage'));
const ContactsPage = lazy(() => import('@/pages/contacts/ContactsPage'));
const ContactDetailPage = lazy(() => import('@/pages/contacts/ContactDetailPage'));
const NewContactPage = lazy(() => import('@/pages/contacts/NewContactPage'));
const PropertiesPage = lazy(() => import('@/pages/properties/PropertiesPage'));
const PropertyDetailPage = lazy(() => import('@/pages/properties/PropertyDetailPage'));
const NewPropertyPage = lazy(() => import('@/pages/properties/NewPropertyPage'));
const PublicPropertyPage = lazy(() => import('@/pages/properties/PublicPropertyPage'));
const TaskManagerPage = lazy(() => import('@/pages/tasks/TaskManagerPage'));
const WhatsAppPage = lazy(() => import('@/pages/whatsapp/WhatsAppPage'));
 const WhatsAppSettingsPage = lazy(() => import('@/pages/settings/WhatsAppSettingsPage'));
const AutomationPage = lazy(() => import('@/pages/automation/AutomationPage'));
const NewRulePage = lazy(() => import('@/pages/automation/NewRulePage'));
const SettingsPage = lazy(() => import('@/pages/Settings'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));

const queryClient = new QueryClient();

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AuthProvider>
              <WhatsAppProvider>
                <AutomationProvider>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
                      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                      <Route path="/properties/public/:slug" element={<PublicPropertyPage />} />
                      
                      {/* Protected routes */}
                      <Route path="/dashboard" element={<AuthRoute><IndexPage /></AuthRoute>} />
                      <Route path="/analytics" element={<AuthRoute><AnalyticsPage /></AuthRoute>} />
                      <Route path="/calendar" element={<AuthRoute><CalendarPage /></AuthRoute>} />
                      <Route path="/email/accounts" element={<AuthRoute><EmailAccountsPage /></AuthRoute>} />
                      <Route path="/email/templates" element={<AuthRoute><EmailTemplatesPage /></AuthRoute>} />
                      <Route path="/email/campaigns" element={<AuthRoute><EmailCampaignsPage /></AuthRoute>} />
                      <Route path="/contacts" element={<AuthRoute><ContactsPage /></AuthRoute>} />
                      <Route path="/contacts/new" element={<AuthRoute><NewContactPage /></AuthRoute>} />
                      <Route path="/contacts/:id" element={<AuthRoute><ContactDetailPage /></AuthRoute>} />
                      <Route path="/properties" element={<AuthRoute><PropertiesPage /></AuthRoute>} />
                      <Route path="/properties/new" element={<AuthRoute><NewPropertyPage /></AuthRoute>} />
                      <Route path="/properties/:id" element={<AuthRoute><PropertyDetailPage /></AuthRoute>} />
                      <Route path="/tasks" element={<AuthRoute><TaskManagerPage /></AuthRoute>} />
                      <Route path="/whatsapp" element={<AuthRoute><WhatsAppPage /></AuthRoute>} />
                      <Route path="/whatsapp/settings" element={<AuthRoute><WhatsAppSettingsPage /></AuthRoute>} />
                      <Route path="/automation" element={<AuthRoute><AutomationPage /></AuthRoute>} />
                      <Route path="/automation/new" element={<AuthRoute><NewRulePage /></AuthRoute>} />
                      <Route path="/settings" element={<AuthRoute><SettingsPage /></AuthRoute>} />

                      {/* Admin Routes */}
                      <Route path="/admin" element={<AuthRoute adminOnly><AdminDashboard /></AuthRoute>} />
                      <Route path="/admin/users" element={<AuthRoute adminOnly><AdminDashboard /></AuthRoute>} />
                      
                      {/* Catch all route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </AutomationProvider>
              </WhatsAppProvider>
            </AuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
