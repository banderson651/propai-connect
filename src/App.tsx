
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { WhatsAppProvider } from "./contexts/WhatsAppContext";
import { AutomationProvider } from "./contexts/AutomationContext";
import { AuthRoute } from "./components/auth/AuthRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ContactsPage from "./pages/contacts/ContactsPage";
import ContactDetailPage from "./pages/contacts/ContactDetailPage";
import NewContactPage from "./pages/contacts/NewContactPage";
import EmailCampaignsPage from "./pages/email/EmailCampaignsPage";
import EmailAccountsPage from "./pages/email/EmailAccountsPage";
import CampaignDetailPage from "./pages/email/CampaignDetailPage";
import NewCampaignPage from "./pages/email/NewCampaignPage";
import EmailTemplatesPage from "./pages/email/EmailTemplatesPage";
import PropertiesPage from "./pages/properties/PropertiesPage";
import PropertyDetailPage from "./pages/properties/PropertyDetailPage";
import NewPropertyPage from "./pages/properties/NewPropertyPage";
import PublicPropertyPage from "./pages/properties/PublicPropertyPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import WhatsAppSettingsPage from "./pages/settings/WhatsAppSettingsPage";
import AutomationPage from "./pages/automation/AutomationPage";
import NewRulePage from "./pages/automation/NewRulePage";
import TaskManagerPage from "./pages/tasks/TaskManagerPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <WhatsAppProvider>
            <AutomationProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/landing" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/properties/public/:slug" element={<PublicPropertyPage />} />
                
                {/* Root path redirect - public users go to landing, authenticated to dashboard */}
                <Route 
                  path="/" 
                  element={
                    <AuthRoute>
                      <Index />
                    </AuthRoute>
                  } 
                />
                
                {/* Protected routes */}
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
                
                <Route path="/analytics" element={<AuthRoute><Index /></AuthRoute>} />
                <Route path="/settings" element={<AuthRoute><WhatsAppSettingsPage /></AuthRoute>} />
                
                {/* Email Campaign Routes */}
                <Route path="/email" element={<AuthRoute><EmailCampaignsPage /></AuthRoute>} />
                <Route path="/email/accounts" element={<AuthRoute><EmailAccountsPage /></AuthRoute>} />
                <Route path="/email/campaigns/:id" element={<AuthRoute><CampaignDetailPage /></AuthRoute>} />
                <Route path="/email/campaigns/new" element={<AuthRoute><NewCampaignPage /></AuthRoute>} />
                <Route path="/email/templates" element={<AuthRoute><EmailTemplatesPage /></AuthRoute>} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AuthRoute requireAdmin={true}><AdminDashboard /></AuthRoute>} />
                <Route path="/admin/users" element={<AuthRoute requireAdmin={true}><AdminDashboard /></AuthRoute>} />
                
                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AutomationProvider>
          </WhatsAppProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
