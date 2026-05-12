import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type BadgeVariant = 'primary' | 'success' | 'error' | 'warning' | 'secondary';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

export function Badge({ label, variant = 'primary', size = 'sm' }: BadgeProps) {
  const { colors } = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return colors.primaryLight;
      case 'success':
        return `${colors.success}20`;
      case 'error':
        return `${colors.error}20`;
      case 'warning':
        return `${colors.warning}20`;
      case 'secondary':
        return colors.border;
      default:
        return colors.primaryLight;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'warning':
        return colors.warning;
      case 'secondary':
        return colors.textSecondary;
      default:
        return colors.primary;
    }
  };

  const padding = size === 'sm' ? { paddingHorizontal: 8, paddingVertical: 4 } : { paddingHorizontal: 12, paddingVertical: 6 };
  const fontSize = size === 'sm' ? 11 : 13;

  return (
    <View
      style={{
        backgroundColor: getBackgroundColor(),
        borderRadius: 12,
        ...padding,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          color: getTextColor(),
          fontSize,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
    </View>
  );
}
