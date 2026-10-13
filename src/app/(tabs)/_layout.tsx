import React, { useEffect, useState } from 'react';
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons"; 
import * as SecureStore from 'expo-secure-store';

export default function TabLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const storedUserId = await SecureStore.getItemAsync('userId');
        const storedUsername = await SecureStore.getItemAsync('username');
        
        setIsLoggedIn(!!storedUserId);
        if (storedUsername) {
          setUsername(storedUsername);
        }
      } catch (e) {
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <Tabs 
      screenOptions = {{
        tabBarActiveTintColor: '#ffd33d',
        tabBarInactiveTintColor: '#ffffff',
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name = {focused ? 'home-sharp' : 'home-outline'} color = {color} size = {24}/>
          ),
        }}/>

      <Tabs.Screen 
        name="about" 
        options={{ 
          title: 'About',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name = {focused ? 'information-circle' : 'information-circle-outline'} color = {color} size = {24}/>
          ),
        }}/>

      <Tabs.Screen 
        name="maps" 
        options={{ 
          title: 'Maps',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name = {focused ? 'map' : 'map-outline'} color = {color} size = {24}/>
          ),
        }}/>

      {/* Conditionally rendered Settings Tab */}
      <Tabs.Screen 
        name="settings" 
        options={{ 
          title: 'Settings',
          href: isLoggedIn ? '/settings' : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name = {focused ? 'settings' : 'settings-outline'} color = {color} size = {24}/>
          ),
        }}/>

      {/* Dynamic Profile or Login Tab */}
      <Tabs.Screen 
        name="login" 
        options={{ 
          title: isLoggedIn ? (username || 'Profile') : 'Login',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={isLoggedIn ? (focused ? 'person-circle' : 'person-circle-outline') : (focused ? 'log-in' : 'log-in-outline')} 
              color={color} 
              size={24}
            />
          ),
        }}/>
    </Tabs>
  );
}