import { useState, useCallback, useEffect } from 'react';
import { Plus, Receipt, Briefcase } from 'lucide-react';
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
import { cn } from '@/lib/utils';

// Trigger haptic feedback on supported devices
const triggerHaptic = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(10);
  }
};

interface FloatingQuickAddProps {
  defaultTab?: 'transaction' | 'asset';
}

export function FloatingQuickAdd({ defaultTab = 'transaction' }: FloatingQuickAddProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Update active tab when defaultTab changes (route change)
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleClick = useCallback(() => {
    triggerHaptic();
    setIsOpen(true);
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
        <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8 h-auto max-h-[85vh] overflow-y-auto">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-center">Quick Add</SheetTitle>
          </SheetHeader>
          
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'transaction' | 'asset')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="transaction" className="gap-2">
                <Receipt className="h-4 w-4" />
                Transaction
              </TabsTrigger>
              <TabsTrigger value="asset" className="gap-2">
                <Briefcase className="h-4 w-4" />
                Asset
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="transaction" className="max-w-md mx-auto">
              <QuickTransactionInput />
            </TabsContent>
            
            <TabsContent value="asset" className="max-w-md mx-auto">
              <QuickAssetInput onSuccess={() => setIsOpen(false)} />
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  );
}
