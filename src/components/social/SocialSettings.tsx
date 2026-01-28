import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { defaultSocialPreferences, loadSocialPreferences, saveSocialPreferences } from '@/lib/socialPreferences';
import { trackSocialEvent } from '@/lib/socialAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';

interface SocialPreferencesRow {
  weekly_digest: boolean | null;
  reply_alerts: boolean | null;
  streak_nudges: boolean | null;
}

export function SocialSettings() {
  const [preferences, setPreferences] = useState(loadSocialPreferences);
  const { user } = useUserProfile();
  const skipTracking = useRef(true);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    const syncPreferences = async () => {
      const { data, error } = await (supabase
        .from('social_preferences' as any)
        .select('weekly_digest, reply_alerts, streak_nudges')
        .eq('user_id', user.id)
        .maybeSingle() as unknown as Promise<{ data: SocialPreferencesRow | null; error: any }>);

      if (error) {
        console.warn('[SocialSettings] Failed to load preferences', error.message);
        return;
      }

      if (!isMounted) return;

      if (data) {
        const next = {
          weeklyDigest: data.weekly_digest ?? defaultSocialPreferences.weeklyDigest,
          replyAlerts: data.reply_alerts ?? defaultSocialPreferences.replyAlerts,
          streakNudges: data.streak_nudges ?? defaultSocialPreferences.streakNudges,
        };
        skipTracking.current = true;
        setPreferences(next);
        saveSocialPreferences(next);
        return;
      }

      const seed = loadSocialPreferences();
      const { error: seedError } = await (supabase.from('social_preferences' as any).upsert({
        user_id: user.id,
        weekly_digest: seed.weeklyDigest,
        reply_alerts: seed.replyAlerts,
        streak_nudges: seed.streakNudges,
      }) as unknown as Promise<{ error: any }>);
      if (seedError) {
        console.warn('[SocialSettings] Failed to seed preferences', seedError.message);
      }
    };

    void syncPreferences();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (skipTracking.current) {
      skipTracking.current = false;
      return;
    }
    saveSocialPreferences(preferences);
    trackSocialEvent('social_preferences_updated', preferences);
    if (!user) return;
    void (supabase
      .from('social_preferences' as any)
      .upsert({
        user_id: user.id,
        weekly_digest: preferences.weeklyDigest,
        reply_alerts: preferences.replyAlerts,
        streak_nudges: preferences.streakNudges,
      }) as unknown as Promise<{ error: any }>)
      .then(({ error }) => {
        if (error) {
          console.warn('[SocialSettings] Failed to update preferences', error.message);
        }
      });
  }, [preferences, user?.id]);

  return (
    <Card className="border-border/70 bg-muted/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Social Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="social-weekly-digest" className="text-sm">Weekly digest</Label>
            <p className="text-xs text-muted-foreground">Top posts and progress recap</p>
          </div>
          <Switch
            id="social-weekly-digest"
            checked={preferences.weeklyDigest}
            onCheckedChange={(value) => setPreferences((prev) => ({ ...prev, weeklyDigest: value }))}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="social-reply-alerts" className="text-sm">Reply alerts</Label>
            <p className="text-xs text-muted-foreground">Notify me about replies to my posts</p>
          </div>
          <Switch
            id="social-reply-alerts"
            checked={preferences.replyAlerts}
            onCheckedChange={(value) => setPreferences((prev) => ({ ...prev, replyAlerts: value }))}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="social-streak-nudges" className="text-sm">Streak nudges</Label>
            <p className="text-xs text-muted-foreground">Gentle reminders to keep streaks alive</p>
          </div>
          <Switch
            id="social-streak-nudges"
            checked={preferences.streakNudges}
            onCheckedChange={(value) => setPreferences((prev) => ({ ...prev, streakNudges: value }))}
          />
        </div>
      </CardContent>
    </Card>
  );
}
