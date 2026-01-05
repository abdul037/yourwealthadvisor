import { ReactNode } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { AppHeader } from '@/components/AppHeader';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { OnboardingTour } from '@/components/OnboardingTour';
import { TourProvider } from '@/hooks/useOnboardingTour';
import { FloatingQuickAdd } from '@/components/FloatingQuickAdd';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <TourProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="pb-16 md:pb-0">
            <AppHeader />
            <main className="flex-1">
              {children}
            </main>
          </SidebarInset>
          <MobileBottomNav />
          <FloatingQuickAdd />
        </div>
        <OnboardingTour />
      </SidebarProvider>
    </TourProvider>
  );
}
