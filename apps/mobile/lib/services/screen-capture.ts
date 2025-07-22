import { Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { captureScreen } from 'react-native-view-shot';
import * as Haptics from 'expo-haptics';
import { processScreenCapture } from '@/lib/api/screen-capture';

export class ScreenCaptureService {
  private static instance: ScreenCaptureService;

  private constructor() {}

  public static getInstance(): ScreenCaptureService {
    if (!ScreenCaptureService.instance) {
      ScreenCaptureService.instance = new ScreenCaptureService();
    }
    return ScreenCaptureService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true; // iOS doesn't need explicit screen capture permission
    }

    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === 'granted';
  }

  async captureScreen(): Promise<string | null> {
    try {
      // Trigger haptic feedback
      //await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      console.log('captureScreen');

      // Capture the screen
      const uri = await captureScreen({
        format: 'jpg',
        quality: 0.8,
        result: 'base64',
      });

      console.log('uri');

      return uri;
    } catch (error) {
      console.error('Error capturing screen:', error);
      return null;
    }
  }

  async captureAndProcess() {
    try {
      console.log('captureAndProcess');
      const base64Image = await this.captureScreen();
      console.log('base64Image', base64Image);
      if (!base64Image) {
        throw new Error('Failed to capture screen');
      }

      const result = await processScreenCapture(base64Image);
      return result;
    } catch (error) {
      console.error('Error in capture and process:', error);
      throw error;
    }
  }
}

export const screenCaptureService = ScreenCaptureService.getInstance();
