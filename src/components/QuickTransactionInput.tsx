import { useState } from 'react';
import { Send, Loader2, Check, X, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTransactionParser, ParsedTransaction } from '@/hooks/useTransactionParser';
import { useTransactions } from '@/hooks/useTransactions';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const EXAMPLE_INPUTS = [
  "Spent 120 on groceries",
  "Careem ride 45",
  "Got salary 25000",
  "Netflix 55 AED",
  "Coffee 18",
];

export function QuickTransactionInput() {
  const [input, setInput] = useState('');
  const [preview, setPreview] = useState<ParsedTransaction | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { parse, isLoading, error } = useTransactionParser();
  const { addTransaction } = useTransactions();

  const placeholder = EXAMPLE_INPUTS[Math.floor(Math.random() * EXAMPLE_INPUTS.length)];

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const parsed = await parse(input);
    if (parsed) {
      setPreview(parsed);
    }
  };

  const handleConfirm = async () => {
    if (!preview) return;

    try {
      await addTransaction.mutateAsync({
        type: preview.type,
        amount: preview.amount,
        currency: preview.currency,
        category: preview.category,
        description: preview.description,
        transaction_date: new Date().toISOString().split('T')[0],
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setPreview(null);
        setInput('');
      }, 1500);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save transaction',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    setPreview(null);
  };

  const handleEdit = () => {
    setPreview(null);
    // Keep the input so user can modify it
  };

  if (showSuccess) {
    return (
      <Card className="border-green-500/50 bg-green-500/10">
        <CardContent className="flex items-center justify-center gap-2 py-4">
          <Check className="h-5 w-5 text-green-500" />
          <span className="text-green-600 dark:text-green-400 font-medium">Transaction saved!</span>
        </CardContent>
      </Card>
    );
  }

  if (preview) {
    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={preview.type === 'income' ? 'default' : 'secondary'}>
                {preview.type}
              </Badge>
              <span className="font-semibold text-lg">
                {preview.currency} {preview.amount.toLocaleString()}
              </span>
            </div>
            <Badge variant="outline">{preview.category}</Badge>
          </div>
          
          {preview.description && (
            <p className="text-sm text-muted-foreground">{preview.description}</p>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="flex-1"
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={addTransaction.isPending}
              className="flex-1"
            >
              {addTransaction.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Confirm
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Try: "${placeholder}"`}
            disabled={isLoading}
            className={cn(
              "pr-10",
              error && "border-destructive"
            )}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        <Button 
          type="submit" 
          size="icon"
          disabled={!input.trim() || isLoading}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </form>
  );
}
