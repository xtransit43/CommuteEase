import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, ViewStyle, TextStyle } from 'react-native';

export type Station = {
  id: number | string;
  name: string;
  latitude: number;
  longitude: number;
  brand?: string;
  distanceMiles?: number;
};

type OpenGisMapWebProps = {
  location?: { latitude: number; longitude: number };
  gasStations?: Station[];
  selectedStation?: Station | null;
  onSelectStation?: (station: Station) => void;
};

export function OpenGisMapWeb({
  location = { latitude: 37.7749, longitude: -122.4194 },
  gasStations = [
    { id: 1, name: 'Grid Charging Node Alpha', latitude: 37.779, longitude: -122.415, brand: 'Tesla Supercharger', distanceMiles: 0.4 },
    { id: 2, name: 'EcoFuel Station Beta', latitude: 37.77, longitude: -122.425, brand: 'Shell Recharge', distanceMiles: 0.8 },
    { id: 3, name: 'Gamma EV Power Hub', latitude: 37.782, longitude: -122.408, brand: 'EVgo Station', distanceMiles: 1.2 },
  ],
  selectedStation: externalSelected,
  onSelectStation,
}: OpenGisMapWebProps) {
  const [internalSelected, setInternalSelected] = useState<Station | null>(gasStations[0] || null);

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
          
          <Text style={styles.canvasCenterMarker}>⊕ USER NODE</Text>

          {gasStations.map((st, idx) => {
            const isSelected = activeStation?.id === st.id;
            return (
              <Pressable
                key={st.id}
                style={[
                  styles.mapNodePin,
                  { top: `${35 + idx * 18}%`, left: `${40 + idx * 15}%` },
                  isSelected && styles.mapNodePinActive,
                  { cursor: 'pointer' } as ViewStyle,
                ]}
                onPress={() => handleSelect(st)}
              >
                <Text style={[styles.pinText, isSelected && styles.pinTextActive]}>
                  {isSelected ? `⚡ [${st.name}]` : `⬢ Node #${st.id}`}
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
          {gasStations.map((st) => {
            const isSelected = activeStation?.id === st.id;
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
                  <Text style={styles.stationName}>{st.name}</Text>
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
          })}
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
    backgroundColor: 'rgba(0,
