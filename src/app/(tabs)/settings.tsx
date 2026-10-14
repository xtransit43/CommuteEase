import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const [vehicleType, setVehicleType] = useState<'gas' | 'ev'>('gas');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  // Check login session & fetch saved preferences on mount
  useEffect(() => {
    const loadSessionAndPreferences = async () => {
      try {
        let storedUserId = null;
        if (Platform.OS === 'web') {
          storedUserId = localStorage.getItem('userId');
        } else {
          storedUserId = await SecureStore.getItemAsync('userId');
        }
        
        if (!storedUserId) {
          setFetching(false);
          return;
        }

        setUserId(storedUserId);

        // Updated path to match /api/preferences
        const response = await fetch(`/api/preferences?userId=${storedUserId}`);
        const data = await response.json();

        if (response.ok && data.user) {
          if (data.user.vehicleType) setVehicleType(data.user.vehicleType);
          if (data.user.vehicleMake) setVehicleMake(data.user.vehicleMake);
          if (data.user.vehicleModel) setVehicleModel(data.user.vehicleModel);
        }
      } catch (err) {
        console.warn('Failed to load session or preferences:', err);
      } finally {
        setFetching(false);
      }
    };

    loadSessionAndPreferences();
  }, []);

  const handleSavePreferences = async (selectedType?: 'gas' | 'ev') => {
    if (!userId) return;

    const typeToSave = selectedType || vehicleType;
    if (selectedType) setVehicleType(selectedType);

    setLoading(true);

    try {
      // Updated path to match /api/preferences
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          vehicleType: typeToSave,
          vehicleMake,
          vehicleModel
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update preferences');

      Alert.alert('Success', 'Commuter preferences updated successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#007aff" />
      </View>
    );
  }

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

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Commuter Settings</Text>
      <Text style={styles.subtitle}>Configure your primary vehicle details for optimized map routing:</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Vehicle Make</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Toyota, Tesla, Ford"
          placeholderTextColor="#64748b"
          value={vehicleMake}
          onChangeText={setVehicleMake}
        />

        <Text style={styles.label}>Vehicle Model</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Prius, Model 3, F-150"
          placeholderTextColor="#64748b"
          value={vehicleModel}
          onChangeText={setVehicleModel}
        />
      </View>

      <Text style={styles.label}>Powertrain Type</Text>
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

      <TouchableOpacity 
        style={styles.saveButton} 
        onPress={() => handleSavePreferences()}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Vehicle Details</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

// Drop-in replacement for the StyleSheet in settings.tsx
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#050505', 
    padding: 24, 
    justifyContent: 'center' 
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: { 
    flexGrow: 1, 
    backgroundColor: '#050505', 
    padding: 24, 
    justifyContent: 'center',
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  title: { 
    fontFamily: 'Comic Sans MS',
    fontSize: 34, 
    fontWeight: 'bold', 
    color: '#ffffff', 
    marginBottom: 8, 
    textAlign: 'center',
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: { 
    fontFamily: 'Comic Sans MS',
    fontSize: 15, 
    color: '#ffffff', 
    marginBottom: 32, 
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    backgroundColor: '#121212',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ff00ff',
    shadowColor: '#ff00ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  label: {
    fontFamily: 'Comic Sans MS',
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffff00',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    fontFamily: 'Comic Sans MS',
    backgroundColor: '#1f1f1f',
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 18,
    borderWidth: 2,
    borderColor: '#00ffff',
  },
  buttonContainer: { 
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  optionButton: { 
    flex: 1,
    padding: 18, 
    borderRadius: 14, 
    backgroundColor: '#121212', 
    borderWidth: 2, 
    borderColor: '#ffffff', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeGas: { 
    borderColor: '#ff0055', 
    backgroundColor: 'rgba(255, 0, 85, 0.25)',
  },
  activeEv: { 
    borderColor: '#00ff00', 
    backgroundColor: 'rgba(0, 255, 0, 0.25)',
  },
  optionText: { 
    fontFamily: 'Comic Sans MS',
    fontSize: 15, 
    fontWeight: 'bold', 
    color: '#ffffff' 
  },
  saveButton: {
    backgroundColor: '#00ff00',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonText: {
    fontFamily: 'Comic Sans MS',
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  unauthCard: {
    backgroundColor: '#121212',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffff00',
    maxWidth: 400,
    alignSelf: 'center',
    shadowColor: '#ffff00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  unauthTitle: {
    fontFamily: 'Comic Sans MS',
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  unauthText: {
    fontFamily: 'Comic Sans MS',
    fontSize: 15,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  loginButton: {
    backgroundColor: '#00ffff',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  loginButtonText: {
    fontFamily: 'Comic Sans MS',
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});