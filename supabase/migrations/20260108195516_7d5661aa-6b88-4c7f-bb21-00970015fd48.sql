-- Create subscription_tiers table
CREATE TABLE public.subscription_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  price_monthly NUMERIC NOT NULL DEFAULT 0,
  price_yearly NUMERIC NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  max_circles INTEGER NOT NULL DEFAULT 1,
  max_challenges INTEGER NOT NULL DEFAULT 1,
  ai_insights BOOLEAN NOT NULL DEFAULT false,
  ad_free BOOLEAN NOT NULL DEFAULT false,
  priority_support BOOLEAN NOT NULL DEFAULT false,
  badge_style TEXT DEFAULT 'default',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tier_id UUID NOT NULL REFERENCES public.subscription_tiers(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trialing', 'pending')),
  payment_provider TEXT NOT NULL DEFAULT 'mock',
  external_subscription_id TEXT,
  external_customer_id TEXT,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_tiers (public read)
CREATE POLICY "Anyone can view active subscription tiers"
ON public.subscription_tiers
FOR SELECT
USING (is_active = true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view own subscription"
ON public.user_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
ON public.user_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
ON public.user_subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

-- Seed subscription tiers
INSERT INTO public.subscription_tiers (name, display_name, description, price_monthly, price_yearly, features, max_circles, max_challenges, ai_insights, ad_free, priority_support, badge_style, display_order) VALUES
('free', 'Free', 'Get started with basic features', 0, 0, '["Track income & expenses", "1 savings goal", "Basic budgeting", "Community access"]'::jsonb, 1, 1, false, false, false, 'default', 0),
('plus', 'Tharwa Plus', 'Enhanced features for growing wealth', 4.99, 49.99, '["Everything in Free", "5 circles membership", "5 challenges per month", "Ad-free experience", "Custom themes", "Priority notifications"]'::jsonb, 5, 5, false, true, false, 'plus', 1),
('premium', 'Tharwa Premium', 'Full power for serious wealth builders', 9.99, 99.99, '["Everything in Plus", "Unlimited circles", "Unlimited challenges", "AI-powered insights", "Priority support", "Premium badge", "Advanced analytics", "Export data"]'::jsonb, -1, -1, true, true, true, 'premium', 2),
('family', 'Tharwa Family', 'Share wealth building with loved ones', 14.99, 149.99, '["Everything in Premium", "Up to 5 family members", "Shared savings goals", "Family challenges", "Family leaderboard", "Family badge"]'::jsonb, -1, -1, true, true, true, 'family', 3);

-- Create trigger for updated_at
CREATE TRIGGER update_subscription_tiers_updated_at
BEFORE UPDATE ON public.subscription_tiers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();