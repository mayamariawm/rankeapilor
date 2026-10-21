import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { useStore } from '../../lib/store';
import { colors } from '../../lib/theme';

export default function TabsLayout() {
  const { ready, state } = useStore();
  if (!ready) return null;
  if (!state.user) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.line },
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTitleStyle: { color: colors.ink, fontWeight: '800' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Descubrir',
          tabBarIcon: ({ focused, size }) => <Ionicons name="compass-outline" color={focused ? colors.primary : colors.muted} size={size} />,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Amigos',
          tabBarIcon: ({ focused, size }) => <Ionicons name="people-outline" color={focused ? colors.primary : colors.muted} size={size} />,
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: 'Mi lista',
          tabBarIcon: ({ focused, size }) => <Ionicons name="heart-outline" color={focused ? colors.primary : colors.muted} size={size} />,
        }}
      />
    </Tabs>
  );
}
