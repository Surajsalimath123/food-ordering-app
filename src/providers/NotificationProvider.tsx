import * as Notifications from 'expo-notifications';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';

import { registerForPushNotificationsAsync } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const NotificationProvider = ({ children }: PropsWithChildren) => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  const savePushTokenForUser = async (token: string) => {
    // ✅ Don’t call auth.getUser when not logged-in
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      // not signed in yet -> skip
      return;
    }

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

  useEffect(() => {
    // 1) Listeners always okay
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log('🔔 Notification received:', notification.request.content);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('👉 Notification tapped:', response.notification.request.content);
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  useEffect(() => {
    // 2) Only attempt token registration, then save when a session exists
    let unsub: { data?: { subscription: { unsubscribe: () => void } } } | null = null;

    const run = async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        console.log('📲 Expo Push Token:', token);
        setExpoPushToken(token);
        await savePushTokenForUser(token);
      }
    };

    run();

    // If user logs in later, save token then
    unsub = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user && expoPushToken) {
        await savePushTokenForUser(expoPushToken);
      }
    });

    return () => {
      unsub?.data?.subscription?.unsubscribe?.();
    };
  }, [expoPushToken]);

  return <>{children}</>;
};

export default NotificationProvider;
