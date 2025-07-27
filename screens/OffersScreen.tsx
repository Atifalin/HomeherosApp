import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define navigation prop type
type NavigationProp = {
  navigate: (screen: string) => void;
};

export default function OffersScreen({ navigation }: { navigation?: NavigationProp }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Special Offers</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Current Promotions</Text>
        <Text style={styles.subtitle}>Limited time offers and discounts</Text>
        
        <View style={styles.offersContainer}>
          {/* Placeholder for offer cards */}
          <View style={styles.offerCard}>
            <View style={styles.offerBadge}>
              <Text style={styles.offerBadgeText}>20% OFF</Text>
            </View>
            <Text style={styles.offerTitle}>Summer Special</Text>
            <Text style={styles.offerDescription}>Get 20% off all plumbing services this summer</Text>
            <Text style={styles.offerExpiry}>Expires: Aug 31, 2023</Text>
          </View>
          
          <View style={styles.offerCard}>
            <View style={styles.offerBadge}>
              <Text style={styles.offerBadgeText}>FREE</Text>
            </View>
            <Text style={styles.offerTitle}>Free Consultation</Text>
            <Text style={styles.offerDescription}>Book a free home renovation consultation</Text>
            <Text style={styles.offerExpiry}>Expires: Sept 15, 2023</Text>
          </View>
          
          <View style={styles.offerCard}>
            <View style={styles.offerBadge}>
              <Text style={styles.offerBadgeText}>BOGO</Text>
            </View>
            <Text style={styles.offerTitle}>Buy One Get One</Text>
            <Text style={styles.offerDescription}>Book one cleaning service, get another free</Text>
            <Text style={styles.offerExpiry}>Expires: Oct 1, 2023</Text>
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
  offersContainer: {
    marginTop: 20,
  },
  offerCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  offerBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#3B5323',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
  },
  offerBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B5323',
    marginBottom: 8,
    marginTop: 10,
  },
  offerDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  offerExpiry: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});
