import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// Replace with your Supabase URL and anon key when ready
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
