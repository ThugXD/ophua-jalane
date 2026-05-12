import React from 'react';
import { View, Text, TouchableOpacity, ViewProps } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

interface HeaderProps extends ViewProps {
  title: string;
  showBack?: boolean;
  rightIcon?: React.ReactNode;
  onRightPress?: () => void;
}

export function Header({
  title,
  showBack = false,
  rightIcon,
  onRightPress,
  style,
  ...props
}: HeaderProps) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        style,
      ]}
      {...props}
    >
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        {showBack && (
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 8 }}
          >
            <ChevronLeft size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
        <Text
          style={{
            color: colors.text,
            fontSize: 18,
            fontWeight: '600',
          }}
        >
          {title}
        </Text>
      </View>

      {rightIcon && (
        <TouchableOpacity onPress={onRightPress} style={{ padding: 8 }}>
          {rightIcon}
        </TouchableOpacity>
      )}
    </View>
  );
}
