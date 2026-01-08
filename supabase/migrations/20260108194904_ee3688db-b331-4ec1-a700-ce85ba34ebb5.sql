-- Affiliate partners table
CREATE TABLE public.affiliate_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL, -- investment, banking, crypto, insurance, education
  description TEXT,
  logo_url TEXT,
  referral_url TEXT NOT NULL,
  commission_type TEXT DEFAULT 'cpa', -- cpa, rev_share, hybrid
  commission_value NUMERIC DEFAULT 0,
  bonus_description TEXT,
  bonus_coins INTEGER DEFAULT 0,
  min_deposit NUMERIC,
  features JSONB DEFAULT '[]',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Referral clicks tracking
CREATE TABLE public.referral_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  partner_id UUID REFERENCES public.affiliate_partners(id) NOT NULL,
  tracking_code TEXT NOT NULL UNIQUE,
  source TEXT, -- dashboard, social, ai-tools, partners-page
  ip_address TEXT,
  user_agent TEXT,
  clicked_at TIMESTAMPTZ DEFAULT now()
);

-- Referral conversions
CREATE TABLE public.referral_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  click_id UUID REFERENCES public.referral_clicks(id),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  partner_id UUID REFERENCES public.affiliate_partners(id) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, paid
  commission_earned NUMERIC DEFAULT 0,
  coins_rewarded INTEGER DEFAULT 0,
  converted_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ
);

-- User referral rewards
CREATE TABLE public.user_referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  partner_id UUID REFERENCES public.affiliate_partners(id) NOT NULL,
  reward_type TEXT DEFAULT 'coins', -- coins, badge, cashback
  reward_value INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, credited
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.affiliate_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_referral_rewards ENABLE ROW LEVEL SECURITY;

-- Affiliate partners - public read for active partners
CREATE POLICY "Anyone can view active affiliate partners"
ON public.affiliate_partners FOR SELECT
USING (is_active = true);

-- Referral clicks policies
CREATE POLICY "Users can view own clicks"
ON public.referral_clicks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clicks"
ON public.referral_clicks FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Referral conversions policies
CREATE POLICY "Users can view own conversions"
ON public.referral_conversions FOR SELECT
USING (auth.uid() = user_id);

-- User referral rewards policies
CREATE POLICY "Users can view own rewards"
ON public.user_referral_rewards FOR SELECT
USING (auth.uid() = user_id);

-- Seed initial affiliate partners
INSERT INTO public.affiliate_partners (name, slug, category, description, referral_url, bonus_description, bonus_coins, min_deposit, features, is_featured, display_order) VALUES
('Sarwa', 'sarwa', 'investment', 'UAE''s leading robo-advisor for automated investing. Build wealth with diversified portfolios managed by experts.', 'https://sarwa.co/invite', 'Get 50 Tharwa Coins when you fund your account', 50, 500, '["Automated investing", "Low fees (0.85%)", "Halal portfolios available", "No minimum balance"]', true, 1),
('Interactive Brokers', 'ibkr', 'investment', 'Professional-grade trading platform with access to 150+ markets worldwide.', 'https://ibkr.com/referral', 'Earn 100 Tharwa Coins on first trade', 100, 0, '["Global market access", "Lowest commissions", "Advanced trading tools", "Fractional shares"]', true, 2),
('Stake', 'stake', 'investment', 'Trade US stocks commission-free. Perfect for beginners and experienced investors.', 'https://stake.com/refer', 'Get 75 Tharwa Coins + free stock', 75, 0, '["Commission-free US stocks", "Fractional shares", "Easy mobile app", "Free stock on signup"]', true, 3),
('Binance', 'binance', 'crypto', 'World''s largest cryptocurrency exchange with lowest trading fees.', 'https://binance.com/refer', 'Earn 50 Tharwa Coins on verification', 50, 0, '["500+ cryptocurrencies", "Lowest fees (0.1%)", "Staking rewards", "Advanced trading"]', true, 4),
('Bybit', 'bybit', 'crypto', 'Leading crypto derivatives platform with up to 100x leverage.', 'https://bybit.com/refer', 'Get 50 Tharwa Coins + trading bonus', 50, 0, '["Derivatives trading", "Copy trading", "High liquidity", "Mobile app"]', false, 5),
('Emirates NBD', 'enbd', 'banking', 'Premium banking with exclusive wealth management services.', 'https://emiratesnbd.com/refer', 'Earn 100 Tharwa Coins with new account', 100, 3000, '["Priority banking", "Wealth management", "Premium credit cards", "Global transfers"]', true, 6),
('Mashreq Neo', 'mashreq-neo', 'banking', 'Digital-first banking with instant account opening and zero fees.', 'https://mashreqneo.com/refer', 'Get 50 Tharwa Coins instantly', 50, 0, '["Zero fees", "Instant opening", "Virtual cards", "Cashback rewards"]', false, 7),
('Beehive', 'beehive', 'investment', 'UAE''s first peer-to-peer lending platform. Earn up to 12% returns.', 'https://beehive.ae/refer', 'Earn 75 Tharwa Coins on first investment', 75, 1000, '["P2P lending", "Up to 12% returns", "Auto-invest", "Sharia compliant"]', false, 8),
('YAP', 'yap', 'banking', 'Modern banking app with spending insights and savings goals.', 'https://yap.com/refer', 'Get 50 Tharwa Coins on signup', 50, 0, '["Free account", "Spending insights", "Savings pots", "International transfers"]', false, 9),
('Udemy', 'udemy', 'education', 'Learn investing and personal finance from world-class instructors.', 'https://udemy.com/refer', 'Earn 25 Tharwa Coins per course', 25, 0, '["Financial courses", "Lifetime access", "Mobile learning", "Certificates"]', false, 10);

-- Create updated_at trigger
CREATE TRIGGER update_affiliate_partners_updated_at
BEFORE UPDATE ON public.affiliate_partners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();