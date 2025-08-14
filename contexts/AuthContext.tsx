import { Platform } from 'react-native';
if (Platform.OS !== 'web') {
  require('react-native-url-polyfill/auto');
}
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, phone?: string) => Promise<{ error: any } | undefined>;
  signUpHomeherosGo: (userData: HomeherosGoSignupData) => Promise<{ error: any } | undefined>;
  signIn: (email: string, password: string) => Promise<{ error: any } | undefined>;
  signOut: () => Promise<void>;
}

interface HomeherosGoSignupData {
  email: string;
  password: string;
  name: string;
  phone: string;
  address: string;
  userType: 'homehero' | 'contractor';
  applicationData: any;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentSession = supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null);
      setUser(data.session?.user || null);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, phone?: string) => {
    const payload = {
      email,
      password,
      options: {
        data: phone ? { phone } : undefined,
      },
    };
    console.log('[DEBUG] Signup payload:', payload);
    const { error } = await supabase.auth.signUp(payload);
    if (error) console.error('[DEBUG] Signup error:', error);
    return { error };
  };

  const signUpHomeherosGo = async (userData: HomeherosGoSignupData) => {
    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            phone: userData.phone,
            user_type: userData.userType,
            status: 'pending'
          }
        }
      });

      if (authError) {
        console.error('[DEBUG] HomeherosGo auth signup error:', authError);
        return { error: authError };
      }

      // Create or update profile record with pending status
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            name: userData.name,
            phone: userData.phone,
            address: userData.address,
            email: userData.email,
            user_type: userData.userType,
            status: 'pending',
            application_data: userData.applicationData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          });

        if (profileError) {
          console.error('[DEBUG] HomeherosGo profile creation error:', profileError);
          return { error: profileError };
        }
      }

      console.log('[DEBUG] HomeherosGo signup successful');
      return { error: null };
    } catch (error) {
      console.error('[DEBUG] HomeherosGo signup unexpected error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    const payload = { email, password };
    console.log('[DEBUG] Login payload:', payload);
    const { error } = await supabase.auth.signInWithPassword(payload);
    if (error) console.error('[DEBUG] Login error:', error);
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signUpHomeherosGo, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
