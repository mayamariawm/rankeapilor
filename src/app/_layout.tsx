import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StoreProvider } from '../lib/store';
import { colors } from '../lib/theme';

export default function RootLayout() {
  return (
    <StoreProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.ink },
          headerStyle: { backgroundColor: colors.bg },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
          headerBackTitle: 'Atrás',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="place/[id]" options={{ title: '' }} />
        <Stack.Screen name="rank/[id]" options={{ title: 'Rankear', presentation: 'modal' }} />
        <Stack.Screen name="share" options={{ title: 'Compartir mi lista', presentation: 'modal' }} />
        <Stack.Screen name="add-place" options={{ title: 'Agregar un lugar', presentation: 'modal' }} />
      </Stack>
    </StoreProvider>
  );
}
