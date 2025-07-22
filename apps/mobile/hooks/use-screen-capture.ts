import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { screenCaptureService } from '@/lib/services/screen-capture';
import { notificationService } from '@/lib/services/notification';

export function useScreenCapture() {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Request permissions
    const setupPermissions = async () => {
      const notificationPermission =
        await notificationService.requestPermissions();
      const screenCapturePermission =
        await screenCaptureService.requestPermissions();

      if (notificationPermission && screenCapturePermission) {
        await notificationService.showPersistentNotification();
      }
    };

    setupPermissions();

    // Listen for notification responses
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log('Notification received:', notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(
        async (response) => {
          const data = response.notification.request.content.data;

          if (data.type === 'screen_scan') {
            try {
              const result = await screenCaptureService.captureAndProcess();
              console.log('Screen capture result:', result);
              // TODO: Handle the result (e.g., navigate to transaction form)
            } catch (error) {
              console.error('Error handling screen capture:', error);
            }
          }
        }
      );

    // Cleanup
    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
}
