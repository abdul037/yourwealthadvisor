-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  granted_by UUID,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create app_modules table for feature configuration
CREATE TABLE public.app_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Box',
  route TEXT,
  is_live BOOLEAN DEFAULT false,
  required_tier TEXT DEFAULT 'free',
  display_order INTEGER DEFAULT 0,
  category TEXT DEFAULT 'core',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_modules ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for app_modules
CREATE POLICY "Anyone can read modules" ON public.app_modules
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert modules" ON public.app_modules
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update modules" ON public.app_modules
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete modules" ON public.app_modules
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Seed app_modules with current features
INSERT INTO public.app_modules (name, display_name, description, route, is_live, required_tier, category, display_order, icon) VALUES
  ('dashboard', 'Dashboard', 'Main financial overview', '/', true, 'free', 'core', 1, 'LayoutDashboard'),
  ('income', 'Income Tracking', 'Track all income sources', '/income', true, 'free', 'core', 2, 'DollarSign'),
  ('expenses', 'Expense Tracking', 'Track and categorize expenses', '/expenses', true, 'free', 'core', 3, 'Receipt'),
  ('budget', 'Budget Planner', 'Create and manage budgets', '/budget', true, 'free', 'core', 4, 'Wallet'),
  ('debt', 'Debt Tracker', 'Track and plan debt payoff', '/debt', true, 'free', 'core', 5, 'TrendingDown'),
  ('savings', 'Savings Goals', 'Set and track savings goals', '/savings', true, 'free', 'core', 6, 'Target'),
  ('trends', 'Trends & Analytics', 'Visualize financial trends', '/trends', true, 'plus', 'analytics', 7, 'LineChart'),
  ('social', 'Social Features', 'Circles, friends, challenges', '/social', true, 'plus', 'social', 8, 'Users'),
  ('split', 'Split Expenses', 'Split bills with friends', '/split', true, 'free', 'social', 9, 'Split'),
  ('partners', 'Affiliate Partners', 'Financial partner offers', '/partners', true, 'free', 'monetization', 10, 'Handshake'),
  ('ai_tools', 'AI Tools', 'AI-powered financial insights', '/ai-tools', true, 'premium', 'ai', 11, 'Sparkles'),
  ('membership', 'Membership', 'Subscription management', '/membership', true, 'free', 'settings', 12, 'Crown'),
  ('admin', 'Admin Portal', 'Administrative settings', '/admin', true, 'free', 'settings', 13, 'Shield'),
  ('data_export', 'Data Export', 'Export financial data', '/admin', false, 'plus', 'settings', 14, 'Download'),
  ('priority_support', 'Priority Support', 'Fast support response', null, false, 'premium', 'support', 15, 'Headphones');

-- Create updated_at trigger for app_modules
CREATE TRIGGER update_app_modules_updated_at
  BEFORE UPDATE ON public.app_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();