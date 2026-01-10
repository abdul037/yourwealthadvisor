import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ParsedAsset {
  name: string;
  category: string;
  amount: number;
  currency: string;
  liquidity_level: string;
  appreciation_rate?: number;
}

export function useAssetParser() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedAsset, setParsedAsset] = useState<ParsedAsset | null>(null);

  const parseAsset = async (text: string): Promise<ParsedAsset | null> => {
    if (!text.trim()) {
      setError('Please enter an asset description');
      return null;
    }

    setIsLoading(true);
    setError(null);
    setParsedAsset(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('parse-asset', {
        body: { text: text.trim() },
      });

      if (functionError) {
        throw new Error(functionError.message || 'Failed to parse asset');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.asset) {
        throw new Error('No asset data returned');
      }

      setParsedAsset(data.asset);
      return data.asset;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to parse asset';
      setError(message);
      toast({
        title: 'Parsing Error',
        description: message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setParsedAsset(null);
    setError(null);
  };

  return {
    parseAsset,
    parsedAsset,
    isLoading,
    error,
    reset,
  };
}
