import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ChevronLeft } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ForgotPasswordSchema, ForgotPasswordInput } from '@/lib/validation';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = useCallback(async (data: ForgotPasswordInput) => {
    try {
      setError(null);
      setSuccess(false);
      setIsLoading(true);
      await resetPassword(data.email);
      setSuccess(true);
      setTimeout(() => {
        router.push('/(auth)/login');
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao recuperar senha';
      setError(message);
      console.error('[ForgotPasswordScreen] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [resetPassword, router]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 16,
            paddingVertical: 24,
            justifyContent: 'center',
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <ChevronLeft size={24} color={colors.primary} />
            <Text
              style={{
                color: colors.primary,
                fontSize: 14,
                fontWeight: '600',
                marginLeft: 4,
              }}
            >
              {t('common.back')}
            </Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 28,
                fontWeight: 'bold',
                marginBottom: 8,
              }}
            >
              {t('auth.forgotPassword')}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              Insira seu email e enviaremos um link para recuperar sua senha
            </Text>
          </View>

          {/* Success Message */}
          {success && (
            <Card
              style={{
                backgroundColor: `${colors.success}20`,
                borderLeftWidth: 4,
                borderLeftColor: colors.success,
                marginBottom: 16,
              }}
            >
              <Text style={{ color: colors.success, fontSize: 14 }}>
                Email enviado com sucesso! Verifique sua caixa de entrada.
              </Text>
            </Card>
          )}

          {/* Error Message */}
          {error && (
            <Card
              style={{
                backgroundColor: `${colors.error}20`,
                borderLeftWidth: 4,
                borderLeftColor: colors.error,
                marginBottom: 16,
              }}
            >
              <Text style={{ color: colors.error, fontSize: 14 }}>
                {error}
              </Text>
            </Card>
          )}

          {/* Form */}
          {!success && (
            <View style={{ marginBottom: 24 }}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label={t('auth.email')}
                    placeholder={t('auth.enterEmail')}
                    value={value}
                    onChangeText={onChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon={<Mail size={20} color={colors.textSecondary} />}
                    error={errors.email?.message}
                  />
                )}
              />
            </View>
          )}

          {/* Send Button */}
          {!success && (
            <Button
              label={isLoading ? t('common.loading') : t('auth.sendResetEmail')}
              onPress={handleSubmit(onSubmit)}
              isLoading={isLoading}
              disabled={isLoading}
              fullWidth
              size="lg"
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
