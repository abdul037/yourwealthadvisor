-- Product analytics events

CREATE TABLE public.app_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.app_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own app events"
ON public.app_events FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own app events"
ON public.app_events FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own app events"
ON public.app_events FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_app_events_user_id ON public.app_events(user_id);
CREATE INDEX idx_app_events_created_at ON public.app_events(created_at);
