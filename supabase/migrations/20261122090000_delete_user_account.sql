-- Account deletion (required by the App Store and Google Play).
--
-- Most tables key rows by a plain `user_id uuid` with no foreign key to auth.users,
-- so deleting the auth user does NOT remove that user's data. This function removes
-- everything belonging to one user in a single transaction: either all of it goes,
-- or (on any error) nothing does.
--
-- It is called only by the `delete-account` edge function, using the service role,
-- which then deletes the auth user itself.

CREATE OR REPLACE FUNCTION public.delete_user_account(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  g record;
  t record;
  new_owner uuid;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'user id is required';
  END IF;

  -- 1. Split-expense groups this user owns.
  --    If another registered person is in the group, hand it over to them so their
  --    records survive; otherwise delete the group (cascades to members, expenses,
  --    splits, payers and settlements).
  FOR g IN SELECT id FROM public.expense_groups WHERE user_id = _user_id LOOP
    SELECT m.user_id INTO new_owner
    FROM public.expense_group_members m
    WHERE m.group_id = g.id
      AND m.user_id IS NOT NULL
      AND m.user_id <> _user_id
    ORDER BY m.joined_at
    LIMIT 1;

    IF new_owner IS NULL THEN
      DELETE FROM public.expense_groups WHERE id = g.id;
    ELSE
      UPDATE public.expense_groups
      SET user_id = new_owner, updated_at = now()
      WHERE id = g.id;

      UPDATE public.expense_group_members
      SET is_creator = COALESCE(user_id = new_owner, false)
      WHERE group_id = g.id;
    END IF;
  END LOOP;

  -- 2. Groups that remain are shared with other people. Keep this user's member row
  --    so everyone else's balances still add up, but strip the identity from it.
  UPDATE public.expense_group_members
  SET user_id = NULL,
      email = NULL,
      name = 'Deleted user',
      is_creator = false
  WHERE user_id = _user_id;

  -- 3. Settlements can point at this user's transactions (that key has no cascade).
  UPDATE public.expense_settlements
  SET transaction_id = NULL
  WHERE transaction_id IN (SELECT id FROM public.transactions WHERE user_id = _user_id);

  -- 4. Referral conversions reference clicks without a cascade; remove them first.
  DELETE FROM public.referral_conversions
  WHERE user_id = _user_id
     OR click_id IN (SELECT id FROM public.referral_clicks WHERE user_id = _user_id);

  -- 5. Social content and connections.
  DELETE FROM public.comments WHERE author_id = _user_id;
  DELETE FROM public.posts WHERE author_id = _user_id;
  DELETE FROM public.user_connections
  WHERE requester_id = _user_id OR addressee_id = _user_id;
  UPDATE public.circles SET created_by = NULL WHERE created_by = _user_id;
  UPDATE public.challenges SET created_by = NULL WHERE created_by = _user_id;

  -- 6. Every remaining table that keys rows by user_id (transactions, budgets, assets,
  --    debts, goals, linked accounts, notifications, subscriptions, roles, ...).
  --    Discovered at run time so tables added later are covered automatically.
  FOR t IN
    SELECT c.table_name
    FROM information_schema.columns c
    JOIN information_schema.tables tb
      ON tb.table_schema = c.table_schema AND tb.table_name = c.table_name
    WHERE c.table_schema = 'public'
      AND c.column_name = 'user_id'
      AND tb.table_type = 'BASE TABLE'
      AND c.table_name NOT IN ('expense_groups', 'expense_group_members')
  LOOP
    EXECUTE format('DELETE FROM public.%I WHERE user_id = $1', t.table_name) USING _user_id;
  END LOOP;

  -- 7. Profile row.
  DELETE FROM public.profiles WHERE id = _user_id;
END;
$$;

-- Only the service role (the edge function) may run this.
REVOKE ALL ON FUNCTION public.delete_user_account(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_account(uuid) TO service_role;
