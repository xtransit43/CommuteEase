import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function SignupScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Error', 'Please fill out all required fields.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      // 1. Fetching your signup endpoint
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account.');
      }

      // 2. Persist active user session upon account creation
      if (data.user?.id) {
        if (Platform.OS === 'web') {
          localStorage.setItem('userId', data.user.id);
          if (data.user.username) localStorage.setItem('username', data.user.username);
          window.dispatchEvent(new Event('storage')); // ⭐ Trigger instant layout nav update
        } else {
          await SecureStore.setItemAsync('userId', data.user.id);
          if (data.user.username) await SecureStore.setItemAsync('username', data.user.username);
        }
      }

      Alert.alert('Success', 'Account registered successfully!');
      router.push('/'); // Navigate straight to home/maps with active session
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>$ useradd --register</Text>
          <Text style={styles.subtitle}>Provision a new commuter profile</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>USERNAME HANDLE</Text>
          <TextInput
            style={styles.input}
            placeholder="commuter_x"
            placeholderTextColor="#005500"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />

          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <TextInput
            style={styles.input}
            placeholder="user@commute-ease.net"
            placeholderTextColor="#005500"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>SECURE PASSWORD</Text>
          <TextInput
            style={styles.input}
            placeholder="Min 8 characters"
            placeholderTextColor="#005500"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleRegister} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.buttonText}>Execute Signup</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginLinkContainer} 
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginText}>
              Existing user? <Text style={styles.loginTextBold}>Authenticate</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 450,
    alignSelf: 'center',
  },
  headerContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Comic Sans MS',
    fontSize: 26,
    fontWeight: 'bold',
    color: '#00ff00',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: '#00ff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontFamily: 'Comic Sans MS',
    fontSize: 14,
    color: '#00cc00',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    backgroundColor: '#030d03',
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#00ff00',
  },
  label: {
    fontFamily: 'Comic Sans MS',
    fontSize: 13,
    fontWeight: 'bold',
    color: '#00ff00',
    marginBottom: 6,
  },
  input: {
    fontFamily: 'Comic Sans MS',
    backgroundColor: '#000000',
    color: '#00ff00',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    fontSize: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#008800',
  },
  button: {
    backgroundColor: '#00ff00',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: 'Comic Sans MS',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  loginLinkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    fontFamily: 'Comic Sans MS',
    color: '#00aa00',
    fontSize: 14,
  },
  loginTextBold: {
    color: '#00ff00',
    fontWeight: 'bold',
  },
});
