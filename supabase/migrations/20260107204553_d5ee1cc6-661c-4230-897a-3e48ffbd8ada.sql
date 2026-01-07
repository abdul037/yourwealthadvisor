-- Drop problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Members can view group members" ON public.expense_group_members;

-- Create a security definer function to check group membership
CREATE OR REPLACE FUNCTION public.is_expense_group_member(p_group_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.expense_group_members
    WHERE group_id = p_group_id
      AND user_id = p_user_id
  )
$$;

-- Create a security definer function to check if user is group creator
CREATE OR REPLACE FUNCTION public.is_expense_group_creator(p_group_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.expense_groups
    WHERE id = p_group_id
      AND user_id = p_user_id
  )
$$;

-- Create new policy for viewing group members (non-recursive)
CREATE POLICY "Members can view group members" 
ON public.expense_group_members 
FOR SELECT 
USING (
  public.is_expense_group_creator(group_id, auth.uid()) 
  OR public.is_expense_group_member(group_id, auth.uid())
);

-- Also fix the INSERT policy for members to allow joining via invite link
DROP POLICY IF EXISTS "Group creators can insert members" ON public.expense_group_members;

CREATE POLICY "Creators and self can insert members" 
ON public.expense_group_members 
FOR INSERT 
WITH CHECK (
  public.is_expense_group_creator(group_id, auth.uid()) 
  OR (user_id = auth.uid())
);