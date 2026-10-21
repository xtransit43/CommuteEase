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
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function TwoFactorVerifyScreen() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;
  const userId = params.userId as string;

  const handleVerify2FA = async () => {
    if (!token || token.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email, token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code.');
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

      Alert.alert('Success', '2FA verified successfully!');
      router.replace('/');
    } catch (err: any) {
      Alert.alert('Verification Failed', err.message);
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
          <Text style={styles.title}>$ 2fa --verify</Text>
          <Text style={styles.subtitle}>
            Enter 6-digit TOTP key{email ? ` for ${email}` : ''}.
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>TOTP TOKEN</Text>
          <TextInput
            style={styles.input}
            placeholder="000000"
            placeholderTextColor="#005500"
            keyboardType="number-pad"
            maxLength={6}
            value={token}
            onChangeText={setToken}
          />

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleVerify2FA} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.buttonText}>Confirm Key</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backLinkContainer} 
            onPress={() => router.push('/login')}
          >
            <Text style={styles.backText}>
              Return to <Text style={styles.backTextBold}>Log In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    maxWidth: 450,
    alignSelf: 'center',
    width: '100%',
  },
  headerContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Comic Sans MS',
    fontSize: 26,
    fontWeight: '700',
    color: '#00ff00',
    marginBottom: 8,
    textAlign: 'center',
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
    fontWeight: '600',
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
    fontSize: 20,
    letterSpacing: 6,
    textAlign: 'center',
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
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  backLinkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  backText: {
    fontFamily: 'Comic Sans MS',
    color: '#00aa00',
    fontSize: 14,
  },
  backTextBold: {
    fontFamily: 'Comic Sans MS',
    color: '#00ff00',
    fontWeight: '600',
  },
});