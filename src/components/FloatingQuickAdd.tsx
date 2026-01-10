import { useState, useCallback, useEffect } from 'react';
import { Plus, Receipt, Briefcase, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuickTransactionInput } from '@/components/QuickTransactionInput';
import { QuickAssetInput } from '@/components/QuickAssetInput';
import { QuickIncomeInput } from '@/components/QuickIncomeInput';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

// Trigger haptic feedback on supported devices
const triggerHaptic = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(10);
  }
};

type TabType = 'transaction' | 'asset' | 'income';

interface FloatingQuickAddProps {
  defaultTab?: TabType;
}

// Map routes to default tabs for context-awareness
const ROUTE_TAB_MAP: Record<string, TabType> = {
  '/': 'transaction',
  '/expenses': 'transaction',
  '/budget': 'transaction',
  '/debt': 'transaction',
  '/investments': 'asset',
  '/income': 'income',
  '/savings-goals': 'transaction',
};

export function FloatingQuickAdd({ defaultTab }: FloatingQuickAddProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  // Determine the active tab based on route or prop
  const getDefaultTab = useCallback((): TabType => {
    if (defaultTab) return defaultTab;
    return ROUTE_TAB_MAP[location.pathname] || 'transaction';
  }, [defaultTab, location.pathname]);

  const [activeTab, setActiveTab] = useState<TabType>(getDefaultTab());

  // Update active tab when route changes
  useEffect(() => {
    setActiveTab(getDefaultTab());
  }, [getDefaultTab]);

  const handleClick = useCallback(() => {
    triggerHaptic();
    setIsOpen(true);
  }, []);

  const handleSuccess = useCallback(() => {
    // Close after a short delay to show success state
    setTimeout(() => {
      setIsOpen(false);
    }, 1500);
  }, []);

  return (
    <>
      {/* Floating Action Button - bottom right, above mobile nav */}
      <div className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6">
        {/* Pulse ring animation */}
        <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
        
        <Button
          onClick={handleClick}
          size="icon"
          className={cn(
            "relative h-14 w-14 rounded-full shadow-2xl",
            "bg-gradient-to-br from-primary via-primary to-primary/80",
            "hover:from-primary/90 hover:to-primary/70",
            "transition-all duration-300",
            "hover:scale-110 hover:shadow-primary/40 hover:shadow-2xl",
            "active:scale-95",
            "before:absolute before:inset-0 before:rounded-full",
            "before:bg-primary/20 before:blur-xl before:-z-10"
          )}
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </Button>
      </div>

      {/* Bottom Sheet with tabs */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8 h-auto max-h-[90vh] overflow-y-auto">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-center">Quick Add</SheetTitle>
          </SheetHeader>
          
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as TabType)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="transaction" className="gap-1.5 text-xs sm:text-sm">
                <Receipt className="h-4 w-4" />
                <span className="hidden sm:inline">Transaction</span>
                <span className="sm:hidden">Txn</span>
              </TabsTrigger>
              <TabsTrigger value="asset" className="gap-1.5 text-xs sm:text-sm">
                <Briefcase className="h-4 w-4" />
                Asset
              </TabsTrigger>
              <TabsTrigger value="income" className="gap-1.5 text-xs sm:text-sm">
                <Wallet className="h-4 w-4" />
                Income
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="transaction" className="max-w-md mx-auto">
              <QuickTransactionInput />
            </TabsContent>
            
            <TabsContent value="asset" className="max-w-md mx-auto">
              <QuickAssetInput onSuccess={handleSuccess} />
            </TabsContent>

            <TabsContent value="income" className="max-w-md mx-auto">
              <QuickIncomeInput onSuccess={handleSuccess} />
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  );
}
