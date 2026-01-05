import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { QuickTransactionInput } from '@/components/QuickTransactionInput';
import { cn } from '@/lib/utils';

export function FloatingQuickAdd() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button - bottom right, above mobile nav */}
      <div className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6">
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className={cn(
            "h-14 w-14 rounded-full shadow-2xl",
            "bg-gradient-to-br from-primary via-primary to-primary/80",
            "hover:from-primary/90 hover:to-primary/70",
            "transition-all duration-300",
            "hover:scale-110 hover:shadow-primary/40 hover:shadow-2xl",
            "active:scale-95",
            // Glow effect
            "before:absolute before:inset-0 before:rounded-full",
            "before:bg-primary/20 before:blur-xl before:-z-10"
          )}
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </Button>
      </div>

      {/* Bottom Sheet for mobile-friendly input */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-center">Quick Add Transaction</SheetTitle>
          </SheetHeader>
          <div className="max-w-md mx-auto">
            <QuickTransactionInput />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
