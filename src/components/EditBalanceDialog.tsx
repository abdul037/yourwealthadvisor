import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LinkedAccount } from '@/hooks/useLinkedAccounts';

interface EditBalanceDialogProps {
  account: LinkedAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, newBalance: number) => void;
}

export function EditBalanceDialog({ 
  account, 
  open, 
  onOpenChange, 
  onSave 
}: EditBalanceDialogProps) {
  const [balance, setBalance] = useState('');

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && account) {
      setBalance(account.opening_balance.toString());
    }
    onOpenChange(isOpen);
  };

  const handleSave = () => {
    if (account && balance) {
      onSave(account.id, parseFloat(balance));
      onOpenChange(false);
    }
  };

  if (!account) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{account.platform_logo}</span>
            Edit Opening Balance
          </DialogTitle>
          <DialogDescription>
            Update the opening balance for {account.platform_name} ({account.account_number}).
            This is the initial balance when you connected the account.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="balance">Opening Balance ({account.currency})</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground">
              Enter the account balance as it was when you first connected this account.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!balance}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
