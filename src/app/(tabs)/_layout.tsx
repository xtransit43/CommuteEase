import React, { useEffect, useState } from 'react';
import { Tabs, usePathname } from 'expo-router';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const pathname = usePathname();

  // Check auth session whenever pathname changes or on mount
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        let storedUserId = null;
        if (Platform.OS === 'web') {
          storedUserId = localStorage.getItem('userId');
        } else {
          storedUserId = await SecureStore.getItemAsync('userId');
        }
        setIsLoggedIn(!!storedUserId);
      } catch (err) {
        console.warn('Error checking session state:', err);
      }
    };

    checkUserSession();
  }, [pathname]);

  return (
    <Tabs
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
        tabBarStyle: {
          backgroundColor: '#121212',
          borderTopColor: '#ff00ff',
          borderTopWidth: 2,
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Comic Sans MS',
          fontSize: 12,
          fontWeight: 'bold',
        },
        tabBarActiveTintColor: '#00ffff',
        tabBarInactiveTintColor: '#ffffff',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="maps"
        options={{
          title: 'Map',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'map' : 'map-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Dynamic Tab 1: Switches between 'Login' and 'Profile' */}
      <Tabs.Screen
        name="login"
        options={{
          title: isLoggedIn ? 'Profile' : 'Login',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={
                isLoggedIn
                  ? focused ? 'person' : 'person-outline'
                  : focused ? 'log-in' : 'log-in-outline'
              }
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Dynamic Tab 2: Dynamic Settings/Preferences Icon & Title */}
      <Tabs.Screen
        name="settings"
        options={{
          title: isLoggedIn ? 'Preferences' : 'Settings',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={
                isLoggedIn
                  ? focused ? 'options' : 'options-outline'
                  : focused ? 'settings' : 'settings-outline'
              }
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'information-circle' : 'information-circle-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}