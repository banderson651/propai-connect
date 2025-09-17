
import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AuthRoute } from '@/components/auth/AuthRoute';
import { PublicRoute } from '@/components/auth/PublicRoute';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AuthProvider } from '@/contexts/AuthContext';
import { AutomationProvider } from '@/contexts/AutomationContext';

// Lazy load pages
const Landing = lazy(() => import('@/pages/Landing'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const DocumentationPage = lazy(() => import('@/pages/Documentation'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const IndexPage = lazy(() => import('@/pages/Index'));
const AnalyticsPage = lazy(() => import('@/app/analytics/page'));
const CalendarPage = lazy(() => import('@/app/calendar/page'));
const EmailAccountsPage = lazy(() => import('@/pages/email/EmailAccountsPage'));
const EmailTemplatesPage = lazy(() => import('@/pages/email/EmailTemplatesPage'));
const EmailCampaignsPage = lazy(() => import('@/pages/email/EmailCampaignsPage'));
const ContactsPage = lazy(() => import('@/pages/contacts/ContactsPage'));
const ContactDetailPage = lazy(() => import('@/pages/contacts/ContactDetailPage'));
const NewContactPage = lazy(() => import('@/pages/contacts/NewContactPage'));
const PropertiesPage = lazy(() => import('@/pages/properties/PropertiesPage'));
const PropertyDetailPage = lazy(() => import('./pages/properties/PropertyDetailPage'));
const NewPropertyPage = lazy(() => import('./pages/properties/NewPropertyPage'));
const PublicPropertyPage = lazy(() => import('./pages/properties/PublicPropertyPage'));
const TaskManagerPage = lazy(() => import('./pages/tasks/TaskManagerPage'));
const AutomationPage = lazy(() => import('./pages/automation/AutomationPage'));
const NewRulePage = lazy(() => import('./pages/automation/NewRulePage'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const EmailCampaignsUnifiedPage = lazy(() => import('@/pages/email/EmailCampaignsUnifiedPage'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner />
  </div>
);

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <AuthProvider>
            <AutomationProvider>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
                  <Route path="/documentation" element={<PublicRoute><DocumentationPage /></PublicRoute>} />
                  <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                  <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                  <Route path="/properties/public/:slug" element={<PublicPropertyPage />} />

                  {/* Protected routes */}
                  <Route path="/dashboard" element={<AuthRoute><IndexPage /></AuthRoute>} />
                  <Route path="/analytics" element={<AuthRoute><AnalyticsPage /></AuthRoute>} />
                  <Route path="/calendar" element={<AuthRoute><CalendarPage /></AuthRoute>} />
                  <Route path="/email/accounts" element={<AuthRoute><EmailAccountsPage /></AuthRoute>} />
                  <Route path="/email/templates" element={<AuthRoute><EmailTemplatesPage /></AuthRoute>} />
                  <Route path="/email/campaigns" element={<AuthRoute><EmailCampaignsUnifiedPage /></AuthRoute>} />
                  <Route path="/contacts" element={<AuthRoute><ContactsPage /></AuthRoute>} />
                  <Route path="/contacts/new" element={<AuthRoute><NewContactPage /></AuthRoute>} />
                  <Route path="/contacts/:id" element={<AuthRoute><ContactDetailPage /></AuthRoute>} />
                  <Route path="/properties" element={<AuthRoute><PropertiesPage /></AuthRoute>} />
                  <Route path="/properties/new" element={<AuthRoute><NewPropertyPage /></AuthRoute>} />
                  <Route path="/properties/:id" element={<AuthRoute><PropertyDetailPage /></AuthRoute>} />
                  <Route path="/tasks" element={<AuthRoute><TaskManagerPage /></AuthRoute>} />
                  <Route path="/automation" element={<AuthRoute><AutomationPage /></AuthRoute>} />
                  <Route path="/automation/new" element={<AuthRoute><NewRulePage /></AuthRoute>} />
                  <Route path="/settings" element={<AuthRoute><SettingsPage /></AuthRoute>} />

                  {/* Admin Routes */}
                  <Route path="/admin-panel" element={<AuthRoute adminOnly><AdminDashboard /></AuthRoute>} />
                  <Route path="/admin-panel/users" element={<AuthRoute adminOnly><AdminDashboard /></AuthRoute>} />

                  {/* Catch all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <Toaster />
              <Sonner />
            </AutomationProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
