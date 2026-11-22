import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import type { PluginListenerHandle } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { APP_URL_SCHEME, AUTH_CALLBACK_HOST, isNativeApp, parseDeepLink } from '@/lib/native';

const AUTH_PARAMS = ['code', 'type', 'error', 'error_code', 'error_description'];

/**
 * Glue between the native shell and the web app. Renders nothing; does nothing on the web.
 *
 * - Links that open the app (`com.tharwanet.app://…`): finishes Google sign-in,
 *   email confirmation and password reset, then routes to the right screen.
 * - Android hardware back button: goes back in history, or leaves the app at the root.
 */
export function NativeAppBridge() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNativeApp()) return;

    let disposed = false;
    let lastHandledUrl = '';
    const handles: PluginListenerHandle[] = [];
    const keep = (handle: PluginListenerHandle) => {
      if (disposed) void handle.remove();
      else handles.push(handle);
    };

    const failSignIn = (message: string) => {
      toast({ title: 'Sign-in could not be completed', description: message, variant: 'destructive' });
      navigate('/auth', { replace: true });
    };

    const handleAppUrl = async (rawUrl: string) => {
      if (!rawUrl || rawUrl === lastHandledUrl) return;
      lastHandledUrl = rawUrl;

      const link = parseDeepLink(rawUrl);
      if (!link || link.scheme !== APP_URL_SCHEME) return;

      // Close the system browser sheet that was opened for sign-in (no-op otherwise).
      Browser.close().catch(() => undefined);

      // Any other app link maps straight onto a route, e.g. …://split/join/ABC → /split/join/ABC
      if (link.host !== AUTH_CALLBACK_HOST) {
        const query = link.query.toString();
        navigate(`/${link.host}${link.path === '/' ? '' : link.path}${query ? `?${query}` : ''}`);
        return;
      }

      const errorDescription = link.query.get('error_description') || link.hash.get('error_description');
      if (errorDescription) {
        failSignIn(errorDescription);
        return;
      }

      const code = link.query.get('code');
      const accessToken = link.hash.get('access_token');
      const refreshToken = link.hash.get('refresh_token');
      const type = link.hash.get('type') || link.query.get('type');

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
        }
      } catch (error) {
        failSignIn(error instanceof Error ? error.message : 'Please try again.');
        return;
      }

      if (type === 'recovery') {
        navigate('/auth?recovery=1', { replace: true });
        return;
      }

      AUTH_PARAMS.forEach((param) => link.query.delete(param));
      const query = link.query.toString();
      navigate(`${link.path}${query ? `?${query}` : ''}`, { replace: true });
    };

    // Also delivered for the link that launched the app (the event is retained until a listener exists).
    CapacitorApp.addListener('appUrlOpen', ({ url }) => {
      void handleAppUrl(url);
    }).then(keep);

    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) window.history.back();
      else void CapacitorApp.exitApp();
    }).then(keep);

    return () => {
      disposed = true;
      handles.forEach((handle) => void handle.remove());
    };
  }, [navigate]);

  return null;
}
