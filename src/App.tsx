
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { WhatsAppProvider } from "./contexts/WhatsAppContext";
import { AutomationProvider } from "./contexts/AutomationContext";
import { AuthRoute } from "./components/auth/AuthRoute";
import { PublicRoute } from "./components/auth/PublicRoute";
import { lazy, Suspense, useState } from "react";
import { Loader2 } from "lucide-react";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import WhatsAppPage from '@/pages/whatsapp/WhatsAppPage';

// Lazy load all pages
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ContactsPage = lazy(() => import("./pages/contacts/ContactsPage"));
const ContactDetailPage = lazy(() => import("./pages/contacts/ContactDetailPage"));
const NewContactPage = lazy(() => import("./pages/contacts/NewContactPage"));
const EmailCampaignsPage = lazy(() => import("./pages/email/EmailCampaignsPage"));
const EmailAccountsPage = lazy(() => import("./pages/email/EmailAccountsPage"));
const CampaignDetailPage = lazy(() => import("./pages/email/CampaignDetailPage"));
const NewCampaignPage = lazy(() => import("./pages/email/NewCampaignPage"));
const EmailTemplatesPage = lazy(() => import("./pages/email/EmailTemplatesPage"));
const PropertiesPage = lazy(() => import("./pages/properties/PropertiesPage"));
const PropertyDetailPage = lazy(() => import("./pages/properties/PropertyDetailPage"));
const NewPropertyPage = lazy(() => import("./pages/properties/NewPropertyPage"));
const PublicPropertyPage = lazy(() => import("./pages/properties/PublicPropertyPage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const WhatsAppSettingsPage = lazy(() => import("./pages/settings/WhatsAppSettingsPage"));
const AutomationPage = lazy(() => import("./pages/automation/AutomationPage"));
const NewRulePage = lazy(() => import("./pages/automation/NewRulePage"));
const TaskManagerPage = lazy(() => import("./pages/tasks/TaskManagerPage"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import('@/pages/Settings'));
const CalendarPage = lazy(() => import("./pages/calendar/CalendarPage"));

// Configure the query client with better error handling and retries
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
    <span className="text-lg font-playfair">Loading PropAI...</span>
  </div>
);

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
                      <Route path="/dashboard" element={<AuthRoute><Index /></AuthRoute>} />
                      <Route path="/calendar" element={<AuthRoute><CalendarPage /></AuthRoute>} />
                      <Route path="/contacts" element={<AuthRoute><ContactsPage /></AuthRoute>} />
                      <Route path="/contacts/:id" element={<AuthRoute><ContactDetailPage /></AuthRoute>} />
                      <Route path="/contacts/new" element={<AuthRoute><NewContactPage /></AuthRoute>} />
                      
                      {/* Property Routes */}
                      <Route path="/properties" element={<AuthRoute><PropertiesPage /></AuthRoute>} />
                      <Route path="/properties/:id" element={<AuthRoute><PropertyDetailPage /></AuthRoute>} />
                      <Route path="/properties/new" element={<AuthRoute><NewPropertyPage /></AuthRoute>} />
                      
                      {/* Automation Routes */}
                      <Route path="/automation" element={<AuthRoute><AutomationPage /></AuthRoute>} />
                      <Route path="/automation/new" element={<AuthRoute><NewRulePage /></AuthRoute>} />
                      
                      {/* Task Routes */}
                      <Route path="/tasks" element={<AuthRoute><TaskManagerPage /></AuthRoute>} />
                      
                      {/* WhatsApp Routes */}
                      <Route path="/settings/whatsapp" element={<AuthRoute><WhatsAppSettingsPage /></AuthRoute>} />
                      <Route path="/whatsapp" element={<AuthRoute><WhatsAppPage /></AuthRoute>} />
                      
                      {/* Analytics Route */}
                      <Route path="/analytics" element={<AuthRoute><Analytics /></AuthRoute>} />
                      
                      {/* Settings Route */}
                      <Route path="/settings/*" element={<AuthRoute><Settings /></AuthRoute>} />
                      
                      {/* Email Campaign Routes */}
                      <Route path="/email" element={<AuthRoute><EmailCampaignsPage /></AuthRoute>} />
                      <Route path="/email/accounts" element={<AuthRoute><EmailAccountsPage /></AuthRoute>} />
                      <Route path="/email/campaigns/:id" element={<AuthRoute><CampaignDetailPage /></AuthRoute>} />
                      <Route path="/email/campaigns/new" element={<AuthRoute><NewCampaignPage /></AuthRoute>} />
                      <Route path="/email/templates" element={<AuthRoute><EmailTemplatesPage /></AuthRoute>} />
                      
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
