-- Create profiles table linked to auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

-- Trigger to create profile on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add user_id to partners table
ALTER TABLE public.partners ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to income_sources table  
ALTER TABLE public.income_sources ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to category_liquidity_settings table
ALTER TABLE public.category_liquidity_settings ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing public access policies on partners
DROP POLICY IF EXISTS "Allow public delete access to partners" ON public.partners;
DROP POLICY IF EXISTS "Allow public insert access to partners" ON public.partners;
DROP POLICY IF EXISTS "Allow public read access to partners" ON public.partners;
DROP POLICY IF EXISTS "Allow public update access to partners" ON public.partners;

-- Create user-based RLS policies for partners
CREATE POLICY "Users can view own partners" ON public.partners
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own partners" ON public.partners
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own partners" ON public.partners
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own partners" ON public.partners
  FOR DELETE USING (auth.uid() = user_id);

-- Drop existing public access policies on income_sources
DROP POLICY IF EXISTS "Allow public delete access to income_sources" ON public.income_sources;
DROP POLICY IF EXISTS "Allow public insert access to income_sources" ON public.income_sources;
DROP POLICY IF EXISTS "Allow public read access to income_sources" ON public.income_sources;
DROP POLICY IF EXISTS "Allow public update access to income_sources" ON public.income_sources;

-- Create user-based RLS policies for income_sources
CREATE POLICY "Users can view own income_sources" ON public.income_sources
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own income_sources" ON public.income_sources
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own income_sources" ON public.income_sources
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own income_sources" ON public.income_sources
  FOR DELETE USING (auth.uid() = user_id);

-- Drop existing public access policies on category_liquidity_settings
DROP POLICY IF EXISTS "Allow public delete access to category_liquidity_settings" ON public.category_liquidity_settings;
DROP POLICY IF EXISTS "Allow public insert access to category_liquidity_settings" ON public.category_liquidity_settings;
DROP POLICY IF EXISTS "Allow public read access to category_liquidity_settings" ON public.category_liquidity_settings;
DROP POLICY IF EXISTS "Allow public update access to category_liquidity_settings" ON public.category_liquidity_settings;

-- Create user-based RLS policies for category_liquidity_settings
CREATE POLICY "Users can view own category_liquidity_settings" ON public.category_liquidity_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own category_liquidity_settings" ON public.category_liquidity_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own category_liquidity_settings" ON public.category_liquidity_settings
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own category_liquidity_settings" ON public.category_liquidity_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updating updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();