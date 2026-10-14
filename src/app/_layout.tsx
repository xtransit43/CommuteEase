import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        title: 'CommuteEase',
        headerTitle: 'CommuteEase',
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
      {/* Hide stack header for tab navigation so tab headers/WebLayout take over */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
