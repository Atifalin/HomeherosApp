import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

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

  // Load location from localStorage/SecureStore and Supabase
  useEffect(() => {
    const loadLocation = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log('Loading location for user:', user.id);
        
        // First check localStorage (or SecureStore for native)
        const storedLocation = localStorage.getItem('userLocation');
        
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
            .single();
          
          if (error) {
            console.log('Error or no profile found:', error);
            // If the profile doesn't exist yet or has no location, leave location as null
            // This will trigger the location selection screen
            setLocationState(null);
          } else if (data?.location) {
            console.log('Found location in Supabase:', data.location);
            setLocationState(data.location);
            // Also save to localStorage for future use
            localStorage.setItem('userLocation', data.location);
          } else {
            console.log('No location found in Supabase');
            setLocationState(null);
          }
        }
      } catch (error) {
        console.error('Error loading location:', error);
        setLocationState(null);
      } finally {
        setLoading(false);
      }
    };

    loadLocation();
  }, [user]);

  const setLocation = async (newLocation: string) => {
    if (!user) return;
    
    try {
      // Update in state
      setLocationState(newLocation);
      
      // Save to localStorage
      localStorage.setItem('userLocation', newLocation);
      
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
