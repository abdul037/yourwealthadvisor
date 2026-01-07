-- Add expense_date column (user-selectable date for when expense occurred)
ALTER TABLE public.expense_group_expenses 
ADD COLUMN IF NOT EXISTS expense_date date DEFAULT CURRENT_DATE;

-- Add notes column to expenses
ALTER TABLE public.expense_group_expenses 
ADD COLUMN IF NOT EXISTS notes text;

-- Allow group creators to delete settlements for corrections
CREATE POLICY "Group creators can delete settlements" 
ON public.expense_settlements FOR DELETE 
USING (EXISTS (
    SELECT 1 FROM public.expense_groups 
    WHERE expense_groups.id = expense_settlements.group_id 
    AND expense_groups.user_id = auth.uid()
));

-- Allow group creators to update settlements (for voiding if needed)
CREATE POLICY "Group creators can update settlements" 
ON public.expense_settlements FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM public.expense_groups 
    WHERE expense_groups.id = expense_settlements.group_id 
    AND expense_groups.user_id = auth.uid()
));