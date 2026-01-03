-- Create category liquidity settings table
CREATE TABLE public.category_liquidity_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name TEXT NOT NULL,
  category_type TEXT NOT NULL CHECK (category_type IN ('income', 'expense', 'asset')),
  liquidity_level public.liquidity_level DEFAULT 'L2',
  liquidity_percentage DECIMAL(5, 2) DEFAULT 100.00 CHECK (liquidity_percentage >= 0 AND liquidity_percentage <= 100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(category_name, category_type)
);

-- Enable RLS
ALTER TABLE public.category_liquidity_settings ENABLE ROW LEVEL SECURITY;

-- Public access policies
CREATE POLICY "Allow public read access to category_liquidity_settings"
ON public.category_liquidity_settings FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to category_liquidity_settings"
ON public.category_liquidity_settings FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to category_liquidity_settings"
ON public.category_liquidity_settings FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to category_liquidity_settings"
ON public.category_liquidity_settings FOR DELETE USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_category_liquidity_settings_updated_at
BEFORE UPDATE ON public.category_liquidity_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default liquidity settings for income categories
INSERT INTO public.category_liquidity_settings (category_name, category_type, liquidity_level, liquidity_percentage) VALUES
  ('Salary', 'income', 'L1', 100.00),
  ('Bonus', 'income', 'L1', 100.00),
  ('Freelance', 'income', 'L2', 85.00),
  ('Investment', 'income', 'L2', 70.00),
  ('Rental', 'income', 'L3', 60.00),
  ('Dividend', 'income', 'L2', 80.00),
  ('Side Business', 'income', 'L2', 75.00),
  ('Other', 'income', 'L2', 80.00);

-- Insert default liquidity settings for asset categories
INSERT INTO public.category_liquidity_settings (category_name, category_type, liquidity_level, liquidity_percentage) VALUES
  ('Cash', 'asset', 'L1', 100.00),
  ('Stocks', 'asset', 'L1', 95.00),
  ('Bonds', 'asset', 'L2', 85.00),
  ('Gold', 'asset', 'L2', 90.00),
  ('DigiGold', 'asset', 'L1', 95.00),
  ('Crypto', 'asset', 'L1', 90.00),
  ('Land Asset', 'asset', 'NL', 20.00),
  ('Real Estate', 'asset', 'NL', 15.00),
  ('Insurance', 'asset', 'L3', 40.00),
  ('Provident Fund', 'asset', 'NL', 10.00);