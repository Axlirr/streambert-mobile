import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, headerStyle: { backgroundColor: '#1a1a1a' }, headerTintColor: '#fff' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="details/[type]/[id]" options={{ presentation: 'modal', headerShown: true, headerTitle: '' }} />
    </Stack>
  );
}
