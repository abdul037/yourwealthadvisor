import { supabase } from '@/integrations/supabase/client';

export type AppEventName =
  | 'dashboard_focus_selected'
  | 'dashboard_ai_map_viewed'
  | 'dashboard_ai_map_reviewed'
  | 'dashboard_ai_map_why_opened'
  | 'dashboard_goal_locked'
  | 'dashboard_goal_adjusted';

interface AppEvent {
  name: AppEventName;
  meta?: Record<string, string | number | boolean | null>;
}

export function trackAppEvent(name: AppEventName, meta?: AppEvent['meta']) {
  if (typeof window === 'undefined') return;
  const event: AppEvent = { name, meta };

  void (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await (supabase
      .from('app_events' as any)
      .insert({
        user_id: user.id,
        name: event.name,
        meta: event.meta ?? null,
      }) as unknown as Promise<{ error: any }>);
    if (error && import.meta.env.DEV) {
      console.warn('[AppEvent] Failed to persist', error.message);
    }
  })();

  if (import.meta.env.DEV) {
    console.info('[AppEvent]', event);
  }
}
