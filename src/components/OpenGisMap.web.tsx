import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

export type Station = {
  id: number | string;
  name: string;
  latitude: number;
  longitude: number;
  brand?: string;
  distanceMiles?: number;
};

type OpenGisMapProps = {
  location?: { latitude: number; longitude: number };
  onSelectStation?: (station: Station) => void;
};

export default function OpenGisMap({ onSelectStation }: OpenGisMapProps) {
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [loadingStations, setLoadingStations] = useState<boolean>(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // 1. Live GPS tracking via HTML5 Geolocation API
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ latitude, longitude });
        setGpsError(null);
      },
      (err) => {
        setGpsError('GPS Access Denied or Unavailable.');
        console.warn('Geolocation error:', err);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // 2. Fetch nearest gas and EV charging stations when coordinates are updated
  useEffect(() => {
    if (!userCoords) return;
    fetchNearbyGasStations(userCoords.latitude, userCoords.longitude);
  }, [userCoords?.latitude, userCoords?.longitude]);

  // Haversine formula to compute distance in miles
  const calculateDistanceMiles = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3958.8; // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  };

  const fetchNearbyGasStations = async (lat: number, lon: number) => {
    try {
      setLoadingStations(true);
      // Query Overpass API for fuel & charging nodes within 5km (~3 miles)
      const query = `
        [out:json][timeout:10];
        (
          node["amenity"="fuel"](around:5000, ${lat}, ${lon});
          node["amenity"="charging_station"](around:5000, ${lat}, ${lon});
        );
        out body 10;
      `;
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data && data.elements) {
        const parsedStations: Station[] = data.elements.map((el: any) => ({
          id: el.id,
          name: el.tags?.name || el.tags?.brand || 'Fuel & Energy Node',
          brand: el.tags?.brand || el.tags?.operator || 'Independent Grid Node',
          latitude: el.lat,
          longitude: el.lon,
          distanceMiles: calculateDistanceMiles(lat, lon, el.lat, el.lon),
        }));

        parsedStations.sort((a, b) => (a.distanceMiles || 0) - (b.distanceMiles || 0));
        setStations(parsedStations);
      }
    } catch (err) {
      console.error('Failed to query Overpass API:', err);
    } finally {
      setLoadingStations(false);
    }
  };

  const activeLat = selectedStation?.latitude || userCoords?.latitude || 37.7749;
  const activeLon = selectedStation?.longitude || userCoords?.longitude || -122.4194;

  const delta = 0.015;
  const bbox = `${activeLon - delta},${activeLat - delta},${activeLon + delta},${activeLat + delta}`;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${activeLat},${activeLon}`;

  const handleSelect = (station: Station) => {
    setSelectedStation(station);
    if (onSelectStation) onSelectStation(station);
  };

  return (
    <View style={styles.container}>
      {/* Interactive Dark Terminal OpenStreetMap Embed */}
      <iframe
        src={mapUrl}
        style={{
          width: '100%',
          height: '280px',
          border: 'none',
          filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(120%)',
        }}
        title="Live GPS Grid Map"
      />

      {/* GPS Status Telemetry Badge */}
      <View style={styles.gpsBadge}>
        <Text style={styles.gpsBadgeText}>
          {userCoords
            ? `🟢 GPS Lock: ${userCoords.latitude.toFixed(4)}, ${userCoords.longitude.toFixed(4)}`
            : gpsError || '📡 Acquiring GPS Lock...'}
        </Text>
      </View>

      {/* Nearby Stations List */}
      <View style={styles.stationsCard}>
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>⛽ Nearest Grid Stations ({stations.length})</Text>
          {loadingStations && <ActivityIndicator size="small" color="#00ff00" />}
        </View>

        {stations.length === 0 && !loadingStations ? (
          <Text style={styles.noDataText}>Scanning surrounding area within 3 miles...</Text>
        ) : (
          stations.slice(0, 4).map((st) => (
            <TouchableOpacity
              key={st.id}
              style={[
                styles.stationItem,
                selectedStation?.id === st.id && styles.selectedItem,
              ]}
              onPress={() => handleSelect(st)}
            >
              <View>
                <Text style={styles.stationName}>{st.name}</Text>
                <Text style={styles.stationBrand}>{st.brand}</Text>
              </View>
              <Text style={styles.distanceBadge}>{st.distanceMiles} mi</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000000',
  },
  gpsBadge: {
    backgroundColor: '#030d03',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: '#00ff00',
  },
  gpsBadgeText: {
    fontFamily: 'Comic Sans MS',
    color: '#00ff00',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stationsCard: {
    padding: 12,
    backgroundColor: '#030d03',
    borderTopWidth: 1,
    borderColor: '#008800',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: 'Comic Sans MS',
    fontSize: 14,
    color: '#00ff00',
    fontWeight: 'bold',
  },
  noDataText: {
    fontFamily: 'Comic Sans MS',
    color: '#008800',
    fontSize: 12,
  },
  stationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 6,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#003300',
  },
  selectedItem: {
    borderColor: '#00ff00',
    backgroundColor: 'rgba(0,255,0,0.1)',
  },
  stationName: {
    fontFamily: 'Comic Sans MS',
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  stationBrand: {
    fontFamily: 'Comic Sans MS',
    color: '#00cc00',
    fontSize: 11,
  },
  distanceBadge: {
    fontFamily: 'Comic Sans MS',
    color: '#00ff00',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
