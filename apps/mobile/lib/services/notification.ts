import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  private static instance: NotificationService;
  private persistentNotificationId: string | null = null;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermissions() {
    if (!Device.isDevice) {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  async showPersistentNotification() {
    if (this.persistentNotificationId) {
      // Notification already showing
      return;
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'LukAI — Register a Transaction',
        body: '📷 Tap to scan screen',
        data: { type: 'screen_scan' },
        sticky: true, // Makes notification persistent
      },
      trigger: null, // Immediate display
    });

    this.persistentNotificationId = id;
  }

  async removePersistentNotification() {
    if (this.persistentNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(
        this.persistentNotificationId
      );
      this.persistentNotificationId = null;
    }
  }

  async togglePersistentNotification(enabled: boolean) {
    if (enabled) {
      await this.showPersistentNotification();
    } else {
      await this.removePersistentNotification();
    }
  }
}

export const notificationService = NotificationService.getInstance();
