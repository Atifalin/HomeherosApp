import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

// Create a platform-specific storage helper
const Storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await AsyncStorage.getItem(key);
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  }
};

interface LocationContextProps {
  location: string | null;
  setLocation: (location: string) => void;
  loading: boolean;
}

const LocationContext = createContext<LocationContextProps | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [location, setLocationState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Clear location when user logs out
  useEffect(() => {
    if (!user) {
      // Clear location data when user logs out
      setLocationState(null);
      Storage.removeItem('userLocation');
      setLoading(false);
    }
  }, [user]);

  // Load location from localStorage/SecureStore and Supabase
  useEffect(() => {
    const loadLocation = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log('Loading location for user:', user.id);
        
        // For new logins, we want to force the location selection screen
        // Check if this appears to be a new login by looking at session creation time
        const session = await supabase.auth.getSession();
        // Access created_at from the session object (using any to bypass TypeScript error)
        const sessionCreatedAt = session?.data?.session ? (session.data.session as any).created_at : null;
        const now = new Date().getTime();
        const sessionAge = sessionCreatedAt ? now - new Date(sessionCreatedAt).getTime() : 0;
        const isNewLogin = sessionAge < 10000; // Less than 10 seconds old session
        
        console.log('Session age (ms):', sessionAge, 'Is new login?', isNewLogin);
        
        // If it's a new login, don't use localStorage to force location selection
        if (isNewLogin) {
          console.log('New login detected, checking Supabase only...');
          // Check if user has a profile with location in Supabase
          const { data, error } = await supabase
            .from('profiles')
            .select('location')
            .eq('id', user.id)
            .maybeSingle(); // Use maybeSingle() instead of single() to handle missing profiles
          
          if (error) {
            console.error('Error fetching profile location:', error);
            setLocationState(null);
          } else if (!data?.location) {
            console.log('New user or no location in profile, showing location selection');
            setLocationState(null);
          } else {
            console.log('Found location in Supabase for new login:', data.location);
            setLocationState(data.location);
            await Storage.setItem('userLocation', data.location);
          }
        } else {
          // Not a new login, use normal flow with storage cache
          const storedLocation = await Storage.getItem('userLocation');
          
          if (storedLocation) {
            console.log('Found location in localStorage:', storedLocation);
            setLocationState(storedLocation);
          } else {
            console.log('No location in localStorage, checking Supabase...');
            // If not in local storage, try to fetch from Supabase
            const { data, error } = await supabase
              .from('profiles')
              .select('location')
              .eq('id', user.id)
              .maybeSingle(); // Use maybeSingle() instead of single()
            
            if (error) {
              console.error('Error fetching profile location:', error);
              // If there's an error, leave location as null
              // This will trigger the location selection screen
              setLocationState(null);
            } else if (data?.location) {
              console.log('Found location in Supabase:', data.location);
              setLocationState(data.location);
              // Also save to storage for future use
              await Storage.setItem('userLocation', data.location);
            } else {
              console.log('No location found in Supabase');
              setLocationState(null);
            }
          }
        }
      } catch (error) {
        console.error('Error loading location:', error);
        setLocationState(null);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadLocation();
    }
  }, [user]);

  const setLocation = async (newLocation: string) => {
    if (!user) return;
    
    try {
      // Update in state
      setLocationState(newLocation);
      
      // Save to storage
      await Storage.setItem('userLocation', newLocation);
      
      // Save to Supabase
      await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          location: newLocation,
          updated_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error saving location:', error);
    }
  };

  return (
    <LocationContext.Provider value={{ location, setLocation, loading }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
