import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from './useUserProfile';

export type AppRole = 'admin' | 'moderator' | 'user';

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  granted_by: string | null;
  granted_at: string;
}

export function useUserRole() {
  const { user } = useUserProfile();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setRoles([]);
      setLoading(false);
      return;
    }

    fetchRoles();
  }, [user?.id]);

  const fetchRoles = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setRoles((data as UserRole[]) || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: AppRole): boolean => {
    return roles.some(r => r.role === role);
  };

  const isAdmin = hasRole('admin');
  const isModerator = hasRole('moderator') || isAdmin;

  return {
    roles,
    loading,
    hasRole,
    isAdmin,
    isModerator,
    refetch: fetchRoles,
  };
}
