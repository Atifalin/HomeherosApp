import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';

// In a real app, you would have a proper logo image
// For now, we'll use a text placeholder that fades in/out
export default function SplashScreen({ onComplete }: { onComplete: (hasLocation: boolean) => void }) {
  const { user } = useAuth();
  const { location } = useLocation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: Platform.OS !== 'web', // Only use native driver on native platforms
      }),
      // Hold for a moment
      Animated.delay(1000),
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: Platform.OS !== 'web', // Only use native driver on native platforms
      }),
    ]).start(() => {
      // After animation completes, check if user has a location
      const hasLocation = !!location;
      console.log('SplashScreen: User has location?', hasLocation, 'Location:', location);
      onComplete(hasLocation);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Replace with actual logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>HomeHeros</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3B5323', // Military green
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
});
