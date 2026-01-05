import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ParsedTransaction {
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  category: string;
  description: string;
}

interface UseTransactionParserReturn {
  parse: (text: string) => Promise<ParsedTransaction | null>;
  isLoading: boolean;
  error: string | null;
}

export function useTransactionParser(): UseTransactionParserReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parse = async (text: string): Promise<ParsedTransaction | null> => {
    if (!text.trim()) {
      setError('Please enter a transaction');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('parse-transaction', {
        body: { text: text.trim() }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.success || !data?.transaction) {
        throw new Error('Failed to parse transaction');
      }

      return data.transaction as ParsedTransaction;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to parse transaction';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { parse, isLoading, error };
}
