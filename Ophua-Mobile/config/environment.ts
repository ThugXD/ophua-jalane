// Environment configuration for Ophua Mobile
// These values should be loaded from .env or .env.local file

export const ENV = {
  // Supabase Configuration
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  
  // API Configuration
  API_TIMEOUT: 30000,
  
  // App Configuration
  APP_NAME: 'Ophua Mobile',
  APP_VERSION: '1.0.0',
  
  // Feature Flags
  ENABLE_ANALYTICS: true,
  ENABLE_BUSINESS_CARD_SCANNER: true,
  ENABLE_REALTIME: true,
};

// Validation
if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase credentials not configured. App may not work properly.');
}
