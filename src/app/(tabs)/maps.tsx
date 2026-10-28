import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ActivityIndicator, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import OpenGisMap from '../components/OpenGisMap'; // Adjust path if needed depending on your folder structure

export default function MapsScreen() {
  const [geospatialData, setGeospatialData] = useState<any>(null);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Default coordinates (e.g., San Francisco node)
  const currentLat = 37.7749;
  const currentLng = -122.4194;

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulated local geospatial data response instead of Azure
      const mockData = {
        latitude: currentLat,
        longitude: currentLng,
        zoneStatus: 'Optimal',
        trafficDelayMinutes: 3,
        alternativeRouteAvailable: true,
        stationCount: 4,
      };

      setGeospatialData(mockData);

      // Automatically fetch AI recommendation using your backend ai+api.ts endpoint
      fetchAiInsights(mockData.stationCount);
    } catch (err: any) {
      console.error('Map data load error:', err);
      setError(err.message || 'Failed to load geospatial grid.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAiInsights = async (stationCount: number) => {
    try {
      setAiLoading(true);
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: currentLat,
          longitude: currentLng,
          vehicleType: 'ev', // Can be dynamically linked to user preference if available
          stationCount: stationCount,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setAiRecommendation(data.recommendation);
      }
    } catch (err) {
      console.error('Failed to fetch AI insights:', err);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00ff00" />
        <Text style={styles.loadingText}>$ scanning spatial grid nodes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadMapData}>
          <Text style={styles.retryButtonText}>Retry Scan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Interactive Map view component */}
      <View style={styles.mapContainer}>
        <OpenGisMap 
          location={{ latitude: currentLat, longitude: currentLng }}
          gasStations={[
            { id: 1, name: 'Grid Charging Node Alpha', latitude: 37.7790, longitude: -122.4150, brand: 'Tesla Supercharger' },
            { id: 2, name: 'EcoFuel Station Beta', latitude: 37.7700, longitude: -122.4250, brand: 'Shell Recharge' },
          ]}
        />
      </View>

      {/* Terminal Overlay Info Card */}
      <ScrollView contentContainerStyle={styles.overlayContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>$ commute-ease --gis</Text>
          <Text style={styles.subtitle}>Live Grid Diagnostics & Telemetry</Text>

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

          {/* AI Recommendation Section */}
          <View style={styles.section}>
            <Text style={styles.label}>⚡ Gemini AI Route Insights:</Text>
            {aiLoading ? (
              <ActivityIndicator size="small" color="#00ff00" style={{ marginTop: 6 }} />
            ) : (
              <Text style={styles.aiText}>
                {aiRecommendation || 'Proceed with standard travel precautions.'}
              </Text>
            )}
          </View>

          <TouchableOpacity style={styles.refreshButton} onPress={loadMapData}>
            <Text style={styles.refreshButtonText}>Rescan Grid Telemetry</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000000' 
  },
  mapContainer: {
    flex: 1,
    minHeight: 250,
  },
  overlayContainer: { 
    padding: 16, 
    backgroundColor: 'transparent' 
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
    padding: 20, 
    borderWidth: 2, 
    borderColor: '#00ff00',
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
  },
  title: { 
    fontFamily: 'Comic Sans MS',
    fontSize: 20, 
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
    marginBottom: 20, 
    textAlign: 'center' 
  },
  section: { 
    marginBottom: 14, 
    borderBottomWidth: 1, 
    borderBottomColor: '#003300', 
    paddingBottom: 10 
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
  aiText: {
    fontFamily: 'Comic Sans MS',
    fontSize: 14,
    color: '#ffffff',
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 20,
  },
  badge: { 
    alignSelf: 'flex-start', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 6, 
    fontSize: 13, 
    fontWeight: 'bold', 
    overflow: 'hidden',
    fontFamily: 'Comic Sans MS',
  },
  successBadge: { 
    backgroundColor: '#003300', 
    color: '#00ff00',
    borderWidth: 1,
    borderColor: '#00ff00',
  },
  warningBadge: { 
    backgroundColor: '#330000', 
    color: '#ff0000',
    borderWidth: 1,
    borderColor: '#ff0000',
  },
  refreshButton: { 
    backgroundColor: '#00ff00', 
    padding: 14, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginTop: 10 
  },
  refreshButtonText: { 
    fontFamily: 'Comic Sans MS',
    color: '#000000', 
    fontSize: 15, 
    fontWeight: 'bold' 
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
