-- Create expense groups (events like trips, lunches, outings)
CREATE TABLE public.expense_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  category text DEFAULT 'other',
  currency text NOT NULL DEFAULT 'AED',
  invite_code text UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  is_active boolean DEFAULT true,
  is_settled boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create expense group members
CREATE TABLE public.expense_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.expense_groups(id) ON DELETE CASCADE,
  user_id uuid, -- nullable for offline/named members
  name text NOT NULL,
  email text,
  is_creator boolean DEFAULT false,
  joined_at timestamp with time zone DEFAULT now()
);

-- Create group expenses (individual expenses within a group)
CREATE TABLE public.expense_group_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.expense_groups(id) ON DELETE CASCADE,
  paid_by_member_id uuid NOT NULL REFERENCES public.expense_group_members(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount numeric NOT NULL,
  split_type text NOT NULL DEFAULT 'equal', -- 'equal', 'percentage', 'custom'
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create expense splits (how each expense is divided)
CREATE TABLE public.expense_splits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id uuid NOT NULL REFERENCES public.expense_group_expenses(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.expense_group_members(id) ON DELETE CASCADE,
  amount numeric NOT NULL, -- actual amount owed
  percentage numeric, -- if split by percentage
  is_paid boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Create settlements (when someone pays back)
CREATE TABLE public.expense_settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.expense_groups(id) ON DELETE CASCADE,
  from_member_id uuid NOT NULL REFERENCES public.expense_group_members(id) ON DELETE CASCADE,
  to_member_id uuid NOT NULL REFERENCES public.expense_group_members(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  transaction_id uuid REFERENCES public.transactions(id), -- linked transaction
  settled_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.expense_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_group_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_settlements ENABLE ROW LEVEL SECURITY;

-- RLS policies for expense_groups
CREATE POLICY "Users can view own groups" ON public.expense_groups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view groups they're members of" ON public.expense_groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.expense_group_members 
      WHERE group_id = expense_groups.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own groups" ON public.expense_groups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own groups" ON public.expense_groups
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own groups" ON public.expense_groups
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for expense_group_members (allow group creators and members to manage)
CREATE POLICY "Members can view group members" ON public.expense_group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.expense_groups 
      WHERE id = expense_group_members.group_id 
      AND (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.expense_group_members m 
        WHERE m.group_id = expense_group_members.group_id AND m.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Group creators can insert members" ON public.expense_group_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.expense_groups 
      WHERE id = expense_group_members.group_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Group creators can update members" ON public.expense_group_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.expense_groups 
      WHERE id = expense_group_members.group_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Group creators can delete members" ON public.expense_group_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.expense_groups 
      WHERE id = expense_group_members.group_id AND user_id = auth.uid()
    )
  );

-- RLS policies for expenses
CREATE POLICY "Members can view group expenses" ON public.expense_group_expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.expense_groups g
      JOIN public.expense_group_members m ON m.group_id = g.id
      WHERE g.id = expense_group_expenses.group_id 
      AND (g.user_id = auth.uid() OR m.user_id = auth.uid())
    )
  );

CREATE POLICY "Members can insert group expenses" ON public.expense_group_expenses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.expense_groups g
      JOIN public.expense_group_members m ON m.group_id = g.id
      WHERE g.id = expense_group_expenses.group_id 
      AND (g.user_id = auth.uid() OR m.user_id = auth.uid())
    )
  );

CREATE POLICY "Group creators can update expenses" ON public.expense_group_expenses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.expense_groups 
      WHERE id = expense_group_expenses.group_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Group creators can delete expenses" ON public.expense_group_expenses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.expense_groups 
      WHERE id = expense_group_expenses.group_id AND user_id = auth.uid()
    )
  );

-- RLS policies for expense_splits
CREATE POLICY "Members can view splits" ON public.expense_splits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.expense_group_expenses e
      JOIN public.expense_groups g ON g.id = e.group_id
      JOIN public.expense_group_members m ON m.group_id = g.id
      WHERE e.id = expense_splits.expense_id 
      AND (g.user_id = auth.uid() OR m.user_id = auth.uid())
    )
  );

CREATE POLICY "Members can insert splits" ON public.expense_splits
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.expense_group_expenses e
      JOIN public.expense_groups g ON g.id = e.group_id
      JOIN public.expense_group_members m ON m.group_id = g.id
      WHERE e.id = expense_splits.expense_id 
      AND (g.user_id = auth.uid() OR m.user_id = auth.uid())
    )
  );

CREATE POLICY "Group creators can update splits" ON public.expense_splits
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.expense_group_expenses e
      JOIN public.expense_groups g ON g.id = e.group_id
      WHERE e.id = expense_splits.expense_id AND g.user_id = auth.uid()
    )
  );

CREATE POLICY "Group creators can delete splits" ON public.expense_splits
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.expense_group_expenses e
      JOIN public.expense_groups g ON g.id = e.group_id
      WHERE e.id = expense_splits.expense_id AND g.user_id = auth.uid()
    )
  );

-- RLS policies for settlements
CREATE POLICY "Members can view settlements" ON public.expense_settlements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.expense_groups g
      JOIN public.expense_group_members m ON m.group_id = g.id
      WHERE g.id = expense_settlements.group_id 
      AND (g.user_id = auth.uid() OR m.user_id = auth.uid())
    )
  );

CREATE POLICY "Members can insert settlements" ON public.expense_settlements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.expense_groups g
      JOIN public.expense_group_members m ON m.group_id = g.id
      WHERE g.id = expense_settlements.group_id 
      AND (g.user_id = auth.uid() OR m.user_id = auth.uid())
    )
  );

-- Add updated_at triggers
CREATE TRIGGER update_expense_groups_updated_at
  BEFORE UPDATE ON public.expense_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expense_group_expenses_updated_at
  BEFORE UPDATE ON public.expense_group_expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();