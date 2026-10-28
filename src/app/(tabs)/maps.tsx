import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ActivityIndicator, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import OpenGisMap, { Station } from '../../components/OpenGisMap';

export default function MapsScreen() {
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  const handleStationSelect = (station: Station) => {
    setSelectedStation(station);
    fetchAiInsights(station);
  };

  const fetchAiInsights = async (station: Station) => {
    try {
      setAiLoading(true);
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: station.latitude,
          longitude: station.longitude,
          stationName: station.name,
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

  return (
    <View style={styles.container}>
      <OpenGisMap onSelectStation={handleStationSelect} />

      <ScrollView contentContainerStyle={styles.overlayContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>$ commute-ease --gis</Text>

          {selectedStation ? (
            <View style={styles.section}>
              <Text style={styles.label}>Selected Node Target:</Text>
              <Text style={styles.value}>{selectedStation.name} ({selectedStation.brand})</Text>
              <Text style={styles.valueHighlight}>Distance: {selectedStation.distanceMiles} mi</Text>
            </View>
          ) : (
            <Text style={styles.subtitle}>Select a nearby station from the map grid above to view details.</Text>
          )}

          <View style={styles.section}>
            <Text style={styles.label}>⚡ AI Route Assessment:</Text>
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
  container: { flex: 1, backgroundColor: '#000000' },
  overlayContainer: { padding: 16 },
  card: { 
    backgroundColor: '#030d03', 
    borderRadius: 16, 
    padding: 20, 
    borderWidth: 2, 
    borderColor: '#00ff00' 
  },
  title: { 
    fontFamily: 'Comic Sans MS', 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#00ff00', 
    textAlign: 'center', 
    marginBottom: 8 
  },
  subtitle: { 
    fontFamily: 'Comic Sans MS', 
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
  label: { fontFamily: 'Comic Sans MS', fontSize: 13, color: '#00cc00' },
  value: { fontFamily: 'Comic Sans MS', fontSize: 15, color: '#00ff00', fontWeight: 'bold' },
  valueHighlight: { fontFamily: 'Comic Sans MS', fontSize: 14, color: '#00ff00' },
  aiText: { fontFamily: 'Comic Sans MS', fontSize: 13, color: '#ffffff', fontStyle: 'italic', marginTop: 4 },
});
