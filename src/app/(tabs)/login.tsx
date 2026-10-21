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
      Alert.alert('Logged Out', 'Session terminated successfully.');
    } catch (err) {
      Alert.alert('Error', 'Failed to clear session.');
    }
  };

  if (checkingAuth) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#00ff00" />
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
          <Text style={styles.title}>$ auth --login</Text>
          <Text style={styles.subtitle}>
            {isLoggedIn ? `Access Granted: ${username || 'Commuter'}` : 'Authenticate to access your secure terminal.'}
          </Text>
        </View>

        {isLoggedIn ? (
          <View style={styles.formContainer}>
            <View style={styles.logoutCard}>
              <Text style={styles.loggedInText}>Session active.</Text>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.buttonText}>Terminate Session</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.label}>EMAIL IDENTIFIER</Text>
            <TextInput
              style={styles.input}
              placeholder="user@commute-ease.net"
              placeholderTextColor="#005500"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>PASSWORD KEY</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••••••"
              placeholderTextColor="#005500"
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
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.buttonText}>Authorize</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.signupLinkContainer} 
              onPress={() => router.push('/signup')}
            >
              <Text style={styles.signupText}>
                No account? <Text style={styles.signupTextBold}>Initialize Signup</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  logoutCard: {
    alignItems: 'center',
  },
  loggedInText: {
    fontFamily: 'Comic Sans MS',
    color: '#00ff00',
    marginBottom: 16,
    fontSize: 15,
  },
  logoutButton: {
    backgroundColor: '#003300',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00ff00',
  },
  signupLinkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  signupText: {
    fontFamily: 'Comic Sans MS',
    color: '#00aa00',
    fontSize: 14,
  },
  signupTextBold: {
    color: '#00ff00',
    fontWeight: 'bold',
  },
});