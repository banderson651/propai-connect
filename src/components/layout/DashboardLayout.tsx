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
  return <div className="min-h-screen bg-slate-50 relative">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
      <div className={cn("transition-all duration-300", sidebarOpen ? "md:ml-64" : "md:ml-16")}>
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} pageTitle={pageTitle} />
        
        <main className="px-10 lg:px-12 xl:px-16 py-8 bg-slate-50 min-h-[calc(100vh-80px)]">
          <div className="max-w-screen-2xl mx-auto bg-white">
            {children}
          </div>
        </main>
      </div>
    </div>;
}