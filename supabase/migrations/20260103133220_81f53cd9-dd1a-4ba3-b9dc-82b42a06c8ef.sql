-- Create enum for liquidity levels
CREATE TYPE public.liquidity_level AS ENUM ('L1', 'L2', 'L3', 'NL');

-- Create partners/bearers table
CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create income sources table linked to partners
CREATE TABLE public.income_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE NOT NULL,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT DEFAULT 'AED',
  frequency TEXT DEFAULT 'monthly',
  liquidity_level liquidity_level DEFAULT 'L1',
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_sources ENABLE ROW LEVEL SECURITY;

-- Create public access policies for demo mode (no auth required)
CREATE POLICY "Allow public read access to partners"
ON public.partners FOR SELECT
USING (true);

CREATE POLICY "Allow public insert access to partners"
ON public.partners FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update access to partners"
ON public.partners FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete access to partners"
ON public.partners FOR DELETE
USING (true);

CREATE POLICY "Allow public read access to income_sources"
ON public.income_sources FOR SELECT
USING (true);

CREATE POLICY "Allow public insert access to income_sources"
ON public.income_sources FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update access to income_sources"
ON public.income_sources FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete access to income_sources"
ON public.income_sources FOR DELETE
USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_partners_updated_at
BEFORE UPDATE ON public.partners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_income_sources_updated_at
BEFORE UPDATE ON public.income_sources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert demo data for partners
INSERT INTO public.partners (name, role, email, is_active) VALUES
  ('Ahmed Al Maktoum', 'Tech Lead', 'ahmed@example.com', true),
  ('Sara Al Maktoum', 'Marketing Manager', 'sara@example.com', true);

-- Insert demo income sources
INSERT INTO public.income_sources (partner_id, source_name, source_type, amount, currency, frequency, liquidity_level) 
SELECT 
  p.id,
  'Tech Lead Salary',
  'Salary',
  32000,
  'AED',
  'monthly',
  'L1'
FROM public.partners p WHERE p.name = 'Ahmed Al Maktoum';

INSERT INTO public.income_sources (partner_id, source_name, source_type, amount, currency, frequency, liquidity_level) 
SELECT 
  p.id,
  'Marketing Manager Salary',
  'Salary',
  23000,
  'AED',
  'monthly',
  'L1'
FROM public.partners p WHERE p.name = 'Sara Al Maktoum';

INSERT INTO public.income_sources (partner_id, source_name, source_type, amount, currency, frequency, liquidity_level) 
SELECT 
  p.id,
  'Freelance Consulting',
  'Freelance',
  5000,
  'AED',
  'monthly',
  'L2'
FROM public.partners p WHERE p.name = 'Ahmed Al Maktoum';

INSERT INTO public.income_sources (partner_id, source_name, source_type, amount, currency, frequency, liquidity_level) 
SELECT 
  p.id,
  'Rental Income - Marina',
  'Rental',
  8500,
  'AED',
  'monthly',
  'L3'
FROM public.partners p WHERE p.name = 'Sara Al Maktoum';