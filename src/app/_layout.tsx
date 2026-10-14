import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#050505',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontFamily: 'Comic Sans MS',
          fontWeight: 'bold',
          color: '#ffffff',
        },
        contentStyle: {
          backgroundColor: '#050505',
        },
      }}
    >
      {/* Hide header for the tab group layout */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
