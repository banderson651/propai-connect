
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
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
            <Route path="/properties" element={<AuthRoute><Index /></AuthRoute>} />
            <Route path="/analytics" element={<AuthRoute><Index /></AuthRoute>} />
            <Route path="/settings" element={<AuthRoute><Index /></AuthRoute>} />
            
            {/* Email Campaign Routes */}
            <Route path="/email" element={<AuthRoute><EmailCampaignsPage /></AuthRoute>} />
            <Route path="/email/accounts" element={<AuthRoute><EmailAccountsPage /></AuthRoute>} />
            <Route path="/email/campaigns/:id" element={<AuthRoute><CampaignDetailPage /></AuthRoute>} />
            <Route path="/email/campaigns/new" element={<AuthRoute><NewCampaignPage /></AuthRoute>} />
            <Route path="/email/templates" element={<AuthRoute><EmailTemplatesPage /></AuthRoute>} />
            
            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
