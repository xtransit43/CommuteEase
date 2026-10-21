import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';

export default function AboutScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>$ man commute-ease</Text>
        <Text style={styles.text}>
          CommuteEase is engineered with modern cross-platform tech including Expo Router, Prisma, and PostgreSQL. It executes real-time spatial positioning via the Overpass API, secure 2FA authentication, and custom vehicle profiles.
        </Text>
        <Text style={styles.text}>
          Whether operating a gas powertrain or an electric vehicle node, CommuteEase ensures secure navigation with high-contrast terminal clarity!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#030d03',
    borderRadius: 16,
    padding: 36,
    width: '100%',
    maxWidth: 600,
    borderWidth: 2,
    borderColor: '#00ff00',
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontFamily: 'Comic Sans MS',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00ff00',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: '#00ff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  text: {
    fontFamily: 'Comic Sans MS',
    fontSize: 15,
    color: '#00cc00',
    lineHeight: 26,
    marginBottom: 16,
    textAlign: 'center',
  },
});