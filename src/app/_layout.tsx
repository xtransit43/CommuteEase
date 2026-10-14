import { Tabs, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

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
    />
  );
}