import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  ModalProps,
  StyleSheet,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { Button } from './Button';

interface ModalProps extends Omit<RNModal['props'], 'children'> {
  isVisible: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
}

export function Modal({
  isVisible,
  title,
  children,
  onClose,
  onConfirm,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDanger = false,
  ...props
}: ModalProps) {
  const { colors } = useTheme();

  return (
    <RNModal
      visible={isVisible}
      transparent
      animationType="fade"
      {...props}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            width: '85%',
            maxWidth: 400,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: 18,
                fontWeight: '600',
              }}
            >
              {title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={{ marginBottom: 16 }}>{children}</View>

          {/* Actions */}
          <View
            style={{
              flexDirection: 'row',
              gap: 8,
            }}
          >
            <Button
              label={cancelLabel}
              variant="secondary"
              size="md"
              onPress={onClose}
              style={{ flex: 1 }}
            />
            {onConfirm && (
              <Button
                label={confirmLabel}
                variant={isDanger ? 'danger' : 'primary'}
                size="md"
                onPress={onConfirm}
                style={{ flex: 1 }}
              />
            )}
          </View>
        </View>
      </View>
    </RNModal>
  );
}
