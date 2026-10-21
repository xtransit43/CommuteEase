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

        const response = await fetch(`/api/preferences?userId=${storedUserId}`);
        const data = await response.json();

        if (response.ok && data.user) {
          if (data.user.vehicleType) setVehicleType(data.user.vehicleType);
          if (data.user.vehicleMake) setVehicleMake(data.user.vehicleMake);
          if (data.user.vehicleModel) setVehicleModel(data.user.vehicleModel);
        }
      } catch (err) {
        console.warn('Failed to load preferences:', err);
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

      Alert.alert('Success', 'Node configurations updated.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  if (!userId) {
    return (
      <View style={styles.container}>
        <View style={styles.unauthCard}>
          <Text style={styles.unauthTitle}>ACCESS DENIED</Text>
          <Text style={styles.unauthText}>
            Authentication required to modify vehicle configuration parameters.
          </Text>
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginButtonText}>Authorize Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>$ config --vehicle</Text>
      <Text style={styles.subtitle}>Set baseline powertrain parameters for routing vectors:</Text>

      <View style={styles.section}>
        <Text style={styles.label}>VEHICLE MAKE</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Toyota, Tesla"
          placeholderTextColor="#005500"
          value={vehicleMake}
          onChangeText={setVehicleMake}
        />

        <Text style={styles.label}>VEHICLE MODEL</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Prius, Model 3"
          placeholderTextColor="#005500"
          value={vehicleModel}
          onChangeText={setVehicleModel}
        />
      </View>

      <Text style={styles.label}>POWERTRAIN SUBSYSTEM</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.optionButton, vehicleType === 'gas' && styles.activeGas]}
          onPress={() => handleSavePreferences('gas')}
        >
          <Text style={styles.optionText}>⛽ Gas Engine</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.optionButton, vehicleType === 'ev' && styles.activeEv]}
          onPress={() => handleSavePreferences('ev')}
        >
          <Text style={styles.optionText}>⚡ EV Node</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.saveButton} 
        onPress={() => handleSavePreferences()}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <Text style={styles.saveButtonText}>Commit Configuration</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000000', 
    padding: 24, 
    justifyContent: 'center' 
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: { 
    flexGrow: 1, 
    backgroundColor: '#000000', 
    padding: 24, 
    justifyContent: 'center',
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  title: { 
    fontFamily: 'Comic Sans MS',
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#00ff00', 
    marginBottom: 8, 
    textAlign: 'center',
    textShadowColor: '#00ff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  subtitle: { 
    fontFamily: 'Comic Sans MS',
    fontSize: 14, 
    color: '#00cc00', 
    marginBottom: 32, 
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    backgroundColor: '#030d03',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#00ff00',
  },
  label: {
    fontFamily: 'Comic Sans MS',
    fontSize: 13,
    fontWeight: 'bold',
    color: '#00ff00',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    fontFamily: 'Comic Sans MS',
    backgroundColor: '#000000',
    color: '#00ff00',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    fontSize: 15,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#008800',
  },
  buttonContainer: { 
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  optionButton: { 
    flex: 1,
    padding: 16, 
    borderRadius: 8, 
    backgroundColor: '#030d03', 
    borderWidth: 1, 
    borderColor: '#008800', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeGas: { 
    borderColor: '#00ff00', 
    backgroundColor: 'rgba(0, 255, 0, 0.15)',
  },
  activeEv: { 
    borderColor: '#00ff00', 
    backgroundColor: 'rgba(0, 255, 0, 0.15)',
  },
  optionText: { 
    fontFamily: 'Comic Sans MS',
    fontSize: 15, 
    fontWeight: 'bold', 
    color: '#00ff00' 
  },
  saveButton: {
    backgroundColor: '#00ff00',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: 'Comic Sans MS',
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  unauthCard: {
    backgroundColor: '#030d03',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00ff00',
    maxWidth: 400,
    alignSelf: 'center',
  },
  unauthTitle: {
    fontFamily: 'Comic Sans MS',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00ff00',
    marginBottom: 12,
  },
  unauthText: {
    fontFamily: 'Comic Sans MS',
    fontSize: 14,
    color: '#00cc00',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#00ff00',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    fontFamily: 'Comic Sans MS',
    color: '#000000',
    fontSize: 15,
    fontWeight: 'bold',
  },
});