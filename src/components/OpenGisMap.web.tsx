import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, ViewStyle } from 'react-native';

export type Station = {
  id: number | string;
  name: string;
  latitude: number;
  longitude: number;
  brand?: string;
  distanceMiles?: number;
  type?: 'gas' | 'ev';
};

type OpenGisMapWebProps = {
  location?: { latitude: number; longitude: number };
  gasStations?: Station[];
  selectedStation?: Station | null;
  onSelectStation?: (station: Station) => void;
};

export function OpenGisMapWeb({
  // ⭐ Default location set to Greenwich, London
  location = { latitude: 51.4800, longitude: -0.0000 },
  // ⭐ Default gas stations cleared (starts empty)
  gasStations = [],
  selectedStation: externalSelected,
  onSelectStation,
}: OpenGisMapWebProps) {
  const [internalSelected, setInternalSelected] = useState<Station | null>(null);

  const activeStation = externalSelected !== undefined ? externalSelected : internalSelected;

  const handleSelect = (station: Station) => {
    setInternalSelected(station);
    if (onSelectStation) {
      onSelectStation(station);
    }
  };

  return (
    <View style={styles.webContainer}>
      {/* Interactive GIS Grid Terminal Canvas (Left Panel) */}
      <View style={styles.mapGridPanel}>
        <View style={styles.terminalHeader}>
          <Text style={styles.terminalTitle}>$ opengis --render-grid</Text>
          <Text style={styles.coordsBadge}>
            LAT: {location.latitude.toFixed(4)} | LNG: {location.longitude.toFixed(4)}
          </Text>
        </View>

        {/* Visual Simulated Vector Canvas */}
        <View style={styles.vectorCanvas}>
          <View style={styles.gridOverlayHorizontal} />
          <View style={styles.gridOverlayVertical} />
          
          <Text style={styles.canvasCenterMarker}>⊕ GREENWICH USER NODE</Text>

          {gasStations.map((st, idx) => {
            const isSelected = activeStation?.id === st.id;
            const icon = st.type === 'ev' ? '⚡' : '⛽';
            return (
              <Pressable
                key={st.id}
                style={[
                  styles.mapNodePin,
                  { top: `${35 + (idx % 4) * 15}%`, left: `${30 + (idx % 3) * 20}%` },
                  isSelected && styles.mapNodePinActive,
                  { cursor: 'pointer' } as ViewStyle,
                ]}
                onPress={() => handleSelect(st)}
              >
                <Text style={[styles.pinText, isSelected && styles.pinTextActive]}>
                  {isSelected ? `${icon} [${st.name}]` : `${icon} Node #${st.id}`}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Node Station List & Metadata (Right Panel) */}
      <View style={styles.sidebarPanel}>
        <Text style={styles.sidebarHeader}>
          📡 Nearby Grid Nodes ({gasStations.length})
        </Text>

        <ScrollView style={styles.stationList}>
          {gasStations.length === 0 ? (
            <Text style={styles.emptyText}>[NO NODES DETECTED] Scanning Greenwich sector...</Text>
          ) : (
            gasStations.map((st) => {
              const isSelected = activeStation?.id === st.id;
              const icon = st.type === 'ev' ? '⚡' : '⛽';
              return (
                <Pressable
                  key={st.id}
                  style={[
                    styles.stationCard, 
                    isSelected && styles.selectedStationCard,
                    { cursor: 'pointer' } as ViewStyle
                  ]}
                  onPress={() => handleSelect(st)}
                >
                  <View style={styles.stationInfo}>
                    <Text style={styles.stationName}>
                      {icon} {st.name}
                    </Text>
                    <Text style={styles.stationBrand}>{st.brand || 'Independent Node'}</Text>
                    <Text style={styles.stationCoords}>
                      {st.latitude.toFixed(4)}, {st.longitude.toFixed(4)}
                    </Text>
                  </View>

                  {st.distanceMiles !== undefined && (
                    <View style={styles.distanceBadge}>
                      <Text style={styles.distanceText}>{st.distanceMiles} mi</Text>
                    </View>
                  )}
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    minHeight: 400,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#00ff00',
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapGridPanel: {
    flex: 2,
    backgroundColor: '#020b02',
    borderRightWidth: 2,
    borderColor: '#00ff00',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
  },
  terminalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: '#006600',
  },
  terminalTitle: {
    fontFamily: 'monospace',
    color: '#00ff00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  coordsBadge: {
    fontFamily: 'monospace',
    color: '#00cc00',
    fontSize: 12,
    backgroundColor: '#002200',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#00aa00',
  },
  vectorCanvas: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#004400',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  gridOverlayHorizontal: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(0, 255, 0, 0.15)',
  },
  gridOverlayVertical: {
    position: 'absolute',
    height: '100%',
    width: 1,
    backgroundColor: 'rgba(0, 255, 0, 0.15)',
  },
  canvasCenterMarker: {
    position: 'absolute',
    fontFamily: 'monospace',
    color: '#00ff00',
    fontSize: 11,
    fontWeight: 'bold',
    opacity: 0.8,
  },
  mapNodePin: {
    position: 'absolute',
    backgroundColor: '#001100',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#006600',
  },
  mapNodePinActive: {
    backgroundColor: '#003300',
    borderColor: '#00ff00',
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  pinText: {
    fontFamily: 'monospace',
    color: '#00aa00',
    fontSize: 12,
  },
  pinTextActive: {
    color: '#00ff00',
    fontWeight: 'bold',
  },
  sidebarPanel: {
    flex: 1,
    backgroundColor: '#030d03',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarHeader: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#00ff00',
    fontWeight: 'bold',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: '#006600',
  },
  stationList: {
    flex: 1,
  },
  emptyText: {
    fontFamily: 'monospace',
    color: '#008800',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  stationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#003300',
  },
  selectedStationCard: {
    borderColor: '#00ff00',
    backgroundColor: 'rgba(0, 255, 0, 0.08)',
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontFamily: 'monospace',
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  stationBrand: {
    fontFamily: 'monospace',
    color: '#00cc00',
    fontSize: 11,
    marginBottom: 2,
  },
  stationCoords: {
    fontFamily: 'monospace',
    color: '#007700',
    fontSize: 10,
  },
  distanceBadge: {
    backgroundColor: '#002200',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#006600',
  },
  distanceText: {
    fontFamily: 'monospace',
    color: '#00ff00',
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default OpenGisMapWeb;
