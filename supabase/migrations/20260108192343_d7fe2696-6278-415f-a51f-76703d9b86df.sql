-- =============================================
-- THARWA SOCIAL: PHASE 1 & 2 DATABASE SCHEMA
-- =============================================

-- User Connections (Friend/Follow system)
CREATE TABLE public.user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL,
  addressee_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, blocked
  connection_type TEXT DEFAULT 'friend', -- friend, accountability_partner
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

-- Enable RLS
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_connections
CREATE POLICY "Users can view their own connections"
ON public.user_connections FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can create connection requests"
ON public.user_connections FOR INSERT
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their own connections"
ON public.user_connections FOR UPDATE
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can delete their own connections"
ON public.user_connections FOR DELETE
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Friend sharing preferences
CREATE TABLE public.connection_sharing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  share_savings_rate BOOLEAN DEFAULT false,
  share_net_worth_percentile BOOLEAN DEFAULT false,
  share_achievements BOOLEAN DEFAULT true,
  share_streaks BOOLEAN DEFAULT true,
  share_challenges BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.connection_sharing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sharing settings"
ON public.connection_sharing FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sharing settings"
ON public.connection_sharing FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sharing settings"
ON public.connection_sharing FOR UPDATE
USING (auth.uid() = user_id);

-- Financial Circles (topic-based communities)
CREATE TABLE public.circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- investing, saving, debt-free, crypto, real-estate, budgeting, income
  icon TEXT DEFAULT '💰',
  cover_color TEXT DEFAULT 'emerald', -- for gradient backgrounds
  is_private BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  member_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public circles"
ON public.circles FOR SELECT
USING (is_private = false OR created_by = auth.uid());

CREATE POLICY "Authenticated users can create circles"
ON public.circles FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their circles"
ON public.circles FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete their circles"
ON public.circles FOR DELETE
USING (auth.uid() = created_by);

-- Circle Memberships
CREATE TABLE public.circle_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID REFERENCES public.circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member', -- member, moderator, admin
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(circle_id, user_id)
);

ALTER TABLE public.circle_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view circle memberships"
ON public.circle_memberships FOR SELECT
USING (true);

CREATE POLICY "Users can join circles"
ON public.circle_memberships FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave circles"
ON public.circle_memberships FOR DELETE
USING (auth.uid() = user_id);

-- Circle Posts
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID REFERENCES public.circles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  post_type TEXT DEFAULT 'discussion', -- discussion, tip, question, win, milestone
  title TEXT,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  upvote_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view posts in public circles"
ON public.posts FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.circles c 
  WHERE c.id = circle_id AND (c.is_private = false OR c.created_by = auth.uid())
) OR EXISTS (
  SELECT 1 FROM public.circle_memberships cm 
  WHERE cm.circle_id = posts.circle_id AND cm.user_id = auth.uid()
));

CREATE POLICY "Members can create posts"
ON public.posts FOR INSERT
WITH CHECK (auth.uid() = author_id AND EXISTS (
  SELECT 1 FROM public.circle_memberships cm 
  WHERE cm.circle_id = posts.circle_id AND cm.user_id = auth.uid()
));

CREATE POLICY "Authors can update their posts"
ON public.posts FOR UPDATE
USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their posts"
ON public.posts FOR DELETE
USING (auth.uid() = author_id);

-- Comments
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  upvote_count INTEGER DEFAULT 0,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
ON public.comments FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create comments"
ON public.comments FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their comments"
ON public.comments FOR UPDATE
USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their comments"
ON public.comments FOR DELETE
USING (auth.uid() = author_id);

-- Upvotes (unified for posts and comments)
CREATE TABLE public.upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT upvote_target CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

ALTER TABLE public.upvotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view upvotes"
ON public.upvotes FOR SELECT
USING (true);

CREATE POLICY "Users can create upvotes"
ON public.upvotes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their upvotes"
ON public.upvotes FOR DELETE
USING (auth.uid() = user_id);

-- Create unique indexes for upvotes
CREATE UNIQUE INDEX upvotes_user_post_unique ON public.upvotes(user_id, post_id) WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX upvotes_user_comment_unique ON public.upvotes(user_id, comment_id) WHERE comment_id IS NOT NULL;

