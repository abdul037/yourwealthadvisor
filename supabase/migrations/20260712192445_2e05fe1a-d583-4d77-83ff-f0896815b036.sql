
-- Revoke default PUBLIC execute on all SECURITY DEFINER functions in public schema
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_expense_group_member(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_expense_group_creator(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_circle_member_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_circle_post_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_post_comment_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_group_by_invite_code(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_upvote() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_coins(integer, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ensure_coin_balance() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_member_email_for_creator(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_challenge_progress() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.spend_coins(integer, text, text) FROM PUBLIC, anon, authenticated;

-- Re-grant execute only where required
-- RLS helper functions must be callable by authenticated users (policies invoke them)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_expense_group_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_expense_group_creator(uuid, uuid) TO authenticated;

-- Client RPCs used by the app
GRANT EXECUTE ON FUNCTION public.award_coins(integer, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.spend_coins(integer, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_coin_balance() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_member_email_for_creator(uuid) TO authenticated;

-- Public invite lookup: needs to work for both signed-in and anonymous visitors
GRANT EXECUTE ON FUNCTION public.get_group_by_invite_code(text) TO anon, authenticated;

-- Trigger functions (handle_new_user, update_*_count, handle_upvote, update_challenge_progress,
-- update_updated_at_column) don't need any grants; triggers execute them regardless.
