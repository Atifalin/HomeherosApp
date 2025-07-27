import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContext } from '../AppNavigator.web';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import SpecialServicesScreen from '../screens/SpecialServicesScreen';
import OffersScreen from '../screens/OffersScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Web-specific tab navigator that doesn't use React Navigation
export default function TabNavigator() {
  const [activeTab, setActiveTab] = useState('Home');
  const webNavigation = useContext(NavigationContext);

  // Render the active screen based on the selected tab
  const renderScreen = () => {
    // Create a navigation object that can handle both tab navigation and screen navigation
    const navigationProxy = {
      navigate: (screen: string) => {
        console.log('Navigation requested to:', screen);
        // If it's a tab, switch tabs
        if (['Home', 'Services', 'Offers', 'Profile'].includes(screen)) {
          console.log('Switching to tab:', screen);
          setActiveTab(screen);
        } else {
          // Otherwise use the web navigation context to navigate to other screens
          console.log('Navigating to screen:', screen);
          webNavigation.navigate(screen);
        }
      }
    };
    
    switch (activeTab) {
      case 'Home':
        return <HomeScreen navigation={navigationProxy} />;
      case 'Services':
        return <SpecialServicesScreen navigation={navigationProxy} />;
      case 'Offers':
        return <OffersScreen navigation={navigationProxy} />;
      case 'Profile':
        return <ProfileScreen navigation={navigationProxy} />;
      default:
        return <HomeScreen navigation={navigationProxy} />;
    }
  };

  // Custom tab bar component
  const renderTabBar = () => {
    return (
      <View style={styles.tabBar}>
        {renderTabButton('Home', 'home', 'home-outline')}
        {renderTabButton('Services', 'construct', 'construct-outline')}
        {renderTabButton('Offers', 'gift', 'gift-outline')}
        {renderTabButton('Profile', 'person', 'person-outline')}
      </View>
    );
  };

  // Individual tab button
  const renderTabButton = (name, iconFilled, iconOutline) => {
    const isActive = activeTab === name;
    const iconName = isActive ? iconFilled : iconOutline;
    
    return (
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => setActiveTab(name)}
      >
        <Ionicons 
          name={iconName} 
          size={24} 
          color={isActive ? '#3B5323' : 'gray'} 
        />
        <Text 
          style={[
            styles.tabLabel,
            { color: isActive ? '#3B5323' : 'gray' }
          ]}
        >
          {name === 'Services' ? 'Special Services' : name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderScreen()}
      </View>
      {renderTabBar()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    maxWidth: 500, // Limit width on web to mimic mobile app
    width: '100%',
    alignSelf: 'center',
    height: '100%',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    boxShadow: '0px -2px 4px rgba(0, 0, 0, 0.1)',
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});
