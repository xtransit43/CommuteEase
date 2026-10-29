import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ActivityIndicator, 
  ScrollView,
  InteractionManager
} from 'react-native';
import OpenGisMap, { Station } from '../../components/OpenGisMap';

export default function MapsScreen() {
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // In-memory cache to store AI responses so re-selecting a station is instantaneous
  const aiCacheRef = useRef<Map<string, string>>(new Map());

  const handleStationSelect = (station: Station) => {
    // 1. Instant UI update: Select station and clear old AI text immediately
    setSelectedStation(station);
    setAiRecommendation(null);

    const cacheKey = `${station.latitude}-${station.longitude}`;

    // 2. Check local cache first
    if (aiCacheRef.current.has(cacheKey)) {
      setAiRecommendation(aiCacheRef.current.get(cacheKey)!);
      return;
    }

    // 3. Defer the heavy AI fetch until after map animations/touch frames complete
    InteractionManager.runAfterInteractions(() => {
      fetchAiInsights(station, cacheKey);
    });
  };

  const fetchAiInsights = async (station: Station, cacheKey: string) => {
    try {
      setAiLoading(true);
      
      // Single request to your backend handling station context & Gemini AI lookup
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: station.latitude,
          longitude: station.longitude,
          stationName: station.name,
          brand: station.brand,
          stationType: station.type || 'gas', // Supports dynamic gas or EV routing
        }),
      });

      const data = await response.json();
      if (response.ok && data.recommendation) {
        aiCacheRef.current.set(cacheKey, data.recommendation);
        setAiRecommendation(data.recommendation);
      } else {
        setAiRecommendation('Failed to generate route assessment. Please try again.');
      }
    } catch (err) {
      console.error('Failed to fetch AI insights:', err);
      setAiRecommendation('Network error while reaching Gemini AI.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Map fills the entire background view */}
      <View style={styles.mapContainer}>
        <OpenGisMap 
          selectedStation={selectedStation}
          onSelectStation={handleStationSelect} 
        />
      </View>

      {/* Floating card overlay positioned on top of the map */}
      <ScrollView contentContainerStyle={styles.overlayContainer} pointerEvents="box-none">
        <View style={styles.card}>
          <Text style={styles.title}>$ commute-ease --gis</Text>

          {selectedStation ? (
            <View style={styles.section}>
              <Text style={styles.label}>Selected Node Target:</Text>
              <Text style={styles.value}>
                {selectedStation.name} {selectedStation.brand ? `(${selectedStation.brand})` : ''}
              </Text>
              <Text style={styles.valueHighlight}>Distance: {selectedStation.distanceMiles} mi</Text>
            </View>
          ) : (
            <Text style={styles.subtitle}>Select a nearby station from the map grid above to view details.</Text>
          )}

          <View style={styles.section}>
            <Text style={styles.label}>⚡ Gemini AI Route Assessment:</Text>
            {aiLoading ? (
              <ActivityIndicator size="small" color="#00ff00" style={{ marginTop: 6 }} />
            ) : (
              <Text style={styles.aiText}>
                {aiRecommendation || 'Select a gas or EV charging station to generate optimal transit guidance.'}
              </Text>
            )}
          </View>
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
    flex: 1 
  },
  overlayContainer: { 
    position: 'absolute', 
    bottom: 16, 
    left: 16, 
    right: 16,
    padding: 0 
  },
  card: { 
    backgroundColor: 'rgba(3, 13, 3, 0.95)', // Slight transparency to let map peak through
    borderRadius: 16, 
    padding: 20, 
    borderWidth: 2, 
    borderColor: '#00ff00',
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#00ff00', 
    textAlign: 'center', 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 12, 
    color: '#00cc00', 
    textAlign: 'center', 
    marginBottom: 12 
  },
  section: { 
    marginBottom: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#003300', 
    paddingBottom: 8 
  },
  label: { 
    fontSize: 13, 
    color: '#00cc00' 
  },
  value: { 
    fontSize: 15, 
    color: '#00ff00', 
    fontWeight: 'bold' 
  },
  valueHighlight: { 
    fontSize: 14, 
    color: '#00ff00' 
  },
  aiText: { 
    fontSize: 13, 
    color: '#ffffff', 
    fontStyle: 'italic', 
    marginTop: 4 
  },
});
