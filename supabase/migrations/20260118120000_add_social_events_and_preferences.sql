-- Social analytics events + preferences

CREATE TABLE public.social_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.social_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own social events"
ON public.social_events FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social events"
ON public.social_events FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own social events"
ON public.social_events FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_social_events_user_id ON public.social_events(user_id);
CREATE INDEX idx_social_events_created_at ON public.social_events(created_at);

CREATE TABLE public.social_preferences (
  user_id UUID PRIMARY KEY,
  weekly_digest BOOLEAN DEFAULT true,
  reply_alerts BOOLEAN DEFAULT true,
  streak_nudges BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.social_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own social preferences"
ON public.social_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social preferences"
ON public.social_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social preferences"
ON public.social_preferences FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own social preferences"
ON public.social_preferences FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_social_preferences_updated_at
BEFORE UPDATE ON public.social_preferences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
