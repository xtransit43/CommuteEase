import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ActivityIndicator, 
  ScrollView,
  InteractionManager,
  Platform
} from 'react-native';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';

// Import both map implementations for cross-platform support
import OpenGisMap, { Station } from '../../components/OpenGisMap';
import OpenGisMapWeb from '../../components/OpenGisMapWeb';

export default function MapsScreen() {
  // Default fallback set to Greenwich, London
  const [location, setLocation] = useState({ latitude: 51.4800, longitude: -0.0000 });
  const [vehicleType, setVehicleType] = useState<'gas' | 'ev'>('gas');
  const [gasStations, setGasStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('Acquiring Greenwich telemetry...');

  const aiCacheRef = useRef<Map<string, string>>(new Map());

  // 1. Fetch User Preferences & Live GPS on Mount
  useEffect(() => {
    (async () => {
      try {
        let userId = null;
        if (Platform.OS === 'web') {
          userId = localStorage.getItem('userId');
        } else {
          userId = await SecureStore.getItemAsync('userId');
        }

        let userPowertrain: 'gas' | 'ev' = 'gas';
        if (userId) {
          const prefRes = await fetch(`/api/preferences?userId=${userId}`);
          const prefData = await prefRes.json();
          if (prefRes.ok && prefData.user?.vehicleType) {
            userPowertrain = prefData.user.vehicleType;
            setVehicleType(userPowertrain);
          }
        }

        // Request GPS Location Permissions
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLoadingStatus('Location permission denied. Using Greenwich default.');
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        const userCoords = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        };
        setLocation(userCoords);

        // Fetch stations matching their preferred vehicle type from Overpass
        setLoadingStatus('Querying Overpass GIS nodes...');
        await fetchStationsDirectly(userCoords.latitude, userCoords.longitude, userPowertrain);
      } catch (err) {
        console.error('Initialization error:', err);
        setLoadingStatus('Failed to acquire live GPS lock.');
      }
    })();
  }, []);

  // 2. Direct Overpass API Query filtered by User's Vehicle Type
  const fetchStationsDirectly = async (lat: number, lng: number, prefType: 'gas' | 'ev') => {
    const radius = 5000; // 5km search radius
    const amenityFilter = prefType === 'ev' ? '"amenity"="charging_station"' : '"amenity"="fuel"';
    
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node[${amenityFilter}](around:${radius},${lat},${lng});
        way[${amenityFilter}](around:${radius},${lat},${lng});
      );
      out body center;
    `;

    try {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery,
        headers: { 'Content-Type': 'text/plain' },
      });

      const data = await response.json();

      const parsedStations: Station[] = (data.elements || [])
        .map((el: any, index: number) => {
          const elementLat = el.lat || el.center?.lat;
          const elementLon = el.lon || el.center?.lon;
          
          if (!elementLat || !elementLon) return null;

          const distanceMiles = calculateDistanceMiles(lat, lng, elementLat, elementLon);

          return {
            id: el.id || index,
            name: el.tags?.name || (prefType === 'ev' ? 'EV Charging Hub' : 'Gas Station'),
            latitude: elementLat,
            longitude: elementLon,
            brand: el.tags?.brand || el.tags?.operator || 'Independent Node',
            type: prefType,
            distanceMiles: parseFloat(distanceMiles.toFixed(1)),
          };
        })
        .filter(Boolean);

      parsedStations.sort((a, b) => (a.distanceMiles || 0) - (b.distanceMiles || 0));
      setGasStations(parsedStations);
    } catch (err) {
      console.error('Overpass fetch failed:', err);
    } finally {
      setLoadingStatus('');
    }
  };

  const calculateDistanceMiles = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3958.8;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleStationSelect = (station: Station) => {
    setSelectedStation(station);
    setAiRecommendation(null);

    const cacheKey = `${station.latitude}-${station.longitude}`;
    if (aiCacheRef.current.has(cacheKey)) {
      setAiRecommendation(aiCacheRef.current.get(cacheKey)!);
      return;
    }

    InteractionManager.runAfterInteractions(() => {
      fetchAiInsights(station, cacheKey);
    });
  };

  const fetchAiInsights = async (station: Station, cacheKey: string) => {
    try {
      setAiLoading(true);
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: station.latitude,
          longitude: station.longitude,
          stationName: station.name,
          brand: station.brand,
          vehicleType: vehicleType,
          stationCount: gasStations.length,
        }),
      });

      const data = await response.json();
      if (response.ok && data.recommendation) {
        aiCacheRef.current.set(cacheKey, data.recommendation);
        setAiRecommendation(data.recommendation);
      } else {
        setAiRecommendation('Failed to generate route assessment.');
      }
    } catch (err) {
      setAiRecommendation('Network error while reaching Gemini AI.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
          <OpenGisMapWeb 
            location={location}
            gasStations={gasStations}
            selectedStation={selectedStation}
            onSelectStation={handleStationSelect}
          />
        ) : (
          <OpenGisMap 
            location={location}
            gasStations={gasStations}
            selectedStation={selectedStation}
            onSelectStation={handleStationSelect} 
          />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.overlayContainer} pointerEvents="box-none">
        <View style={styles.card}>
          <Text style={styles.title}>$ commute-ease --gis</Text>

          {loadingStatus ? (
            <Text style={styles.subtitle}>{loadingStatus}</Text>
          ) : selectedStation ? (
            <View style={styles.section}>
              <Text style={styles.label}>Selected Node Target ({vehicleType.toUpperCase()}):</Text>
              <Text style={styles.value}>
                {selectedStation.name} {selectedStation.brand ? `(${selectedStation.brand})` : ''}
              </Text>
              <Text style={styles.valueHighlight}>Distance: {selectedStation.distanceMiles} mi</Text>
            </View>
          ) : (
            <Text style={styles.subtitle}>
              {gasStations.length === 0 
                ? `No active ${vehicleType.toUpperCase()} nodes found in sector.` 
                : `Select a nearby ${vehicleType.toUpperCase()} station from the map grid above.`}
            </Text>
          )}

          <View style={styles.section}>
            <Text style={styles.label}>⚡ Gemini AI Route Assessment:</Text>
            {aiLoading ? (
              <ActivityIndicator size="small" color="#00ff00" style={{ marginTop: 6 }} />
            ) : (
              <Text style={styles.aiText}>
                {aiRecommendation || `Select a node to generate live ${vehicleType.toUpperCase()} transit guidance.`}
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
  mapContainer: { flex: 1 },
  overlayContainer: { position: 'absolute', bottom: 16, left: 16, right: 16, padding: 0 },
  card: { backgroundColor: 'rgba(3, 13, 3, 0.95)', borderRadius: 16, padding: 20, borderWidth: 2, borderColor: '#00ff00' },
  title: { fontFamily: 'monospace', fontSize: 20, fontWeight: 'bold', color: '#00ff00', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontFamily: 'monospace', fontSize: 12, color: '#00cc00', textAlign: 'center', marginBottom: 12 },
  section: { marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#003300', paddingBottom: 8 },
  label: { fontFamily: 'monospace', fontSize: 13, color: '#00cc00' },
  value: { fontFamily: 'monospace', fontSize: 15, color: '#00ff00', fontWeight: 'bold' },
  valueHighlight: { fontFamily: 'monospace', fontSize: 14, color: '#00ff00' },
  aiText: { fontFamily: 'monospace', fontSize: 13, color: '#ffffff', fontStyle: 'italic', marginTop: 4 },
});
