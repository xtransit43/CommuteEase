import { Text, View, StyleSheet, Image } from "react-native";
import { Link } from 'expo-router';
import { useEffect } from 'react';
import { fetch } from 'expo/fetch';
import React from 'react';
import { TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  useEffect(() => {
    const fetchData = async() => {
      try{
        const response = await fetch('https://httpbin.org/drip', {
          headers: { Accept: 'text/event-stream'},
        });
        const reader = response.body.getReader();
        const chunks = [];
        while(true){
          const { done, value } = await reader.read();
          if(done){
            break;
          }
          chunks.push(value);
        }
        const buffer = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for(const chunk of chunks){
          buffer.set(chunk, offset);
          offset += chunk.length;
        }
        const text = new TextDecoder().decode(buffer);


      }
      catch(error){
        console.error('Failed to read in Stream', error);
      }
      
    }
    fetchData();

    
  }, []);

const router = useRouter();

 return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.title}>Welcome to CommuteEase!</Text>
        <Text style={styles.subtitle}>
          Your ultimate cross-platform GIS companion for tracking live routes and finding nearby gas or EV charging stations in style.
        </Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/maps')}>
            <Text style={styles.buttonText}>🚀 Launch Map</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/login')}>
            <Text style={styles.buttonText}>🔑 Log In</Text>
          </TouchableOpacity>
        </View>
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
  heroCard: {
    backgroundColor: '#121212',
    borderRadius: 24,
    padding: 36,
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff00ff',
    shadowColor: '#ff00ff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontFamily: 'Comic Sans MS',
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontFamily: 'Comic Sans MS',
    fontSize: 16,
    color: '#ffffff',
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
    backgroundColor: '#00ffff',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: '#ff00ff',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  buttonText: {
    fontFamily: 'Comic Sans MS',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
});