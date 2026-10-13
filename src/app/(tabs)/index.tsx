import { Text, View, StyleSheet, Image } from "react-native";
import { Link } from 'expo-router';
import { useEffect } from 'react';
import { fetch } from 'expo/fetch';

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



  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the CommuteEase App</Text>
      <Image
        source={{ uri: 'https://t4.ftcdn.net/jpg/02/65/42/55/360_F_265425516_wtAw64cGdOVvrdl64b5bsyBqcD0rkw1W.jpg' }}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  text: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: 0.5,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  image: {
    width: '80%',
    height: '40%',
    borderRadius: 16,
  },
});