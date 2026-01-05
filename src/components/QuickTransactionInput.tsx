import { useState, useEffect } from 'react';
import { Send, Loader2, Check, X, Edit2, Mic, MicOff, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTransactionParser, ParsedTransaction } from '@/hooks/useTransactionParser';
import { useTransactions } from '@/hooks/useTransactions';
import { useVoiceInput } from '@/hooks/useVoiceInput';
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
  const { 
    isListening, 
    isSupported: isVoiceSupported, 
    transcript, 
    interimTranscript, 
    error: voiceError,
    startListening, 
    stopListening 
  } = useVoiceInput();

  const placeholder = EXAMPLE_INPUTS[Math.floor(Math.random() * EXAMPLE_INPUTS.length)];

  // Update input when voice transcript changes
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // Show voice errors as toasts
  useEffect(() => {
    if (voiceError) {
      toast({
        title: 'Voice Input',
        description: voiceError,
        variant: 'destructive',
      });
    }
  }, [voiceError]);

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

  const displayValue = isListening && interimTranscript ? interimTranscript : input;

  return (
    <div className="relative">
      {/* Highlighted header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">AI-Powered</span>
        </div>
        <span className="text-xs text-muted-foreground">Type or speak naturally</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Main input area with glow effect */}
        <div className={cn(
          "relative p-0.5 rounded-xl transition-all duration-300",
          "bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30",
          isListening && "from-primary/50 via-accent/50 to-primary/50 shadow-lg shadow-primary/20"
        )}>
          <div className="flex gap-2 bg-background rounded-[10px] p-2">
            {/* Voice button - prominent */}
            {isVoiceSupported && (
              <Button
                type="button"
                size="icon"
                variant={isListening ? "destructive" : "secondary"}
                onClick={isListening ? stopListening : startListening}
                disabled={isLoading}
                className={cn(
                  "h-10 w-10 shrink-0 transition-all",
                  isListening && "animate-pulse shadow-lg shadow-destructive/30",
                  !isListening && "hover:bg-primary hover:text-primary-foreground"
                )}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
            
            {/* Input field */}
            <div className="relative flex-1">
              <Input
                value={displayValue}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : `e.g. "${placeholder}"`}
                disabled={isLoading || isListening}
                className={cn(
                  "h-10 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0",
                  "placeholder:text-muted-foreground/60",
                  error && "text-destructive"
                )}
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            
            {/* Send button */}
            <Button 
              type="submit" 
              size="icon"
              disabled={!input.trim() || isLoading || isListening}
              className="h-10 w-10 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Helper text */}
        <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Mic className="h-3 w-3" />
            Tap mic to speak
          </span>
          <span className="text-border">•</span>
          <span>or type & send</span>
        </div>
        
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
      </form>
    </div>
  );
}