-- Tharwa Coins balance
CREATE TABLE public.coin_balances (
  user_id UUID PRIMARY KEY,
  balance INTEGER DEFAULT 100, -- Start with 100 coins
  lifetime_earned INTEGER DEFAULT 100,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.coin_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coin balance"
ON public.coin_balances FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coin balance"
ON public.coin_balances FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coin balance"
ON public.coin_balances FOR UPDATE
USING (auth.uid() = user_id);

-- Coin transactions
CREATE TABLE public.coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- earned, spent, purchased, gifted
  source TEXT, -- achievement, challenge, purchase, referral, daily_login, upvote
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coin transactions"
ON public.coin_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coin transactions"
ON public.coin_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Challenges
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL, -- savings, no_spend, streak, budget
  target_metric TEXT NOT NULL, -- savings_amount, days_streak, budget_adherence
  target_value NUMERIC,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  entry_fee_coins INTEGER DEFAULT 0,
  prize_pool_coins INTEGER DEFAULT 0,
  max_participants INTEGER,
  is_sponsored BOOLEAN DEFAULT false,
  sponsor_name TEXT,
  icon TEXT DEFAULT '🏆',
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  circle_id UUID REFERENCES public.circles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active challenges"
ON public.challenges FOR SELECT
USING (is_active = true OR created_by = auth.uid());

CREATE POLICY "Authenticated users can create challenges"
ON public.challenges FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their challenges"
ON public.challenges FOR UPDATE
USING (auth.uid() = created_by);

-- Challenge Participants
CREATE TABLE public.challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  progress NUMERIC DEFAULT 0,
  rank INTEGER,
  completed_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view challenge participants"
ON public.challenge_participants FOR SELECT
USING (true);

CREATE POLICY "Users can join challenges"
ON public.challenge_participants FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation"
ON public.challenge_participants FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can leave challenges"
ON public.challenge_participants FOR DELETE
USING (auth.uid() = user_id);

-- Insert default circles
INSERT INTO public.circles (name, slug, description, category, icon, cover_color, created_by) VALUES
('UAE Investors', 'uae-investors', 'Discuss local investment opportunities, UAE stock market, and regional investment strategies', 'investing', '📈', 'emerald', NULL),
('Crypto Talk', 'crypto-talk', 'Cryptocurrency strategies, market analysis, and blockchain discussions', 'crypto', '₿', 'orange', NULL),
('First Home Buyers', 'first-home-buyers', 'Tips and support for purchasing your first property in the UAE', 'real-estate', '🏠', 'blue', NULL),
('Debt-Free Journey', 'debt-free-journey', 'Support community for paying off debts and achieving financial freedom', 'debt-free', '🎯', 'red', NULL),
('FIRE Movement', 'fire-movement', 'Financial Independence, Retire Early - strategies and progress sharing', 'saving', '🔥', 'amber', NULL),
('Side Hustle Hub', 'side-hustle-hub', 'Extra income ideas, freelancing tips, and success stories', 'income', '💼', 'purple', NULL),
('Budget Masters', 'budget-masters', 'Budgeting tips, tools, and accountability partners', 'budgeting', '📊', 'teal', NULL);

-- Insert sample challenges
INSERT INTO public.challenges (name, description, challenge_type, target_metric, target_value, start_date, end_date, prize_pool_coins, icon, created_by) VALUES
('January Savings Sprint', 'Save as much as you can this month! Top savers win coins.', 'savings', 'savings_amount', 5000, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 1000, '🏃', NULL),
('No-Spend Weekend', 'Can you go the entire weekend without spending on non-essentials?', 'no_spend', 'days_streak', 3, CURRENT_DATE, CURRENT_DATE + INTERVAL '3 days', 200, '🚫', NULL),
('7-Day Streak', 'Log your expenses every day for a week straight', 'streak', 'days_streak', 7, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 300, '🔥', NULL);

-- Function to update member count
CREATE OR REPLACE FUNCTION public.update_circle_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.circles SET member_count = member_count + 1 WHERE id = NEW.circle_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.circles SET member_count = member_count - 1 WHERE id = OLD.circle_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_circle_member_count_trigger
AFTER INSERT OR DELETE ON public.circle_memberships
FOR EACH ROW EXECUTE FUNCTION public.update_circle_member_count();

-- Function to update post count
CREATE OR REPLACE FUNCTION public.update_circle_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.circles SET post_count = post_count + 1 WHERE id = NEW.circle_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.circles SET post_count = post_count - 1 WHERE id = OLD.circle_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_circle_post_count_trigger
AFTER INSERT OR DELETE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.update_circle_post_count();

-- Function to update comment count on posts
CREATE OR REPLACE FUNCTION public.update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_post_comment_count_trigger
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.update_post_comment_count();

-- Function to handle upvotes
CREATE OR REPLACE FUNCTION public.handle_upvote()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.post_id IS NOT NULL THEN
      UPDATE public.posts SET upvote_count = upvote_count + 1 WHERE id = NEW.post_id;
    ELSIF NEW.comment_id IS NOT NULL THEN
      UPDATE public.comments SET upvote_count = upvote_count + 1 WHERE id = NEW.comment_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.post_id IS NOT NULL THEN
      UPDATE public.posts SET upvote_count = upvote_count - 1 WHERE id = OLD.post_id;
    ELSIF OLD.comment_id IS NOT NULL THEN
      UPDATE public.comments SET upvote_count = upvote_count - 1 WHERE id = OLD.comment_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER handle_upvote_trigger
AFTER INSERT OR DELETE ON public.upvotes
FOR EACH ROW EXECUTE FUNCTION public.handle_upvote();