import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
}

export function Loading({ message, size = 'large' }: LoadingProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
      }}
    >
      <ActivityIndicator
        size={size}
        color={colors.primary}
        style={{ marginBottom: message ? 16 : 0 }}
      />
      {message && (
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 14,
            marginTop: 8,
          }}
        >
          {message}
        </Text>
      )}
    </View>
  );
}
