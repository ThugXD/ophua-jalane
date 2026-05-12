import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  padding = 'md',
  rounded = 'md',
  style,
  ...props
}: CardProps) {
  const { colors } = useTheme();

  const paddingValue = {
    sm: 8,
    md: 12,
    lg: 16,
  }[padding];

  const borderRadiusValue = {
    sm: 4,
    md: 8,
    lg: 12,
  }[rounded];

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: borderRadiusValue,
          padding: paddingValue,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
