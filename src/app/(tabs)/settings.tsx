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
    padding: 20 
  },
  card: { 
    backgroundColor: '#030d03', 
    borderRadius: 16, 
    padding: 24, 
    width: '100%',
    maxWidth: 550,
    borderWidth: 2, 
    borderColor: '#00ff00',
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
  },
  title: { 
    fontFamily: 'Comic Sans MS',
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 4, 
    color: '#00ff00', 
    textAlign: 'center',
    textShadowColor: '#00ff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  subtitle: { 
    fontFamily: 'Comic Sans MS',
    fontSize: 12, 
    color: '#00cc00', 
    marginBottom: 24, 
    textAlign: 'center' 
  },
  section: { 
    marginBottom: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#003300', 
    paddingBottom: 12 
  },
  label: { 
    fontFamily: 'Comic Sans MS',
    fontSize: 13, 
    color: '#00cc00', 
    marginBottom: 4 
  },
  value: { 
    fontFamily: 'Comic Sans MS',
    fontSize: 15, 
    fontWeight: '500', 
    color: '#00ff00' 
  },
  valueHighlight: { 
    fontFamily: 'Comic Sans MS',
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#00ff00' 
  },
  actionHeader: { 
    fontFamily: 'Comic Sans MS',
    fontSize: 14, 
    fontWeight: '600', 
    marginTop: 10, 
    marginBottom: 10, 
    color: '#00ff00' 
  },
  buttonRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    gap: 12 
  },
  optionButton: { 
    flex: 1, 
    padding: 12, 
    borderWidth: 1, 
    borderColor: '#008800', 
    borderRadius: 8, 
    alignItems: 'center', 
    backgroundColor: '#000000' 
  },
  activeOption: { 
    borderColor: '#00ff00', 
    backgroundColor: 'rgba(0,255,0,0.1)' 
  },
  optionText: { 
    fontFamily: 'Comic Sans MS',
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#00ff00' 
  },
  loadingText: { 
    fontFamily: 'Comic Sans MS',
    marginTop: 12, 
    color: '#00ff00', 
    fontSize: 14 
  },
  errorText: { 
    fontFamily: 'Comic Sans MS',
    color: '#ff4444', 
    fontSize: 15, 
    textAlign: 'center', 
    marginBottom: 16 
  },
  retryButton: { 
    backgroundColor: '#00ff00', 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 8 
  },
  retryButtonText: { 
    fontFamily: 'Comic Sans MS',
    color: '#000000', 
    fontWeight: 'bold' 
  }
});
