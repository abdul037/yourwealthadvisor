export type SocialPreferences = {
  weeklyDigest: boolean;
  replyAlerts: boolean;
  streakNudges: boolean;
};

const STORAGE_KEY = 'tharwa_social_preferences';

export const defaultSocialPreferences: SocialPreferences = {
  weeklyDigest: true,
  replyAlerts: true,
  streakNudges: true,
};

export function loadSocialPreferences(): SocialPreferences {
  if (typeof window === 'undefined') return defaultSocialPreferences;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSocialPreferences;
    const parsed = JSON.parse(raw) as Partial<SocialPreferences>;
    return { ...defaultSocialPreferences, ...parsed };
  } catch {
    return defaultSocialPreferences;
  }
}

export function saveSocialPreferences(preferences: SocialPreferences) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}
