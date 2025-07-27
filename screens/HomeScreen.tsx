import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useLocation } from '../contexts/LocationContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContext } from '../AppNavigator.web';

export default function HomeScreen({ navigation }) {
  const { location } = useLocation();
  // Get web navigation context if available
  const webNavigation = useContext(NavigationContext);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.locationBubble}
          onPress={() => {
            console.log('Location bubble clicked');
            if (Platform.OS === 'web') {
              // Use web navigation with forceShow flag to prevent auto-redirect
              webNavigation.navigate('LocationSelection', { forceShow: true });
            } else {
              // Use React Navigation with params
              navigation.navigate('LocationSelection', { forceShow: true });
            }
          }}
        >
          <Ionicons name="location" size={18} color="white" style={styles.locationIcon} />
          <Text style={styles.locationText}>{location || 'Select Location'}</Text>
          <Ionicons name="chevron-down" size={16} color="white" style={styles.locationChevron} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to HomeHeros</Text>
        <Text style={styles.subtitle}>Your home service experts</Text>
        
        <View style={styles.servicesContainer}>
          <Text style={styles.sectionTitle}>Popular Services</Text>
          {/* Placeholder for service cards */}
          <View style={styles.serviceCard}>
            <Text style={styles.serviceTitle}>Plumbing</Text>
          </View>
          <View style={styles.serviceCard}>
            <Text style={styles.serviceTitle}>Electrical</Text>
          </View>
          <View style={styles.serviceCard}>
            <Text style={styles.serviceTitle}>Cleaning</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#3B5323',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  locationBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    }),
  },
  locationIcon: {
    marginRight: 6,
  },
  locationChevron: {
    marginLeft: 6,
  },
  locationText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3B5323',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  servicesContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B5323',
    marginBottom: 16,
  },
  serviceCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    }),
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
