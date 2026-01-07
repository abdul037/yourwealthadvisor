-- Allow anyone to view groups by invite code (for join page)
CREATE POLICY "Public can view groups by invite code" ON public.expense_groups
FOR SELECT USING (invite_code IS NOT NULL);

-- Create expense_payers table for multi-payer support
CREATE TABLE public.expense_payers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id uuid NOT NULL REFERENCES public.expense_group_expenses(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.expense_group_members(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(expense_id, member_id)
);

-- Enable RLS
ALTER TABLE public.expense_payers ENABLE ROW LEVEL SECURITY;

-- RLS policies for expense_payers (same as expense_group_expenses)
CREATE POLICY "Members can view payers" ON public.expense_payers
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM expense_group_expenses e
    JOIN expense_groups g ON g.id = e.group_id
    JOIN expense_group_members m ON m.group_id = g.id
    WHERE e.id = expense_payers.expense_id
    AND (g.user_id = auth.uid() OR m.user_id = auth.uid())
  )
);

CREATE POLICY "Members can insert payers" ON public.expense_payers
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM expense_group_expenses e
    JOIN expense_groups g ON g.id = e.group_id
    JOIN expense_group_members m ON m.group_id = g.id
    WHERE e.id = expense_payers.expense_id
    AND (g.user_id = auth.uid() OR m.user_id = auth.uid())
  )
);

CREATE POLICY "Group creators can update payers" ON public.expense_payers
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM expense_group_expenses e
    JOIN expense_groups g ON g.id = e.group_id
    WHERE e.id = expense_payers.expense_id
    AND g.user_id = auth.uid()
  )
);

CREATE POLICY "Group creators can delete payers" ON public.expense_payers
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM expense_group_expenses e
    JOIN expense_groups g ON g.id = e.group_id
    WHERE e.id = expense_payers.expense_id
    AND g.user_id = auth.uid()
  )
);