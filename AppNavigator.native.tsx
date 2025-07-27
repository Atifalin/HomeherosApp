import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import SplashScreen from './screens/SplashScreen';
import LocationSelectionScreen from './screens/LocationSelectionScreen';
import TabNavigator from './navigation/TabNavigator';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from './contexts/AuthContext';
import { useLocation } from './contexts/LocationContext';

// Native-specific stack navigator
const Stack = createNativeStackNavigator();

// Custom splash screen wrapper to handle navigation logic

// Custom splash screen wrapper to handle navigation logic
function SplashScreenWrapper({ navigation }) {
  const handleSplashComplete = (hasLocation) => {
    // Navigation will be handled by the auth state listener
  };
  
  return <SplashScreen onComplete={handleSplashComplete} />;
}

// Custom location selection wrapper
function LocationScreenWrapper({ navigation }) {
  const handleLocationSelected = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };
  
  return <LocationSelectionScreen onComplete={handleLocationSelected} />;
}

export default function AppNavigator() {
  const { user, loading: authLoading } = useAuth();
  const { location, loading: locationLoading } = useLocation();
  const [initialRoute, setInitialRoute] = useState('Splash');
  const [isReady, setIsReady] = useState(false);
  
  // Determine the initial route based on auth and location state
  useEffect(() => {
    const prepareApp = async () => {
      // Wait for auth and location to load
      if (authLoading || locationLoading) return;
      
      if (user) {
        if (location) {
          setInitialRoute('Home');
        } else {
          setInitialRoute('LocationSelection');
        }
      } else {
        setInitialRoute('Login');
      }
      
      setIsReady(true);
    };
    
    prepareApp();
  }, [user, location, authLoading, locationLoading]);
  
  if (!isReady) {
    // Show nothing while determining the initial route
    return null;
  }
  
  return (
    <NavigationContainer>
      <Stack.Navigator
        id={undefined}
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreenWrapper} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="LocationSelection" component={LocationScreenWrapper} />
        <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3B5323',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 32,
  },
  location: {
    fontSize: 16,
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 32,
  },
  button: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#3B5323',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
