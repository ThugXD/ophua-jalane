export const ENV = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://wnbnyvehkxbbbvtzaigt.supabase.co',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduYm55dmVoa3hiYmJ2dHphaWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczOTQ5NzksImV4cCI6MjA5Mjk3MDk3OX0.oJEM0ZZFnZwCAPPjermmg6-1Z8wKdYdZeqqzhpK5D9M',
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://wnbnyvehkxbbbvtzaigt.supabase.co',
} as const;

// Validation
if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
  console.warn('[ENV] Missing Supabase configuration');
}
