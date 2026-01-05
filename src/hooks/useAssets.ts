import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from './useUserProfile';
import { toast } from '@/hooks/use-toast';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Asset = Tables<'assets'>;
export type AssetInsert = TablesInsert<'assets'>;
export type AssetUpdate = TablesUpdate<'assets'>;

export function useAssets() {
  const { user } = useUserProfile();
  const queryClient = useQueryClient();

  const { data: assets = [], isLoading, error, refetch } = useQuery({
    queryKey: ['assets', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('is_active', true)
        .order('amount', { ascending: false });
      
      if (error) throw error;
      return data as Asset[];
    },
    enabled: !!user?.id,
  });

  const addAsset = useMutation({
    mutationFn: async (asset: Omit<AssetInsert, 'user_id'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('assets')
        .insert({ ...asset, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast({ title: 'Asset added', description: 'Your asset has been added successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateAsset = useMutation({
    mutationFn: async ({ id, ...updates }: AssetUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('assets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast({ title: 'Asset updated', description: 'Your asset has been updated.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteAsset = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast({ title: 'Asset deleted', description: 'Your asset has been removed.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Calculate totals by category
  const totalNetWorth = assets.reduce((sum, asset) => sum + (asset.amount || 0), 0);
  
  const assetsByCategory = assets.reduce((acc, asset) => {
    const category = asset.category || 'Other';
    if (!acc[category]) acc[category] = 0;
    acc[category] += asset.amount || 0;
    return acc;
  }, {} as Record<string, number>);

  const assetsByLiquidity = assets.reduce((acc, asset) => {
    const level = asset.liquidity_level || 'L2';
    if (!acc[level]) acc[level] = 0;
    acc[level] += asset.amount || 0;
    return acc;
  }, {} as Record<string, number>);

  return {
    assets,
    isLoading,
    error,
    refetch,
    addAsset,
    updateAsset,
    deleteAsset,
    totalNetWorth,
    assetsByCategory,
    assetsByLiquidity,
  };
}
