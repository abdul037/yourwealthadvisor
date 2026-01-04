import { useState } from 'react';
import { Sparkles, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TransactionToCateg {
  id: string;
  description: string;
  amount: number;
  suggestedCategory?: string;
  confidence?: number;
  reasoning?: string;
}

interface AICategorizerProps {
  transactions: TransactionToCateg[];
  type: 'income' | 'expense';
  onCategorized: (results: { id: string; category: string }[]) => void;
}

export function AICategorizer({ transactions, type, onCategorized }: AICategorizerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<TransactionToCateg[]>([]);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const categorizeTransactions = async () => {
    if (transactions.length === 0) return;

    setIsProcessing(true);
    setProgress(10);

    try {
      // Process in batches of 10
      const batchSize = 10;
      const allResults: TransactionToCateg[] = [];

      for (let i = 0; i < transactions.length; i += batchSize) {
        const batch = transactions.slice(i, i + batchSize);
        
        const { data, error } = await supabase.functions.invoke('categorize-transaction', {
          body: {
            transactions: batch.map(t => ({
              description: t.description,
              amount: t.amount,
            })),
            type,
          },
        });

        if (error) throw error;

        const batchResults = batch.map((t, idx) => ({
          ...t,
          suggestedCategory: data.results[idx]?.suggestedCategory || 'Other',
          confidence: data.results[idx]?.confidence || 0.5,
          reasoning: data.results[idx]?.reasoning || '',
        }));

        allResults.push(...batchResults);
        setProgress(10 + ((i + batch.length) / transactions.length) * 80);
      }

      setResults(allResults);
      setProgress(100);

      toast({
        title: 'Categorization Complete',
        description: `${allResults.length} transactions categorized using AI`,
      });
    } catch (error: any) {
      console.error('Categorization error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to categorize transactions',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const acceptCategory = (id: string, category: string) => {
    setResults(prev => prev.filter(r => r.id !== id));
    onCategorized([{ id, category }]);
  };

  const acceptAll = () => {
    onCategorized(results.map(r => ({ id: r.id, category: r.suggestedCategory! })));
    setResults([]);
  };

  const rejectCategory = (id: string) => {
    setResults(prev => prev.filter(r => r.id !== id));
  };

  if (transactions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Auto-Categorization
        </CardTitle>
        {!isProcessing && results.length === 0 && (
          <Button onClick={categorizeTransactions} size="sm">
            <Sparkles className="w-4 h-4 mr-2" />
            Categorize {transactions.length} Transactions
          </Button>
        )}
        {results.length > 0 && (
          <Button onClick={acceptAll} size="sm" variant="outline">
            <Check className="w-4 h-4 mr-2" />
            Accept All
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isProcessing && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm">Analyzing transactions with AI...</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              Review AI suggestions and accept or reject each categorization
            </p>
            {results.map(result => (
              <div 
                key={result.id} 
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{result.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{result.suggestedCategory}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {Math.round((result.confidence || 0) * 100)}% confidence
                    </span>
                  </div>
                  {result.reasoning && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      {result.reasoning}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-wealth-positive hover:bg-wealth-positive/20"
                    onClick={() => acceptCategory(result.id, result.suggestedCategory!)}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-wealth-negative hover:bg-wealth-negative/20"
                    onClick={() => rejectCategory(result.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isProcessing && results.length === 0 && transactions.length > 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Click the button above to automatically categorize {transactions.length} uncategorized transactions using AI
          </p>
        )}
      </CardContent>
    </Card>
  );
}
