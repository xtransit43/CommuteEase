import { Text, View, StyleSheet } from "react-native";
import React, { useEffect } from 'react';
import { TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.title}>$ ./commute-ease.sh</Text>
        <Text style={styles.subtitle}>
          [SYSTEM ONLINE] Ultimate cross-platform GIS terminal for tracking live routes and scanning nearby gas/EV charging grid nodes.
        </Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/maps')}>
            <Text style={styles.buttonText}>⚡ Launch GIS Grid</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/login')}>
            <Text style={styles.buttonText}>🔒 Authenticate</Text>
          </TouchableOpacity>
        </View>
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
  heroCard: {
    backgroundColor: '#030d03',
    borderRadius: 16,
    padding: 36,
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
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
    marginBottom: 16,
    textShadowColor: '#00ff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontFamily: 'Comic Sans MS',
    fontSize: 15,
    color: '#00cc00',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryButton: {
    backgroundColor: '#00ff00',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: '#003300',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00ff00',
  },
  buttonText: {
    fontFamily: 'Comic Sans MS',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
});