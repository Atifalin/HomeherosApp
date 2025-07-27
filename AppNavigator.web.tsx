import React, { useState, useEffect } from 'react';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import SplashScreen from './screens/SplashScreen';
import LocationSelectionScreen from './screens/LocationSelectionScreen';
import TabNavigator from './navigation/TabNavigator.web';
import { useAuth } from './contexts/AuthContext';
import { useLocation } from './contexts/LocationContext';

// Simple web-compatible navigation context
export const NavigationContext = React.createContext({
  currentScreen: 'Splash',
  navigate: (screen: string) => {},
});

export default function AppNavigator() {
  const [currentScreen, setCurrentScreen] = useState('Splash');
  const { user, loading: authLoading } = useAuth();
  const { location, loading: locationLoading } = useLocation();
  const [initializing, setInitializing] = useState(true);

  // Handle navigation flow based on auth and location state
  useEffect(() => {
    if (initializing) return; // Wait for splash screen
    
    // Debug logging
    console.log('Navigation state:', { 
      user: !!user, 
      location, 
      authLoading, 
      locationLoading, 
      currentScreen 
    });
    
    // Show location selection if user is logged in but has no location
    if (user && !location && !locationLoading) {
      console.log('Redirecting to LocationSelection - user logged in with no location');
      setCurrentScreen('LocationSelection');
      return;
    }
    
    // Skip to main app if user is logged in and has location
    if (user && location) {
      console.log('Redirecting to Home - user logged in with location');
      setCurrentScreen('Home');
      return;
    }
    
    // Show login if user is not logged in and we're not on signup
    if (!user && !authLoading && currentScreen !== 'Signup') {
      console.log('Redirecting to Login - no user');
      setCurrentScreen('Login');
    }
  }, [user, location, authLoading, locationLoading, initializing, currentScreen]);

  const navigate = (screen: string) => {
    setCurrentScreen(screen);
  };

  const handleSplashComplete = (hasLocation: boolean) => {
    setInitializing(false);
    // Navigation will be handled by the useEffect above
  };

  const handleLocationSelected = () => {
    navigate('Home');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Splash':
        return <SplashScreen onComplete={handleSplashComplete} />;
      case 'Login':
        return <LoginScreen />;
      case 'Signup':
        return <SignupScreen />;
      case 'LocationSelection':
        return <LocationSelectionScreen onComplete={handleLocationSelected} />;
      case 'Home':
        return <TabNavigator />;
      default:
        return <LoginScreen />;
    }
  };

  return (
    <NavigationContext.Provider value={{ currentScreen, navigate }}>
      {renderScreen()}
    </NavigationContext.Provider>
  );
}

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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
