import { Capacitor } from '@capacitor/core';

/**
 * Custom URL scheme registered in the native projects
 * (ios/App/App/Info.plist → CFBundleURLTypes, android strings.xml → custom_url_scheme).
 */
export const APP_URL_SCHEME = 'com.tharwanet.app';

/** Host part of the deep link that auth redirects come back on. */
export const AUTH_CALLBACK_HOST = 'auth-callback';

/**
 * Public web address of the app. Used for links that leave the device
 * (invites, share links), because inside the native shell
 * `window.location.origin` is `capacitor://localhost` / `https://localhost`.
 */
export const PUBLIC_WEB_ORIGIN: string =
  (import.meta.env.VITE_PUBLIC_WEB_ORIGIN as string | undefined) || 'https://tharwanet.com';

export const isNativeApp = (): boolean => Capacitor.isNativePlatform();

/**
 * Where Supabase should send the user after OAuth or an email link.
 * On the web that is the current origin; in the native app it is a deep link
 * that the OS routes back into the app (handled in NativeAppBridge).
 *
 * The native value must be on the Supabase Auth "Redirect URLs" allow-list:
 *   com.tharwanet.app://auth-callback/**
 */
export const getAuthRedirectUrl = (path = '/'): string => {
  const normalised = path.startsWith('/') ? path : `/${path}`;
  return isNativeApp()
    ? `${APP_URL_SCHEME}://${AUTH_CALLBACK_HOST}${normalised}`
    : `${window.location.origin}${normalised}`;
};

/** Origin to use when building a link that the user will send to someone else. */
export const getShareOrigin = (): string => {
  if (isNativeApp()) return PUBLIC_WEB_ORIGIN;
  return typeof window !== 'undefined' ? window.location.origin : PUBLIC_WEB_ORIGIN;
};

export interface DeepLink {
  scheme: string;
  host: string;
  path: string;
  query: URLSearchParams;
  hash: URLSearchParams;
}

/**
 * Splits an incoming app link into its parts.
 * Done by hand rather than with `new URL()` because web views disagree on how to
 * parse custom (non-http) schemes.
 */
export const parseDeepLink = (raw: string): DeepLink | null => {
  const match = raw.match(/^([a-z][a-z0-9+.-]*):\/\/([^/?#]*)([^?#]*)(\?[^#]*)?(#.*)?$/i);
  if (!match) return null;
  return {
    scheme: match[1].toLowerCase(),
    host: match[2],
    path: match[3] || '/',
    query: new URLSearchParams((match[4] || '').slice(1)),
    hash: new URLSearchParams((match[5] || '').slice(1)),
  };
};
