
-- 1. Expense group member email column hardening
REVOKE SELECT (email) ON public.expense_group_members FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_member_email_for_creator(p_member_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.email
  FROM expense_group_members m
  JOIN expense_groups g ON g.id = m.group_id
  WHERE m.id = p_member_id
    AND (g.user_id = auth.uid() OR m.user_id = auth.uid());
$$;

-- 2. Coin balances lock-down
DROP POLICY IF EXISTS "Users can update own coin balance" ON public.coin_balances;
DROP POLICY IF EXISTS "Users can insert own coin balance" ON public.coin_balances;

-- 3. Coin transactions lock-down
DROP POLICY IF EXISTS "Users can insert own coin transactions" ON public.coin_transactions;

-- Helper RPCs for coin operations (SECURITY DEFINER bypasses the dropped policies)
CREATE OR REPLACE FUNCTION public.ensure_coin_balance()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  INSERT INTO public.coin_balances (user_id, balance, lifetime_earned)
  VALUES (auth.uid(), 100, 100)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.award_coins(p_amount integer, p_source text, p_description text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 OR p_amount > 1000 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  INSERT INTO public.coin_balances (user_id, balance, lifetime_earned)
  VALUES (v_user, 100 + p_amount, 100 + p_amount)
  ON CONFLICT (user_id) DO UPDATE
    SET balance = public.coin_balances.balance + p_amount,
        lifetime_earned = public.coin_balances.lifetime_earned + p_amount,
        updated_at = now();

  INSERT INTO public.coin_transactions (user_id, amount, transaction_type, source, description)
  VALUES (v_user, p_amount, 'earned', p_source, p_description);
END;
$$;

CREATE OR REPLACE FUNCTION public.spend_coins(p_amount integer, p_source text, p_description text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_balance integer;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  SELECT balance INTO v_balance FROM public.coin_balances WHERE user_id = v_user FOR UPDATE;
  IF v_balance IS NULL OR v_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient coins';
  END IF;

  UPDATE public.coin_balances
  SET balance = balance - p_amount, updated_at = now()
  WHERE user_id = v_user;

  INSERT INTO public.coin_transactions (user_id, amount, transaction_type, source, description)
  VALUES (v_user, -p_amount, 'spent', p_source, p_description);
END;
$$;

-- 4. challenge_participants -> authenticated-only
DROP POLICY IF EXISTS "Anyone can view challenge participants" ON public.challenge_participants;
CREATE POLICY "Authenticated users can view challenge participants"
ON public.challenge_participants
FOR SELECT
TO authenticated
USING (true);

-- 5. circle_memberships -> authenticated-only
DROP POLICY IF EXISTS "Users can view circle memberships" ON public.circle_memberships;
CREATE POLICY "Authenticated users can view circle memberships"
ON public.circle_memberships
FOR SELECT
TO authenticated
USING (true);

-- 6. upvotes -> authenticated-only
DROP POLICY IF EXISTS "Users can view upvotes" ON public.upvotes;
CREATE POLICY "Authenticated users can view upvotes"
ON public.upvotes
FOR SELECT
TO authenticated
USING (true);

-- 7. referral_clicks PII reduction
ALTER TABLE public.referral_clicks DROP COLUMN IF EXISTS ip_address;
ALTER TABLE public.referral_clicks DROP COLUMN IF EXISTS user_agent;
