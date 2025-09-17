import { ReactNode, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { cn } from '@/lib/utils';
interface DashboardLayoutProps {
  children: ReactNode;
  pageTitle?: string;
}
export function DashboardLayout({
  children,
  pageTitle
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  // Close sidebar on mobile by default
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, []);

  // Close sidebar on route change on mobile
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);
  return <div className="min-h-screen bg-background relative">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
      <div className={cn("transition-all duration-300", sidebarOpen ? "md:ml-64" : "md:ml-16")}>
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} pageTitle={pageTitle} />
        
        <main className="px-6 lg:px-10 xl:px-14 py-8 bg-background min-h-[calc(100vh-80px)]">
          <div className="max-w-screen-2xl mx-auto bg-card text-card-foreground rounded-2xl shadow-sm border border-border">
            {children}
          </div>
        </main>
      </div>
    </div>;
}
