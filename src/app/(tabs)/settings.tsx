import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const [vehicleType, setVehicleType] = useState<'gas' | 'ev'>('gas');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  // Check login session & fetch saved preferences on mount
  useEffect(() => {
    const loadSessionAndPreferences = async () => {
      try {
        const storedUserId = await SecureStore.getItemAsync('userId');
        
        // If not logged in, stop loading and leave userId as null to display login prompt
        if (!storedUserId) {
          setFetching(false);
          return;
        }

        setUserId(storedUserId);

        // Fetch user preferences using stored ID
        const response = await fetch(`/api/user/preferences?userId=${storedUserId}`);
        const data = await response.json();

        if (response.ok && data.user?.vehicleType) {
          setVehicleType(data.user.vehicleType);
        }
      } catch (err) {
        console.warn('Failed to load session or preferences:', err);
      } finally {
        setFetching(false);
      }
    };

    loadSessionAndPreferences();
  }, []);

  const handleSavePreferences = async (selectedType: 'gas' | 'ev') => {
    if (!userId) return;

    setVehicleType(selectedType);
    setLoading(true);

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, vehicleType: selectedType }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update preferences');

      Alert.alert('Success', `Vehicle preference updated to ${selectedType.toUpperCase()}`);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // 1. Loading Indicator State
  if (fetching) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007aff" />
      </View>
    );
  }

  // 2. Unauthenticated View: Display Login Prompt
  if (!userId) {
    return (
      <View style={styles.container}>
        <View style={styles.unauthCard}>
          <Text style={styles.unauthTitle}>Login Required</Text>
          <Text style={styles.unauthText}>
            You need to be logged in to access settings and save your vehicle routing preferences.
          </Text>
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 3. Authenticated View: Settings Controls
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Commuter Settings</Text>
      <Text style={styles.subtitle}>Select your primary vehicle type for dynamic map routing:</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.optionButton, vehicleType === 'gas' && styles.activeGas]}
          onPress={() => handleSavePreferences('gas')}
        >
          <Text style={styles.optionText}>⛽ Gas Powered</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.optionButton, vehicleType === 'ev' && styles.activeEv]}
          onPress={() => handleSavePreferences('ev')}
        >
          <Text style={styles.optionText}>⚡ Electric Vehicle (EV)</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="small" color="#007aff" style={{ marginTop: 20 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0f172a', 
    padding: 24, 
    justifyContent: 'center' 
  },
  title: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: '#fff', 
    marginBottom: 8, 
    textAlign: 'center' 
  },
  subtitle: { 
    fontSize: 14, 
    color: '#94a3b8', 
    marginBottom: 32, 
    textAlign: 'center' 
  },
  buttonContainer: { 
    gap: 16 
  },
  optionButton: { 
    padding: 20, 
    borderRadius: 12, 
    backgroundColor: '#1e293b', 
    borderWidth: 1, 
    borderColor: '#334155', 
    alignItems: 'center' 
  },
  activeGas: { 
    borderColor: '#ef4444', 
    backgroundColor: 'rgba(239, 68, 68, 0.1)' 
  },
  activeEv: { 
    borderColor: '#10b981', 
    backgroundColor: 'rgba(16, 185, 129, 0.1)' 
  },
  optionText: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#fff' 
  },
  /* Unauthenticated Prompt Styles */
  unauthCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  unauthTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  unauthText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});