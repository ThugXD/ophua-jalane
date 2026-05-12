import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss?: () => void;
}

export function Toast({
  message,
  type = 'info',
  duration = 3000,
  onDismiss,
}: ToastProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onDismiss?.();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, opacity, onDismiss]);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'warning':
        return colors.warning;
      case 'info':
        return colors.primary;
      default:
        return colors.primary;
    }
  };

  const containerStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 16,
  };

  return (
    <Animated.View
      style={[
        containerStyle,
        { opacity },
      ]}
    >
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: 14,
          fontWeight: '500',
        }}
      >
        {message}
      </Text>
    </Animated.View>
  );
}

// Toast Manager for showing toasts globally
export class ToastManager {
  private static toasts: Array<{
    id: string;
    message: string;
    type: ToastType;
  }> = [];

  private static listeners: Set<() => void> = new Set();

  static show(message: string, type: ToastType = 'info', duration: number = 3000) {
    const id = Math.random().toString(36).substr(2, 9);
    this.toasts.push({ id, message, type });
    this.notifyListeners();

    setTimeout(() => {
      this.remove(id);
    }, duration);

    return id;
  }

  static remove(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notifyListeners();
  }

  static clear() {
    this.toasts = [];
    this.notifyListeners();
  }

  static subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private static notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }

  static getToasts() {
    return this.toasts;
  }
}
