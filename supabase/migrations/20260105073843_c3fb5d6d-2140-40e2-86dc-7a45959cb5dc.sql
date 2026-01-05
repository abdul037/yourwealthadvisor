-- Add onboarding progress tracking to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_progress jsonb DEFAULT '{"income_added": false, "expense_added": false, "budget_created": false, "goal_created": false}'::jsonb;