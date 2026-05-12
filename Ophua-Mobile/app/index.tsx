import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export default function SplashScreen() {
  const router = useRouter();
  const { isLoading, isSignedIn } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    if (!isLoading) {
      if (isSignedIn) {
        router.replace('/(app)/home');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [isLoading, isSignedIn]);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color={`rgb(${Object.values(colors.primary).join(', ')})`} />
    </View>
  );
}
