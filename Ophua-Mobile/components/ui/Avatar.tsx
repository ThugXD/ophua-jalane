import React from 'react';
import { View, Image, Text } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string | null;
  initials?: string;
  size?: AvatarSize;
}

export function Avatar({ src, initials = '?', size = 'md' }: AvatarProps) {
  const { colors } = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { width: 32, height: 32, fontSize: 12 };
      case 'md':
        return { width: 48, height: 48, fontSize: 14 };
      case 'lg':
        return { width: 64, height: 64, fontSize: 16 };
      case 'xl':
        return { width: 96, height: 96, fontSize: 20 };
      default:
        return { width: 48, height: 48, fontSize: 14 };
    }
  };

  const sizeStyles = getSizeStyles();

  if (src) {
    return (
      <Image
        source={{ uri: src }}
        style={{
          width: sizeStyles.width,
          height: sizeStyles.height,
          borderRadius: sizeStyles.width / 2,
        }}
      />
    );
  }

  return (
    <View
      style={{
        width: sizeStyles.width,
        height: sizeStyles.height,
        borderRadius: sizeStyles.width / 2,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: sizeStyles.fontSize,
          fontWeight: '600',
        }}
      >
        {initials}
      </Text>
    </View>
  );
}
