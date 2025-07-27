import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SpecialServicesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Special Services</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Premium Home Services</Text>
        <Text style={styles.subtitle}>Exclusive services for your home</Text>
        
        <View style={styles.servicesContainer}>
          {/* Placeholder for special service cards */}
          <View style={styles.serviceCard}>
            <Text style={styles.serviceTitle}>Home Renovation</Text>
            <Text style={styles.serviceDescription}>Complete home makeover services</Text>
          </View>
          
          <View style={styles.serviceCard}>
            <Text style={styles.serviceTitle}>Smart Home Installation</Text>
            <Text style={styles.serviceDescription}>Transform your home with smart technology</Text>
          </View>
          
          <View style={styles.serviceCard}>
            <Text style={styles.serviceTitle}>Landscaping</Text>
            <Text style={styles.serviceDescription}>Professional outdoor space design</Text>
          </View>
          
          <View style={styles.serviceCard}>
            <Text style={styles.serviceTitle}>Custom Furniture</Text>
            <Text style={styles.serviceDescription}>Bespoke furniture design and creation</Text>
          </View>
        </View>
      </ScrollView>
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
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
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
  serviceCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B5323',
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
  },
});
