
REVOKE EXECUTE ON FUNCTION public.award_coins(integer, text, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.spend_coins(integer, text, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.ensure_coin_balance() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_member_email_for_creator(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.award_coins(integer, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.spend_coins(integer, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_coin_balance() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_member_email_for_creator(uuid) TO authenticated;
