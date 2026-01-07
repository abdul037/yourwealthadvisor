-- Add settlement_date column for user-selected date
ALTER TABLE public.expense_settlements 
ADD COLUMN IF NOT EXISTS settlement_date date DEFAULT CURRENT_DATE;