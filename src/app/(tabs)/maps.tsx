import React, { Suspense, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from 'react-native';

// Safely lazy-load native map only on non-web platforms
const NativeMapMobile = Platform.OS !== 'web'
  ? React.lazy(() => import('../../components/OpenGisMap'))
  : null;

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface GasStation {
  id: number;
  name: string;
  brand?: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
}

export default function OpenGisMapScreen() {
  const { width } = useWindowDimensions();
  const isLargeWeb = Platform.OS === 'web' && width >= 768;

  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [tracking, setTracking] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [gasStations, setGasStations] = useState<GasStation[]>([]);
  const [loadingStations, setLoadingStations] = useState<boolean>(false);

  // Toggle GPS Tracking
  const toggleTracking = () => {
    setTracking((prev) => !prev);
  };

  // Helper to calculate distance in KM between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Fetch nearby gas stations using OpenStreetMap Overpass API
  const fetchNearbyGasStations = async (coords: LocationCoords) => {
    setLoadingStations(true);
    try {
      // Query amenities tagged as 'fuel' within 5000m radius
      const query = `[out:json];node["amenity"="fuel"](around:5000,${coords.latitude},${coords.longitude});out 10;`;
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data && data.elements) {
        const stations: GasStation[] = data.elements.map((item: any) => ({
          id: item.id,
          name: item.tags?.name || item.tags?.brand || 'Gas Station',
          brand: item.tags?.brand,
          latitude: item.lat,
          longitude: item.lon,
          distanceKm: calculateDistance(coords.latitude, coords.longitude, item.lat, item.lon),
        }));

        // Sort by closest distance
        stations.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
        setGasStations(stations);
      }
    } catch (err: any) {
      console.warn('Failed to fetch gas stations:', err);
    } finally {
      setLoadingStations(false);
    }
  };

  useEffect(() => {
    let watchId: any = null;

    if (!tracking) {
      setGasStations([]);
      return;
    }

    if (Platform.OS === 'web') {
      if (!('geolocation' in navigator)) {
        setErrorMsg('Geolocation is not supported by this browser.');
        return;
      }

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(newCoords);
          setErrorMsg(null);
          fetchNearbyGasStations(newCoords);
        },
        (error) => setErrorMsg(error.message),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    } else {
      (async () => {
        try {
          const Location = await import('expo-location');
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
          }

          watchId = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 5000,
              distanceInterval: 10,
            },
            (loc) => {
              const newCoords = {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              };
              setLocation(newCoords);
              setErrorMsg(null);
              fetchNearbyGasStations(newCoords);
            }
          );
        } catch (err: any) {
          setErrorMsg(err?.message || 'Error tracking location');
        }
      })();
    }

    return () => {
      if (Platform.OS === 'web' && watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      } else if (watchId && typeof watchId.remove === 'function') {
        watchId.remove();
      }
    };
  }, [tracking]);

  // Construct dynamic Web Embed URL centered on coordinates
  const webMapUrl = location
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude - 0.02}%2C${location.latitude - 0.02}%2C${location.longitude + 0.02}%2C${location.latitude + 0.02}&layer=mapnik&marker=${location.latitude}%2C${location.longitude}`
    : 'https://www.openstreetmap.org/export/embed.html';

  return (
    <View style={[styles.container, isLargeWeb && styles.webOffset]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>OpenGIS Layer Map</Text>
            <Text style={styles.subtitle}>Unified cross-platform geo-spatial tracking.</Text>
          </View>
          <TouchableOpacity
            style={[styles.trackButton, tracking ? styles.buttonActive : styles.buttonInactive]}
            onPress={toggleTracking}
          >
            <Text style={styles.buttonText}>
              {tracking ? 'Stop GPS Tracking' : 'Start GPS Tracking'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status indicator bar */}
        <View style={styles.statusBar}>
          <Text style={styles.statusText}>
            {tracking
              ? location
                ? `GPS Active: Lat ${location.latitude.toFixed(4)}, Lng ${location.longitude.toFixed(4)}`
                : 'Acquiring GPS location...'
              : 'GPS Tracking Off'}
          </Text>
          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
        </View>
      </View>

      <View style={styles.contentLayout}>
        <View style={styles.mapContainer}>
          {Platform.OS === 'web' ? (
            <iframe
              key={location ? `${location.latitude}-${location.longitude}` : 'default'}
              src={webMapUrl}
              style={{
                width: '100%',
                height: '100%',
                borderWidth: 0,
                borderStyle: 'none',
              } as any}
              title="OpenStreetMap Web Layer"
            />
          ) : (
            <Suspense
              fallback={
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#007aff" />
                </View>
              }
            >
              {NativeMapMobile && (
                <NativeMapMobile location={location} gasStations={gasStations} />
              )}
            </Suspense>
          )}
        </View>

        {/* Nearby Gas Stations List Drawer */}
        {tracking && (
          <View style={styles.stationsCard}>
            <Text style={styles.stationsHeader}>Nearby Gas Stations</Text>
            {loadingStations ? (
              <ActivityIndicator size="small" color="#007aff" style={{ marginTop: 12 }} />
            ) : gasStations.length === 0 ? (
              <Text style={styles.emptyText}>No gas stations found within 5 km.</Text>
            ) : (
              <FlatList
                data={gasStations}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.stationItem}>
                    <Text style={styles.stationName}>{item.name}</Text>
                    <Text style={styles.stationDetails}>
                      {item.distanceKm ? `${item.distanceKm.toFixed(2)} km away` : 'Nearby'}
                    </Text>
                  </View>
                )}
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    padding: 24,
  },
  webOffset: {
    paddingLeft: 264,
  },
  header: {
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1d1d1f',
  },
  subtitle: {
    fontSize: 14,
    color: '#86868b',
    marginTop: 4,
  },
  trackButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonActive: {
    backgroundColor: '#ff3b30',
  },
  buttonInactive: {
    backgroundColor: '#007aff',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  statusBar: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  statusText: {
    fontSize: 13,
    color: '#1d1d1f',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    color: '#ff3b30',
    marginTop: 4,
  },
  contentLayout: {
    flex: 1,
    gap: 16,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stationsCard: {
    maxHeight: 200,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  stationsHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#86868b',
    marginTop: 8,
  },
  stationItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f2',
  },
  stationName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1d1d1f',
  },
  stationDetails: {
    fontSize: 12,
    color: '#86868b',
    marginTop: 2,
  },
});