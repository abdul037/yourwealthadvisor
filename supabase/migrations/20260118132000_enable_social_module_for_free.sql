-- Make Social module available to free tier users

UPDATE public.app_modules
SET is_live = true,
    required_tier = 'free'
WHERE name = 'social';
