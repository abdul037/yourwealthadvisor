import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Mic, MicOff, Send, Check, Pencil, X, Loader2 } from 'lucide-react';
import { useSplitExpenseParser, ParsedSplitExpense } from '@/hooks/useSplitExpenseParser';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { cn } from '@/lib/utils';

interface ExpenseGroupMember {
  id: string;
  name: string;
  user_id?: string | null;
}

interface QuickSplitExpenseInputProps {
  members: ExpenseGroupMember[];
  currency: string;
  currentUserMemberId?: string;
  onAddExpense: (data: {
    description: string;
    amount: number;
    paidByMemberId: string;
    splitType: 'equal' | 'percentage' | 'custom';
    notes?: string;
  }) => void;
  onEditExpense: (data: ParsedSplitExpense, paidByMemberId: string | null) => void;
}

export function QuickSplitExpenseInput({
  members,
  currency,
  currentUserMemberId,
  onAddExpense,
  onEditExpense
}: QuickSplitExpenseInputProps) {
  const [input, setInput] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Get current user's name for AI context
  const currentUserName = useMemo(() => 
    members.find(m => m.id === currentUserMemberId)?.name,
    [members, currentUserMemberId]
  );
  
  // Generate dynamic examples based on actual members
  const dynamicExamples = useMemo(() => {
    const otherMember = members.find(m => m.id !== currentUserMemberId)?.name || 'Friend';
    return [
      "Dinner 250 I paid",
      `Uber 85 ${otherMember} paid`,
      "Groceries 120 split equally"
    ];
  }, [members, currentUserMemberId]);
  
  const memberNames = members.map(m => m.name);
  const { parse, isLoading, error, result, reset } = useSplitExpenseParser(memberNames, currency, currentUserName);
  const { isListening, isSupported, transcript, interimTranscript, startListening, stopListening } = useVoiceInput();

  // Handle voice transcript
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    await parse(input);
  };

  const handleConfirm = () => {
    if (!result) return;

    // Find member ID from parsed name
    const paidByMember = result.paid_by 
      ? members.find(m => m.name.toLowerCase() === result.paid_by?.toLowerCase())
      : null;
    
    const paidByMemberId = paidByMember?.id || currentUserMemberId;
    
    if (!paidByMemberId) {
      return; // Can't add without a payer
    }

    onAddExpense({
      description: result.description,
      amount: result.amount,
      paidByMemberId,
      splitType: result.split_type,
      notes: result.notes || undefined
    });

    setShowSuccess(true);
    setInput('');
    reset();
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleEdit = () => {
    if (!result) return;
    
    const paidByMember = result.paid_by 
      ? members.find(m => m.name.toLowerCase() === result.paid_by?.toLowerCase())
      : null;
    
    onEditExpense(result, paidByMember?.id || currentUserMemberId || null);
    setInput('');
    reset();
  };

  const handleCancel = () => {
    reset();
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Success state
  if (showSuccess) {
    return (
      <Card className="border-green-500/30 bg-green-500/10 mb-4">
        <CardContent className="py-3 flex items-center gap-2 text-green-600">
          <Check className="h-4 w-4" />
          <span className="text-sm font-medium">Expense added successfully!</span>
        </CardContent>
      </Card>
    );
  }

  // Preview state
  if (result) {
    const paidByMember = result.paid_by 
      ? members.find(m => m.name.toLowerCase() === result.paid_by?.toLowerCase())
      : null;
    const paidByName = paidByMember?.name || (currentUserMemberId ? members.find(m => m.id === currentUserMemberId)?.name : null) || 'You';

    return (
      <Card className="border-primary/30 bg-primary/5 mb-4">
        <CardContent className="py-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="font-medium">Parsed Successfully</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Description:</span>
              <p className="font-medium">{result.description}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Amount:</span>
              <p className="font-medium">{currency} {result.amount.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Paid by:</span>
              <p className="font-medium">{paidByName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Split:</span>
              <Badge variant="outline" className="capitalize">{result.split_type}</Badge>
            </div>
          </div>
          
          {result.notes && (
            <div className="text-sm">
              <span className="text-muted-foreground">Notes:</span>
              <p className="text-muted-foreground italic">{result.notes}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-3.5 w-3.5 mr-1" />
              Cancel
            </Button>
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Pencil className="h-3.5 w-3.5 mr-1" />
              Edit Details
            </Button>
            <Button size="sm" onClick={handleConfirm} className="ml-auto">
              <Check className="h-3.5 w-3.5 mr-1" />
              Add Expense
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardContent className="py-3">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Quick Add</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {isSupported && (
              <Button
                type="button"
                variant={isListening ? "destructive" : "outline"}
                size="icon"
                onClick={handleVoiceToggle}
                className="shrink-0"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
            
            <Input
              value={isListening && interimTranscript ? interimTranscript : input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., Dinner 250 Ahmed paid"
              disabled={isLoading || isListening}
              className={cn(
                "flex-1",
                isListening && "border-primary animate-pulse"
              )}
            />
            
            <Button 
              type="submit" 
              size="icon"
              disabled={!input.trim() || isLoading}
              className="shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-muted-foreground">Try:</span>
            {dynamicExamples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setInput(example)}
                className="text-xs text-primary hover:underline"
              >
                "{example}"
              </button>
            ))}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
