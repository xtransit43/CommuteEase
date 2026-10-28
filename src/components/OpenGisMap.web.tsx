import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

type Station = {
  id: number | string;
  name: string;
  latitude: number;
  longitude: number;
  brand: string;
};

type OpenGisMapProps = {
  location: {
    latitude: number;
    longitude: number;
  };
  gasStations?: Station[];
};

export default function OpenGisMap({ location }: OpenGisMapProps) {
  const lat = location?.latitude || 37.7749;
  const lon = location?.longitude || -122.4194;
  
  // Calculate bounding box for OpenStreetMap embed
  const delta = 0.01;
  const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;

  return (
    <View style={styles.container}>
      {/* Web iframe rendering OpenStreetMap with a dark-mode terminal filter */}
      <iframe
        src={mapUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(120%)',
        }}
        title="GIS Map Grid"
      />
      <View style={styles.overlayBadge} pointerEvents="none">
        <Text style={styles.badgeText}>[GIS MESH ACTIVE]</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: 320,
    backgroundColor: '#000000',
    position: 'relative',
  },
  overlayBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 20, 0, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#00ff00',
  },
  badgeText: {
    fontFamily: 'Comic Sans MS',
    color: '#00ff00',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
