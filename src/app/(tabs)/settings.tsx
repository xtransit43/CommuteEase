import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ActivityIndicator, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Platform
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserPreferences();
  }, []);

  const fetchUserPreferences = async () => {
    try {
      setLoading(true);
      setError(null);

      let userId = null;
      if (Platform.OS === 'web') {
        userId = localStorage.getItem('userId');
      } else {
        userId = await SecureStore.getItemAsync('userId');
      }

      if (!userId) {
        setError('No active session found. Please log in.');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/preferences?userId=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user preferences.');
      }

      setPreferences(data.user);
    } catch (err: any) {
      console.error('Preferences fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVehicleType = async (newType: 'gas' | 'ev') => {
    try {
      setUpdating(true);

      let userId = null;
      if (Platform.OS === 'web') {
        userId = localStorage.getItem('userId');
      } else {
        userId = await SecureStore.getItemAsync('userId');
      }

      const response = await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, vehicleType: newType }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update preferences.');

      setPreferences((prev: any) => ({ ...prev, vehicleType: newType }));
      Alert.alert('Success', `Vehicle profile updated to [${newType.toUpperCase()}] node.`);
    } catch (err: any) {
      Alert.alert('Update Error', err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00ff00" />
        <Text style={styles.loadingText}>$ loading user telemetry...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.push('/login')}>
          <Text style={styles.retryButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>$ commute-ease --config</Text>
        <Text style={styles.subtitle}>Vercel Serverless Architecture</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Account Node Identifier:</Text>
          <Text style={styles.value}>{preferences?.email || 'N/A'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Active Powertrain:</Text>
          <Text style={styles.valueHighlight}>
            {preferences?.vehicleType ? preferences.vehicleType.toUpperCase() : 'Not Set'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Assigned Vehicle Profile:</Text>
          <Text style={styles.value}>
            {preferences?.vehicleMake && preferences?.vehicleModel 
              ? `${preferences.vehicleMake} ${preferences.vehicleModel}` 
              : 'Standard Grid Node'}
          </Text>
        </View>

        <Text style={styles.actionHeader}>Override Powertrain Mode:</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.optionButton, preferences?.vehicleType === 'gas' && styles.activeOption]}
            onPress={() => handleUpdateVehicleType('gas')}
            disabled={updating}
          >
            <Text style={styles.optionText}>⛽ Gas Node</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.optionButton, preferences?.vehicleType === 'ev' && styles.activeOption]}
            onPress={() => handleUpdateVehicleType('ev')}
            disabled={updating}
          >
            <Text style={styles.optionText}>⚡ EV Node</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 24, 
    backgroundColor: '#000000', 
    justifyContent: 'center',
    alignItems: 'center'
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#000000', 
    padding
