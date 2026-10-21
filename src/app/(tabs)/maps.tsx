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
  Linking,
} from 'react-native';

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

  const toggleTracking = () => {
    setTracking((prev) => !prev);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
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

  const fetchNearbyStations = async (coords: LocationCoords, userVehicleType: 'gas' | 'ev' = 'gas') => {
    setLoadingStations(true);
    try {
      const amenityTag = userVehicleType === 'ev' ? 'charging_station' : 'fuel';
      const query = `[out:json];node["amenity"="${amenityTag}"](around:5000,${coords.latitude},${coords.longitude});out 10;`;
      
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data && data.elements) {
        const stations = data.elements.map((item: any) => ({
          id: item.id,
          name: item.tags?.name || item.tags?.brand || (userVehicleType === 'ev' ? 'Charging Station' : 'Gas Station'),
          brand: item.tags?.brand,
          latitude: item.lat,
          longitude: item.lon,
          distanceKm: calculateDistance(coords.latitude, coords.longitude, item.lat, item.lon),
        }));

        stations.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
        setGasStations(stations);
      }
    } catch (err: any) {
      console.warn('Failed to fetch stations:', err);
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
        setErrorMsg('Geolocation not supported by browser.');
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
          fetchNearbyStations(newCoords);
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
            setErrorMsg('Location permission denied');
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
              fetchNearbyStations(newCoords);
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

  const webMapUrl = location
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude - 0.02}%2C${location.latitude - 0.02}%2C${location.longitude + 0.02}%2C${location.latitude + 0.02}&layer=mapnik&marker=${location.latitude}%2C${location.longitude}`
    : 'https://www.openstreetmap.org/export/embed.html';

  return (
    <View style={[styles.container, isLargeWeb && styles.webOffset]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>$ ./gis-scanner</Text>
            <Text style={styles.subtitle}>Real-time geospatial telemetry feed.</Text>
          </View>
          <TouchableOpacity
            style={[styles.trackButton, tracking ? styles.buttonActive : styles.buttonInactive]}
            onPress={toggleTracking}
          >
            <Text style={styles.buttonText}>
              {tracking ? '■ Stop Telemetry' : '▶ Initialize GPS'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusBar}>
          <Text style={styles.statusText}>
            {tracking
              ? location
                ? `GRID LOCK: Lat ${location.latitude.toFixed(4)}, Lng ${location.longitude.toFixed(4)}`
                : 'Acquiring satellite uplink...'
              : 'TELEMETRY OFFLINE'}
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
                  <ActivityIndicator size="large" color="#00ff00" />
                </View>
              }
            >
              {NativeMapMobile && (
                <NativeMapMobile location={location} gasStations={gasStations} />
              )}
            </Suspense>
          )}
        </View>

        {tracking && (
          <View style={styles.stationsCard}>
            <Text style={styles.stationsHeader}>// TARGET NODES WITHIN 5KM</Text>
            {loadingStations ? (
              <ActivityIndicator size="small" color="#00ff00" style={{ marginTop: 12 }} />
            ) : gasStations.length === 0 ? (
              <Text style={styles.emptyText}>No service nodes detected in range.</Text>
            ) : (
              <FlatList
                data={gasStations}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.stationItemContainer}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.stationName}>{item.name}</Text>
                      <Text style={styles.stationDetails}>
                        {item.distanceKm ? `Dist: ${item.distanceKm.toFixed(2)} km` : 'In proximity'}
                      </Text>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.navigateButton}
                      onPress={() => navigateToStation(item.latitude, item.longitude, item.name)}
                    >
                      <Text style={styles.navigateButtonText}>Route Vector</Text>
                    </TouchableOpacity>
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

const navigateToStation = (latitude: number, longitude: number, stationName: string) => {
  const destination = `${latitude},${longitude}`;
  let url = '';

  if (Platform.OS === 'ios') {
    url = `maps://app?daddr=${destination}&dirflg=d&t=m`;
  } else if (Platform.OS === 'android') {
    url = `google.navigation:q=${destination}`;
  } else {
    url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&dir_action=navigate`;
  }

  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
        return Linking.openURL(fallbackUrl);
      }
    })
    .catch((err) => console.error('Map routing error:', err));
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 20,
  },
  webOffset: {
    paddingLeft: 280,
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
    fontFamily: 'Comic Sans MS',
    fontSize: 26,
    fontWeight: 'bold',
    color: '#00ff00',
    textShadowColor: '#00ff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontFamily: 'Comic Sans MS',
    fontSize: 13,
    color: '#00cc00',
    marginTop: 4,
  },
  trackButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00ff00',
  },
  buttonActive: {
    backgroundColor: '#330000',
    borderColor: '#ff0000',
  },
  buttonInactive: {
    backgroundColor: '#003300',
  },
  buttonText: {
    fontFamily: 'Comic Sans MS',
    color: '#00ff00',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusBar: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#030d03',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#008800',
  },
  statusText: {
    fontFamily: 'Comic Sans MS',
    fontSize: 13,
    color: '#00ff00',
    fontWeight: 'bold',
  },
  errorText: {
    fontFamily: 'Comic Sans MS',
    fontSize: 12,
    color: '#ff4444',
    marginTop: 4,
  },
  contentLayout: {
    flex: 1,
    gap: 16,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#030d03',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#00ff00',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#030d03',
  },
  stationsCard: {
    maxHeight: 240,
    backgroundColor: '#030d03',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#00ff00',
  },
  stationsHeader: {
    fontFamily: 'Comic Sans MS',
    fontSize: 15,
    fontWeight: 'bold',
    color: '#00ff00',
    marginBottom: 10,
  },
  emptyText: {
    fontFamily: 'Comic Sans MS',
    fontSize: 13,
    color: '#00aa00',
    marginTop: 8,
  },
  stationName: {
    fontFamily: 'Comic Sans MS',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  stationDetails: {
    fontFamily: 'Comic Sans MS',
    fontSize: 12,
    color: '#00ff00',
    marginTop: 2,
  },
  stationItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#003300',
  },
  navigateButton: {
    backgroundColor: '#003300',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#00ff00',
  },
  navigateButtonText: {
    fontFamily: 'Comic Sans MS',
    color: '#00ff00',
    fontSize: 12,
    fontWeight: 'bold',
  },
});