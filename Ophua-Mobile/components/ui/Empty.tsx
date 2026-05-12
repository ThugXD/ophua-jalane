import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface EmptyProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function Empty({ icon, title, description, action }: EmptyProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
      }}
    >
      {icon && (
        <View style={{ marginBottom: 16 }}>
          {icon}
        </View>
      )}

      <Text
        style={{
          color: colors.text,
          fontSize: 16,
          fontWeight: '600',
          marginBottom: 8,
        }}
      >
        {title}
      </Text>

      {description && (
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 14,
            textAlign: 'center',
            marginBottom: action ? 16 : 0,
          }}
        >
          {description}
        </Text>
      )}

      {action && <View>{action}</View>}
    </View>
  );
}
