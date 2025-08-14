import React, { useState, useEffect } from 'react';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import SplashScreen from './screens/SplashScreen';
import LocationSelectionScreen from './screens/LocationSelectionScreen';
import HomeherosGoOnboardingScreen from './screens/HomeherosGoOnboardingScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import TabNavigator from './navigation/TabNavigator.web';
import { useAuth } from './contexts/AuthContext';
import { useLocation } from './contexts/LocationContext';

// Simple web-compatible navigation context
export const NavigationContext = React.createContext({
  currentScreen: 'Splash',
  navigate: (screen: string, params?: any) => {},
});

export default function AppNavigator() {
  const [currentScreen, setCurrentScreen] = useState('Splash');
  const [screenParams, setScreenParams] = useState<any>(null);
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
      currentScreen,
      screenParams
    });
    
    // Check if we're explicitly navigating to LocationSelection with forceShow flag
    if (currentScreen === 'LocationSelection' && screenParams?.forceShow) {
      console.log('Showing LocationSelection with forceShow flag');
      return; // Don't redirect
    }
    
    // Allow HomeherosGo onboarding without authentication
    if (currentScreen === 'HomeherosGoOnboarding') {
      console.log('Staying on HomeherosGo onboarding screen');
      return;
    }
    
    // Allow AdminDashboard access for authenticated users
    if (currentScreen === 'AdminDashboard') {
      console.log('Staying on AdminDashboard screen');
      return;
    }
    
    // Show location selection if user is logged in but has no location
    if (user && !location && !locationLoading) {
      console.log('Redirecting to LocationSelection - user logged in with no location');
      setCurrentScreen('LocationSelection');
      setScreenParams(null);
      return;
    }
    
    // Show main app if user is logged in and has location (but only if not on a specific screen)
    if (user && location && currentScreen === 'Splash') {
      console.log('Redirecting to Home - user logged in with location');
      setCurrentScreen('Home');
      setScreenParams(null);
      return;
    }
    
    // Show login if no user (but not if on signup or HomeherosGo onboarding)
    if (!user && !authLoading && currentScreen !== 'Signup' && currentScreen !== 'HomeherosGoOnboarding') {
      console.log('Redirecting to Login - no user');
      setCurrentScreen('Login');
      setScreenParams(null);
      return;
    }
  }, [user, location, authLoading, locationLoading, initializing, currentScreen, screenParams]);

  const navigate = (screen: string, params?: any) => {
    console.log('Navigating to', screen, 'with params:', params);
    setCurrentScreen(screen);
    setScreenParams(params);
  };

  // Listen for custom navigation events from components
  useEffect(() => {
    const handleNavigationEvent = (event: CustomEvent) => {
      console.log('Custom navigation event received:', event.detail);
      if (event.detail && event.detail.screen) {
        navigate(event.detail.screen, event.detail.params);
      }
    };

    window.addEventListener('navigate', handleNavigationEvent as EventListener);
    
    return () => {
      window.removeEventListener('navigate', handleNavigationEvent as EventListener);
    };
  }, []);

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
      case 'HomeherosGoOnboarding':
        return <HomeherosGoOnboardingScreen />;
      case 'AdminDashboard':
        return <AdminDashboardScreen />;
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
