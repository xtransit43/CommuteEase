import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

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
  gasStations?: Station[];
  selectedStation?: Station | null;
  onSelectStation?: (station: Station) => void;
};

export default function OpenGisMap({
  location = { latitude: 37.7749, longitude: -122.4194 },
  gasStations = [
    { id: 1, name: 'Grid Charging Node Alpha', latitude: 37.779, longitude: -122.415, brand: 'Tesla Supercharger', distanceMiles: 0.4 },
    { id: 2, name: 'EcoFuel Station Beta', latitude: 37.77, longitude: -122.425, brand: 'Shell Recharge', distanceMiles: 0.8 },
  ],
  selectedStation,
  onSelectStation,
}: OpenGisMapProps) {

  const handleSelect = (station: Station) => {
    if (onSelectStation) {
      onSelectStation(station);
    }
  };

  return (
    <View style={styles.container}>
      {/* Visual Terminal Grid Canvas Placeholder for Native */}
      <View style={styles.gridCanvas}>
        <Text style={styles.gridTitle}>[GIS GRID MESH ACTIVE]</Text>
        <Text style={styles.gridSub}>
          LAT: {location.latitude.toFixed(4)} | LNG: {location.longitude.toFixed(4)}
        </Text>
      </View>

      {/* Station Selector overlay */}
      <View style={styles.stationsCard}>
        <Text style={styles.cardTitle}>⛽ Detected Nearby Nodes ({gasStations.length})</Text>
        <View style={styles.stationList}>
          {gasStations.map((st) => (
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
                <Text style={styles.stationBrand}>{st.brand || 'Independent Node'}</Text>
              </View>
              {st.distanceMiles !== undefined && (
                <Text style={styles.distanceBadge}>{st.distanceMiles} mi</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000000',
  },
  gridCanvas: {
    height: 180,
    backgroundColor: '#030d03',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#00ff00',
    padding: 16,
  },
  gridTitle: {
    fontFamily: 'Comic Sans MS',
    color: '#00ff00',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    textShadowColor: '#00ff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  gridSub: {
    fontFamily: 'Comic Sans MS',
    color: '#00cc00',
    fontSize: 12,
  },
  stationsCard: {
    padding: 12,
    backgroundColor: '#030d03',
    borderTopWidth: 1,
    borderColor: '#008800',
  },
  cardTitle: {
    fontFamily: 'Comic Sans MS',
    fontSize: 14,
    color: '#00ff00',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stationList: {
    maxHeight: 160,
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
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
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
