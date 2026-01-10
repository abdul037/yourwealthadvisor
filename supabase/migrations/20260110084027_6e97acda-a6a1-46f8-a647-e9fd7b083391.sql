-- Add appreciation_rate column to assets table
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS appreciation_rate numeric;
COMMENT ON COLUMN public.assets.appreciation_rate IS 'Expected annual appreciation rate as a percentage';