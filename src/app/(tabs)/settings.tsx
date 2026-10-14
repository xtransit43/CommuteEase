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

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0f172a', 
    padding: 24, 
    justifyContent: 'center' 
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: { 
    flexGrow: 1, 
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
    marginBottom: 24, 
    textAlign: 'center' 
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  buttonContainer: { 
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  optionButton: { 
    flex: 1,
    padding: 16, 
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
    fontSize: 15, 
    fontWeight: '600', 
    color: '#fff' 
  },
  saveButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
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