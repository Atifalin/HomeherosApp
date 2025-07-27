import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// List of available locations
const LOCATIONS = [
  'Kelowna',
  'Kamloops',
  'Vernon',
  'Penticton',
  'Osoyoos',
  'Oliver'
];

interface LocationSelectionProps {
  onComplete: () => void;
}

export default function LocationSelectionScreen({ onComplete }: LocationSelectionProps) {
  const { user } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
  };

  const handleContinue = async () => {
    if (!selectedLocation || !user) return;
    
    setSaving(true);
    try {
      // 1. Save to Supabase user profile
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          location: selectedLocation,
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
      
      // 2. Save to localStorage for web (or SecureStore for native)
      localStorage.setItem('userLocation', selectedLocation);
      
      // 3. Continue to main app
      onComplete();
    } catch (error) {
      console.error('Error saving location:', error);
      // Show error message to user
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Location</Text>
      <Text style={styles.subtitle}>Choose the city where you need services</Text>
      
      <ScrollView style={styles.locationsContainer}>
        {LOCATIONS.map((location) => (
          <TouchableOpacity
            key={location}
            style={[
              styles.locationButton,
              selectedLocation === location && styles.selectedLocation
            ]}
            onPress={() => handleLocationSelect(location)}
          >
            <Text 
              style={[
                styles.locationText,
                selectedLocation === location && styles.selectedLocationText
              ]}
            >
              {location}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <TouchableOpacity
        style={[
          styles.continueButton,
          (!selectedLocation || saving) && styles.disabledButton
        ]}
        onPress={handleContinue}
        disabled={!selectedLocation || saving}
      >
        <Text style={styles.continueButtonText}>
          {saving ? 'Saving...' : 'Continue'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3B5323',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
  },
  locationsContainer: {
    marginBottom: 20,
  },
  locationButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedLocation: {
    backgroundColor: 'white',
  },
  locationText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
  selectedLocationText: {
    color: '#3B5323',
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#3B5323',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
