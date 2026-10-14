import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

interface GasStation {
  id: number;
  name: string;
  brand?: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
}

interface OpenGisMapProps {
  location?: { latitude: number; longitude: number } | null;
  gasStations?: GasStation[];
}

export default function OpenGisMap({ location, gasStations = [] }: OpenGisMapProps) {
  const initialRegion = {
    latitude: location?.latitude || 51.4769,
    longitude: location?.longitude || 0.0000,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        region={
          location
            ? {
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
            : initialRegion
        }
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* Render markers for nearby gas/charging stations */}
        {gasStations.map((station) => (
          <Marker
            key={station.id}
            coordinate={{
              latitude: station.latitude,
              longitude: station.longitude,
            }}
            title={station.name}
            description={station.brand ? `Brand: ${station.brand}` : 'Nearby Station'}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});