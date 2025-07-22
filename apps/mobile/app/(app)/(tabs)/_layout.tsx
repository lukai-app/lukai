import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { mixpanelApp } from '@/lib/tools/mixpanel';
import { ANALYTICS_EVENTS } from '@/lib/analytics/constants';
import { useSession } from '@/components/auth/ctx';

export default function TabsLayout() {
  const { session } = useSession();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2EB88A',
        headerStyle: {
          backgroundColor: '#1A1A1A',
        },
        headerShadowVisible: false,
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#1A1A1A',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
        listeners={{
          tabPress: () => {
            mixpanelApp.track(ANALYTICS_EVENTS.HOME, {
              distinct_id: session?.user?.phone_number,
            });
          },
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          headerShown: false,
          title: '2025',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'calendar' : 'calendar-outline'}
              size={24}
              color={color}
            />
          ),
        }}
        listeners={{
          tabPress: () => {
            mixpanelApp.track(ANALYTICS_EVENTS.REPORT, {
              distinct_id: session?.user?.phone_number,
            });
          },
        }}
      />
    </Tabs>
  );
}
