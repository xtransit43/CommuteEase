import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, ScrollView } from 'react-native';

export type Station = {
  id: number | string;
  name: string;
  latitude: number;
  longitude: number;
  brand?: string;
  distanceMiles?: number;
  type?: 'gas' | 'ev';
};

type OpenGisMapProps = {
  location?: { latitude: number; longitude: number };
  gasStations?: Station[];
  selectedStation?: Station | null;
  onSelectStation?: (station: Station) => void;
};

export function OpenGisMap({
  location = { latitude: 51.48, longitude: -0 },
  gasStations = [],
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
      {/* Visual Terminal Grid Canvas */}
      <View style={styles.gridCanvas}>
        <Text style={styles.gridTitle}>[GIS GRID MESH ACTIVE]</Text>
        <Text style={styles.gridSub}>
          LAT: {location.latitude.toFixed(4)} | LNG: {location.longitude.toFixed(4)}
        </Text>
      </View>

      {/* Station Selector overlay */}
      <View style={styles.stationsCard}>
        <Text style={styles.cardTitle}>
          📍 Detected Nearby Nodes ({gasStations.length})
        </Text>
        <ScrollView style={styles.stationList}>
          {gasStations.length === 0 ? (
            <Text style={styles.emptyText}>Scanning grid for active nodes...</Text>
          ) : (
            gasStations.map((st) => (
              <TouchableOpacity
                key={st.id}
                style={[
                  styles.stationItem,
                  selectedStation?.id === st.id && styles.selectedItem,
                ]}
                onPress={() => handleSelect(st)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.stationName}>
                    {st.type === 'ev' ? '⚡ ' : '⛽ '}
                    {st.name}
                  </Text>
                  <Text style={styles.stationBrand}>{st.brand || 'Independent Node'}</Text>
                </View>
                {st.distanceMiles !== undefined && (
                  <Text style={styles.distanceBadge}>{st.distanceMiles} mi</Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const terminalFont = Platform.select({
  ios: 'Courier',
  android: 'monospace',
  default: 'monospace',
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000000',
  },
  gridCanvas: {
    height: 140,
    backgroundColor: '#030d03',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#00ff00',
    padding: 16,
  },
  gridTitle: {
    fontFamily: terminalFont,
    color: '#00ff00',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  gridSub: {
    fontFamily: terminalFont,
    color: '#00cc00',
    fontSize: 12,
  },
  stationsCard: {
    flex: 1,
    padding: 12,
    backgroundColor: '#030d03',
  },
  cardTitle: {
    fontFamily: terminalFont,
    fontSize: 14,
    color: '#00ff00',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stationList: {
    maxHeight: 220,
  },
  emptyText: {
    fontFamily: terminalFont,
    color: '#008800',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
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
    fontFamily: 'monospace',
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  stationBrand: {
    fontFamily: 'monospace',
    color: '#00cc00',
    fontSize: 11,
  },
  distanceBadge: {
    fontFamily: 'monospace',
    color: '#00ff00',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default OpenGisMap;
