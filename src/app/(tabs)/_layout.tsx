import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        title: 'CommuteEase',
        headerTitle: 'CommuteEase',
        headerStyle: {
          backgroundColor: '#000000',
        },
        headerTintColor: '#00ff00',
        headerTitleStyle: {
          fontFamily: 'Comic Sans MS',
          fontWeight: 'bold',
          color: '#00ff00',
        },
        contentStyle: {
          backgroundColor: '#000000',
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}