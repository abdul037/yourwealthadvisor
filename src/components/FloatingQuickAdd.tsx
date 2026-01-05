import { useState } from 'react';
import { Plus, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { QuickTransactionInput } from '@/components/QuickTransactionInput';
import { cn } from '@/lib/utils';

export function FloatingQuickAdd() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating button - centered at top */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 md:top-4">
        <Button
          onClick={() => setIsOpen(true)}
          className={cn(
            "h-10 px-4 gap-2 rounded-full shadow-lg",
            "bg-gradient-to-r from-primary to-primary/80",
            "hover:from-primary/90 hover:to-primary/70",
            "transition-all duration-300 hover:shadow-xl hover:shadow-primary/25",
            "animate-fade-in"
          )}
        >
          <Plus className="h-4 w-4" />
          <span className="font-medium">Quick Add</span>
          <Sparkles className="h-3.5 w-3.5 opacity-70" />
        </Button>
      </div>

      {/* Dialog with QuickTransactionInput */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Quick Add Transaction
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <QuickTransactionInput />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
