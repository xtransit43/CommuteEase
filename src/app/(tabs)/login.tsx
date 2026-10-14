import React, { useState, useEffect } from 'react';
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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      let storedUserId = null;
      let storedUsername = null;

      if (Platform.OS === 'web') {
        storedUserId = localStorage.getItem('userId');
        storedUsername = localStorage.getItem('username');
      } else {
        storedUserId = await SecureStore.getItemAsync('userId');
        storedUsername = await SecureStore.getItemAsync('username');
      }

      if (storedUserId) {
        setIsLoggedIn(true);
        setUsername(storedUsername);
      } else {
        setIsLoggedIn(false);
      }
    } catch (err) {
      setIsLoggedIn(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign in.');
      }

      if (data.requires2FA) {
        router.push({ pathname: '/2fa-verify', params: { email } });
        return;
      }

      if (data.user?.id) {
        if (Platform.OS === 'web') {
          localStorage.setItem('userId', data.user.id);
          if (data.user.username) localStorage.setItem('username', data.user.username);
        } else {
          await SecureStore.setItemAsync('userId', data.user.id);
          if (data.user.username) await SecureStore.setItemAsync('username', data.user.username);
        }
      }

      Alert.alert('Success', 'Logged in successfully!');
      setIsLoggedIn(true);
      if (data.user?.username) setUsername(data.user.username);
      router.push('/');
    } catch (err: any) {
      Alert.alert('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
      } else {
        await SecureStore.deleteItemAsync('userId');
        await SecureStore.deleteItemAsync('username');
      }
      setIsLoggedIn(false);
      setUsername(null);
      setEmail('');
      setPassword('');
      Alert.alert('Logged Out', 'You have been successfully logged out.');
    } catch (err) {
      Alert.alert('Error', 'Failed to log out cleanly.');
    }
  };

  if (checkingAuth) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>CommuteEase</Text>
          <Text style={styles.subtitle}>
            {isLoggedIn ? `Welcome back, ${username || 'Commuter'}!` : 'Welcome back! Log in to your account.'}
          </Text>
        </View>

        {isLoggedIn ? (
          <View style={styles.formContainer}>
            <View style={styles.logoutCard}>
              <Text style={styles.loggedInText}>You are currently logged in.</Text>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.buttonText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="name@example.com"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#64748b"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleLogin} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Log In</Text>
              )}
            </TouchableOpacity>

            {/* Link to sign up if user doesn't have an account */}
            <TouchableOpacity 
              style={styles.signupLinkContainer} 
              onPress={() => router.push('/signup')}
            >
              <Text style={styles.signupText}>
                Don't have an account? <Text style={styles.signupTextBold}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Drop-in style template for login.tsx and signup.tsx
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
    maxWidth: 450,
    borderWidth: 2,
    borderColor: '#ffff00',
    shadowColor: '#ffff00',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontFamily: 'Comic Sans MS',
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
    textShadowColor: '#ff00ff',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  label: {
    fontFamily: 'Comic Sans MS',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffff00',
    marginBottom: 8,
  },
  input: {
    fontFamily: 'Comic Sans MS',
    backgroundColor: '#1f1f1f',
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#00ffff',
  },
  button: {
    backgroundColor: '#00ff00',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    marginTop: 10,
  },
  buttonText: {
    fontFamily: 'Comic Sans MS',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
});