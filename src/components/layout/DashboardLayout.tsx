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
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 1280;
  });
  const location = useLocation();

  useEffect(() => {
    const isDesktop = window.innerWidth >= 1280;
    setSidebarOpen(isDesktop);
  }, []);

  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-muted/20 text-foreground">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div
        className={cn(
          'flex min-h-screen flex-1 flex-col transition-all duration-300 ease-out',
          sidebarOpen ? 'md:ml-64 lg:ml-72' : 'md:ml-20'
        )}
      >
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} pageTitle={pageTitle} />

        <main className="flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-10">
          <div className="mx-auto w-full max-w-6xl space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
