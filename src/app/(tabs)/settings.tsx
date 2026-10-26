import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ActivityIndicator, 
  TouchableOpacity, 
  ScrollView, 
  Alert 
} from 'react-native';

export default function SettingsScreen() {
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Replace this with your actual authenticated user ID (from your auth context/session)
  const currentUserId = "user-123-abc"; 

  // Fetch preferences from AWS Lambda on mount
  useEffect(() => {
    fetchUserPreferences();
  }, []);

  const fetchUserPreferences = async () => {
    try {
      setLoading(true);
      setError(null);

      // Read the AWS Lambda URL from Expo/Netlify public environment variables
      const awsLambdaUrl = process.env.EXPO_PUBLIC_AWS_PREFERENCES_URL;

      if (!awsLambdaUrl) {
        throw new Error("EXPO_PUBLIC_AWS_PREFERENCES_URL is missing in environment variables.");
      }

      const response = await fetch(`${awsLambdaUrl}?userId=${currentUserId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch preferences from AWS Lambda');
      }

      setPreferences(data.user);
    } catch (err: any) {
      console.error('AWS Lambda fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Optional: Function to handle updating vehicle preferences
  const handleUpdateVehicleType = async (newType: 'gas' | 'ev') => {
    try {
      setUpdating(true);
      
      // If you route updates through your Netlify server API or a separate AWS Lambda POST route:
      const response = await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, vehicleType: newType }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update');

      setPreferences((prev: any) => ({ ...prev, vehicleType: newType }));
      Alert.alert('Success', 'Vehicle preference updated successfully!');
    } catch (err: any) {
      Alert.alert('Update Error', err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading settings from AWS Lambda...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserPreferences}>
          <Text style={styles.retryButtonText}>Retry Connection</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>CommuteEase Settings</Text>
        <Text style={styles.subtitle}>Cloud Architecture: AWS Lambda & Netlify</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Account Email:</Text>
          <Text style={styles.value}>{preferences?.email || 'N/A'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Vehicle Type:</Text>
          <Text style={styles.valueHighlight}>
            {preferences?.vehicleType ? preferences.vehicleType.toUpperCase() : 'Not Set'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Vehicle Make & Model:</Text>
          <Text style={styles.value}>
            {preferences?.vehicleMake && preferences?.vehicleModel 
              ? `${preferences.vehicleMake} ${preferences.vehicleModel}` 
              : 'Not specified'}
          </Text>
        </View>

        <Text style={styles.actionHeader}>Quick Switch Vehicle Type:</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.optionButton, preferences?.vehicleType === 'gas' && styles.activeOption]}
            onPress={() => handleUpdateVehicleType('gas')}
            disabled={updating}
          >
            <Text style={styles.optionText}>⛽ Gas</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.optionButton, preferences?.vehicleType === 'ev' && styles.activeOption]}
            onPress={() => handleUpdateVehicleType('ev')}
            disabled={updating}
          >
            <Text style={styles.optionText}>⚡ EV</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#f4f6f8', justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f8', padding: 20 },
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 4, color: '#111', textAlign: 'center' },
  subtitle: { fontSize: 12, color: '#666', marginBottom: 24, textAlign: 'center' },
  section: { marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 12 },
  label: { fontSize: 14, color: '#555', marginBottom: 4 },
  value: { fontSize: 16, fontWeight: '500', color: '#222' },
  valueHighlight: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
  actionHeader: { fontSize: 14, fontWeight: '600', marginTop: 10, marginBottom: 10, color: '#333' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  optionButton: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, alignItems: 'center', backgroundColor: '#fafafa' },
  activeOption: { borderColor: '#007AFF', backgroundColor: '#eef6ff' },
  optionText: { fontSize: 15, fontWeight: '600', color: '#333' },
  loadingText: { marginTop: 12, color: '#666', fontSize: 14 },
  errorText: { color: '#d9534f', fontSize: 15, textAlign: 'center', marginBottom: 16 },
  retryButton: { backgroundColor: '#007AFF', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontWeight: '600' }
});