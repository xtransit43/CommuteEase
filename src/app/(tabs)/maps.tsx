import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ActivityIndicator, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';

export default function MapsScreen() {
  const [geospatialData, setGeospatialData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Default sample coordinates (e.g., user's current route anchor or GPS location)
  const currentLat = 37.7749;
  const currentLng = -122.4194;

  useEffect(() => {
    fetchGeospatialData();
  }, []);

  const fetchGeospatialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Read Azure Functions URL from Expo public environment variables
      const azureUrl = process.env.EXPO_PUBLIC_AZURE_GEOSPATIAL_URL;

      // 2. Build endpoint with local fallback for development
      const endpoint = azureUrl 
        ? `${azureUrl}?lat=${currentLat}&lng=${currentLng}`
        : `http://localhost:7071/api/geospatial?lat=${currentLat}&lng=${currentLng}`;

      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch geospatial data from Azure Functions');
      }

      setGeospatialData(data.geospatialData);
    } catch (err: any) {
      console.error('Azure Functions fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Fetching traffic & route data from Azure...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchGeospatialData}>
          <Text style={styles.retryButtonText}>Retry Connection</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>CommuteEase Map & Traffic</Text>
        <Text style={styles.subtitle}>Geospatial API Powered by Azure Functions</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Coordinates Monitored:</Text>
          <Text style={styles.value}>
            Lat: {geospatialData?.latitude}, Lng: {geospatialData?.longitude}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Zone Traffic Status:</Text>
          <Text style={[styles.badge, geospatialData?.zoneStatus === 'Optimal' ? styles.successBadge : styles.warningBadge]}>
            {geospatialData?.zoneStatus || 'Unknown'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Estimated Traffic Delay:</Text>
          <Text style={styles.valueHighlight}>
            {geospatialData?.trafficDelayMinutes ?? 0} minutes
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Alternative Route:</Text>
          <Text style={styles.value}>
            {geospatialData?.alternativeRouteAvailable ? '🟢 Available' : '🔴 None Recommended'}
          </Text>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={fetchGeospatialData}>
          <Text style={styles.refreshButtonText}>Refresh Traffic Data</Text>
        </TouchableOpacity>
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
  valueHighlight: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, fontSize: 14, fontWeight: 'bold', overflow: 'hidden' },
  successBadge: { backgroundColor: '#e1f5fe', color: '#0288d1' },
  warningBadge: { backgroundColor: '#ffebee', color: '#c62828' },
  refreshButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  refreshButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  loadingText: { marginTop: 12, color: '#666', fontSize: 14 },
  errorText: { color: '#d9534f', fontSize: 15, textAlign: 'center', marginBottom: 16 },
  retryButton: { backgroundColor: '#007AFF', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontWeight: '600' }
});