// src/providers/NotificationProvider.tsx

import * as Notifications from 'expo-notifications';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';

import { registerForPushNotificationsAsync } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';

// Safe global handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const NotificationProvider = ({ children }: PropsWithChildren) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  const savePushTokenForUser = async (token: string) => {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;

    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ expo_push_token: token })
      .eq('id', user.id);

    if (error) {
      console.error('❌ Failed to save push token:', error);
    } else {
      console.log('✅ Push token saved');
    }
  };

  // 🔔 Listeners (SAFE in Expo Go)
  useEffect(() => {
    if (!Notifications?.addNotificationReceivedListener) return;

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log('🔔 Notification received:', notification.request.content);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('👉 Notification tapped:', response.notification.request.content);
      });

    return () => {
      // 🚨 Guard for Expo Go
      try {
        if (
          notificationListener.current &&
          typeof Notifications.removeNotificationSubscription === 'function'
        ) {
          Notifications.removeNotificationSubscription(
            notificationListener.current
          );
        }

        if (
          responseListener.current &&
          typeof Notifications.removeNotificationSubscription === 'function'
        ) {
          Notifications.removeNotificationSubscription(
            responseListener.current
          );
        }
      } catch {
        // Ignore Expo Go cleanup issues
      }
    };
  }, []);

  // 📲 Token registration
  useEffect(() => {
    let authSub: any = null;

    const run = async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        console.log('📲 Expo Push Token:', token);
        setExpoPushToken(token);
        await savePushTokenForUser(token);
      }
    };

    run();

    authSub = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user && expoPushToken) {
          await savePushTokenForUser(expoPushToken);
        }
      }
    );

    return () => {
      authSub?.data?.subscription?.unsubscribe?.();
    };
  }, [expoPushToken]);

  return <>{children}</>;
};

export default NotificationProvider;
