-- Drop the overly permissive policy that allows any user to see all groups
DROP POLICY IF EXISTS "Public can view groups by invite code" ON public.expense_groups;

-- Create a secure function to get group by invite code
-- This uses SECURITY DEFINER to bypass RLS and only returns the specific group
CREATE OR REPLACE FUNCTION public.get_group_by_invite_code(p_invite_code TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  currency TEXT,
  category TEXT,
  invite_code TEXT,
  is_active BOOLEAN,
  is_settled BOOLEAN,
  user_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name, description, currency, category, invite_code, is_active, is_settled, user_id, created_at, updated_at
  FROM expense_groups 
  WHERE invite_code = p_invite_code;
$$;