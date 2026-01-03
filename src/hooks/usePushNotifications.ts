import { useEffect, useState } from 'react';
import { PushNotifications, Token, PushNotificationSchema } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export function usePushNotifications() {
  const [token, setToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<PushNotificationSchema[]>([]);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      if (Capacitor.isNativePlatform()) {
        setIsSupported(true);
        await registerNotifications();
      }
    };
    checkSupport();
  }, []);

  const registerNotifications = async () => {
    try {
      // Request permission
      const permStatus = await PushNotifications.requestPermissions();
      
      if (permStatus.receive === 'granted') {
        // Register with Apple / Google to receive push
        await PushNotifications.register();
      }

      // Listen for registration token
      PushNotifications.addListener('registration', (token: Token) => {
        setToken(token.value);
        console.log('Push registration success, token:', token.value);
      });

      // Listen for registration errors
      PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration error:', error);
      });

      // Listen for incoming notifications
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received:', notification);
        setNotifications(prev => [...prev, notification]);
      });

      // Listen for notification taps
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed:', notification);
      });
    } catch (error) {
      console.error('Error setting up push notifications:', error);
    }
  };

  const clearNotifications = () => setNotifications([]);

  return {
    token,
    notifications,
    isSupported,
    clearNotifications,
  };
}
