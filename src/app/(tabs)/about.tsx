import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';

export default function AboutScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>About CommuteEase</Text>
        <Text style={styles.text}>
          CommuteEase is built with modern cross-platform technologies including Expo Router, Prisma, and PostgreSQL. It delivers real-time spatial positioning using the Overpass API, secure 2FA authentication, and vehicle profile customization.
        </Text>
        <Text style={styles.text}>
          Whether you drive a gas-powered vehicle or an electric car, CommuteEase ensures you always find the closest station with high-contrast clarity!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#050505',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#121212',
    borderRadius: 24,
    padding: 36,
    width: '100%',
    maxWidth: 600,
    borderWidth: 2,
    borderColor: '#00ffff',
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontFamily: 'Comic Sans MS',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: '#ff00ff',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  text: {
    fontFamily: 'Comic Sans MS',
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 26,
    marginBottom: 16,
    textAlign: 'center',
  },
});