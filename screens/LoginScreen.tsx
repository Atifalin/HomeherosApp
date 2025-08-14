import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

// Import NavigationContext properly for web
let NavigationContext: React.Context<any> | undefined;
if (Platform.OS === 'web') {
  try {
    NavigationContext = require('../AppNavigator.web').NavigationContext;
  } catch (error) {
    console.warn('Failed to import NavigationContext:', error);
  }
}

export default function LoginScreen({ navigation }: { navigation?: any }) {
  // Use platform-specific navigation
  let webNavigation = null;
  try {
    if (Platform.OS === 'web' && NavigationContext) {
      webNavigation = useContext(NavigationContext);
    }
  } catch (error) {
    console.warn('Error accessing NavigationContext:', error);
  }
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    setSubmitting(true);
    setError(null);
    const { error } = await signIn(email, password);
    if (error) setError(error.message);
    setSubmitting(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#888"
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={submitting || loading}
      >
        {submitting ? <ActivityIndicator color="#3B5323" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>
      
      {/* HomeherosGo Button */}
      <TouchableOpacity
        style={styles.homeherosGoButton}
        onPress={() => {
          if (Platform.OS === 'web') {
            // For web, use custom navigation event
            if (webNavigation && webNavigation.navigate) {
              webNavigation.navigate('HomeherosGoOnboarding');
            } else {
              // Direct approach: dispatch a custom event that AppNavigator can listen to
              window.dispatchEvent(new CustomEvent('navigate', { 
                detail: { screen: 'HomeherosGoOnboarding' } 
              }));
            }
          } else if (navigation) {
            navigation.navigate('HomeherosGoOnboarding');
          }
        }}
      >
        <Text style={styles.homeherosGoButtonText}>🚀 Join HomeherosGo</Text>
        <Text style={styles.homeherosGoSubtext}>Become a service provider</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Don't have an account?{' '}
        <Text 
          style={styles.link} 
          onPress={() => {
            // For web navigation
            if (Platform.OS === 'web') {
              window.dispatchEvent(new CustomEvent('navigate', {
                detail: { screen: 'Signup' }
              }));
            } else {
              // For native navigation
              navigation?.navigate('Signup');
            }
          }}
        >
          Sign up
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  title: {
    color: '#3B5323',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#3B5323',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  footer: {
    marginTop: 20,
    textAlign: 'center',
  },
  link: {
    color: '#3B5323',
    textDecorationLine: 'underline',
  },
  homeherosGoButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
    width: '100%',
    boxShadow: '0 4px 8px rgba(255, 107, 53, 0.3)',
    elevation: 8,
  },
  homeherosGoButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  homeherosGoSubtext: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
  },
});
