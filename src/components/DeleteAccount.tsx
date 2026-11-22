import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';

const CONFIRM_WORD = 'DELETE';

/**
 * Permanently deletes the signed-in user's account and data.
 * Both app stores require this to be available inside the app.
 */
export function DeleteAccount() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = confirmText.trim().toUpperCase() === CONFIRM_WORD && !isDeleting;

  const handleOpenChange = (next: boolean) => {
    if (isDeleting) return;
    setOpen(next);
    if (!next) setConfirmText('');
  };

  const handleDelete = async () => {
    if (!canDelete) return;
    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-account', {
        body: { confirm: CONFIRM_WORD },
      });

      if (error || !data?.success) {
        // On a non-2xx reply the function's own message is in the response body.
        let message: string = data?.error || 'We could not delete your account. Please try again.';
        const response = (error as { context?: Response } | null)?.context;
        if (response && typeof response.json === 'function') {
          const body = await response.json().catch(() => null);
          if (body?.error) message = body.error;
        }
        throw new Error(message);
      }

      // The account no longer exists; clear the local session and leave the app.
      await supabase.auth.signOut().catch(() => undefined);
      toast({
        title: 'Account deleted',
        description: 'Your account and data have been removed.',
      });
      navigate('/welcome', { replace: true });
    } catch (err) {
      toast({
        title: 'Account not deleted',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="gap-2">
          <Trash2 className="w-4 h-4" />
          Delete my account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm text-muted-foreground text-left">
              <p>This permanently deletes your account and cannot be undone.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your profile, transactions, budgets, debts, goals, assets and linked accounts are deleted.</li>
                <li>Your posts, comments and friend connections are deleted.</li>
                <li>
                  In split groups other people still use, your entries stay so their balances remain
                  correct, but your name and email are removed.
                </li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <Label htmlFor="delete-confirm">Type {CONFIRM_WORD} to confirm</Label>
          <Input
            id="delete-confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={CONFIRM_WORD}
            autoComplete="off"
            autoCapitalize="characters"
            disabled={isDeleting}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Keep my account</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete} disabled={!canDelete} className="gap-2">
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isDeleting ? 'Deleting…' : 'Delete account'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
