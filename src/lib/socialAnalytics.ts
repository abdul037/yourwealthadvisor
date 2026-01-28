import { supabase } from '@/integrations/supabase/client';

export type SocialEventName =
  | 'social_view'
  | 'social_return'
  | 'circle_joined'
  | 'circle_left'
  | 'post_created'
  | 'comment_created'
  | 'challenge_joined'
  | 'challenge_left'
  | 'friend_request_sent'
  | 'invite_link_copied'
  | 'circle_invite_copied'
  | 'discover_circles_clicked'
  | 'social_preferences_updated';

interface SocialEvent {
  name: SocialEventName;
  meta?: Record<string, string | number | boolean | null>;
}

const LAST_SEEN_KEY = 'tharwa_social_last_seen';

export function trackSocialEvent(name: SocialEventName, meta?: SocialEvent['meta']) {
  if (typeof window === 'undefined') return;
  const event: SocialEvent = { name, meta };

  void (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await (supabase
      .from('social_events' as any)
      .insert({
        user_id: user.id,
        name: event.name,
        meta: event.meta ?? null,
      }) as unknown as Promise<{ error: any }>);
    if (error && process.env.NODE_ENV !== 'production') {
      console.warn('[SocialEvent] Failed to persist', error.message);
    }
  })();

  if (process.env.NODE_ENV !== 'production') {
    console.info('[SocialEvent]', event);
  }
}

export function recordSocialView() {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  const lastSeenRaw = window.localStorage.getItem(LAST_SEEN_KEY);
  const lastSeen = lastSeenRaw ? Number(lastSeenRaw) : null;

  if (lastSeen && now - lastSeen > 1000 * 60 * 60 * 24) {
    trackSocialEvent('social_return');
  }

  trackSocialEvent('social_view');
  window.localStorage.setItem(LAST_SEEN_KEY, String(now));
}
