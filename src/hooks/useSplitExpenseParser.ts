import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ParsedSplitExpense {
  description: string;
  amount: number;
  paid_by: string | null;
  split_type: 'equal' | 'percentage' | 'custom';
  notes: string | null;
}

interface UseSplitExpenseParserReturn {
  parse: (text: string) => Promise<ParsedSplitExpense | null>;
  isLoading: boolean;
  error: string | null;
  result: ParsedSplitExpense | null;
  reset: () => void;
}

export function useSplitExpenseParser(
  memberNames: string[],
  currency: string,
  currentUserName?: string
): UseSplitExpenseParserReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ParsedSplitExpense | null>(null);

  const parse = useCallback(async (text: string): Promise<ParsedSplitExpense | null> => {
    if (!text.trim()) {
      setError('Please enter an expense description');
      return null;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('parse-split-expense', {
        body: { text, memberNames, currency, currentUserName }
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.success && data?.data) {
        const parsed = data.data as ParsedSplitExpense;
        setResult(parsed);
        return parsed;
      }

      throw new Error('Failed to parse expense');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to parse expense';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [memberNames, currency, currentUserName]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    parse,
    isLoading,
    error,
    result,
    reset
  };
}
