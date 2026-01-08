import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from './useSubscription';

export interface AppModule {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  icon: string | null;
  route: string | null;
  is_live: boolean;
  required_tier: string;
  display_order: number;
  category: string;
  created_at: string;
  updated_at: string;
}

interface ModuleAccess extends AppModule {
  hasAccess: boolean;
  accessReason: 'tier' | 'not_live' | 'accessible';
}

const TIER_HIERARCHY: Record<string, number> = {
  'free': 0,
  'plus': 1,
  'premium': 2,
};

export function useAppModules() {
  const [modules, setModules] = useState<AppModule[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentTier } = useSubscription();

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_modules')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setModules((data as AppModule[]) || []);
    } catch (error) {
      console.error('Error fetching app modules:', error);
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  const getUserTierLevel = (): number => {
    const tierName = currentTier?.name?.toLowerCase() || 'free';
    return TIER_HIERARCHY[tierName] ?? 0;
  };

  const canAccessModule = (moduleName: string): boolean => {
    const module = modules.find(m => m.name === moduleName);
    if (!module) return true; // If module not found, allow access
    if (!module.is_live) return false;
    
    const userTierLevel = getUserTierLevel();
    const requiredTierLevel = TIER_HIERARCHY[module.required_tier] ?? 0;
    
    return userTierLevel >= requiredTierLevel;
  };

  const isModuleLive = (moduleName: string): boolean => {
    const module = modules.find(m => m.name === moduleName);
    return module?.is_live ?? false;
  };

  const getModulesWithAccess = (): ModuleAccess[] => {
    const userTierLevel = getUserTierLevel();
    
    return modules.map(module => {
      const requiredTierLevel = TIER_HIERARCHY[module.required_tier] ?? 0;
      let hasAccess = true;
      let accessReason: 'tier' | 'not_live' | 'accessible' = 'accessible';

      if (!module.is_live) {
        hasAccess = false;
        accessReason = 'not_live';
      } else if (userTierLevel < requiredTierLevel) {
        hasAccess = false;
        accessReason = 'tier';
      }

      return { ...module, hasAccess, accessReason };
    });
  };

  const updateModule = async (moduleId: string, updates: Partial<AppModule>) => {
    try {
      const { error } = await supabase
        .from('app_modules')
        .update(updates)
        .eq('id', moduleId);

      if (error) throw error;
      await fetchModules();
      return { success: true };
    } catch (error) {
      console.error('Error updating module:', error);
      return { success: false, error };
    }
  };

  const getModulesByCategory = () => {
    const categories: Record<string, AppModule[]> = {};
    modules.forEach(module => {
      if (!categories[module.category]) {
        categories[module.category] = [];
      }
      categories[module.category].push(module);
    });
    return categories;
  };

  return {
    modules,
    loading,
    canAccessModule,
    isModuleLive,
    getModulesWithAccess,
    updateModule,
    getModulesByCategory,
    refetch: fetchModules,
  };
}
