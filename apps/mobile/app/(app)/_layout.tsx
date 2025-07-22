import { Stack } from 'expo-router';
import { Redirect } from 'expo-router';

import { Text } from '@/components/ui/text';
import { useSession } from '@/components/auth/ctx';
import { AppProvider } from '@/components/app/app-context';
import { useScreenCapture } from '@/hooks/use-screen-capture';

export default function RootLayout() {
  useScreenCapture(); // Initialize screen capture functionality

  const { session, isLoading } = useSession();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <AppProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="currency"
          options={{
            presentation: 'modal',
            animation: 'slide_from_right',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="transactions"
          options={{
            presentation: 'modal',
            animation: 'slide_from_right',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            presentation: 'modal',
            animation: 'slide_from_right',
            headerShown: false,
          }}
        />
      </Stack>
    </AppProvider>
  );
}
