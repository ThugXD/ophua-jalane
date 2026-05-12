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
import { Mail, Lock } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { LoginSchema, LoginInput } from '@/lib/validation';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = useCallback(async (data: LoginInput) => {
    try {
      setError(null);
      setIsLoading(true);
      await login(data.email, data.password);
      router.replace('/(app)/home');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login';
      setError(message);
      console.error('[LoginScreen] Login error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [login, router]);

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
              Bem-vindo
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              Faça login para acessar sua conta
            </Text>
          </View>

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
          <View style={{ marginBottom: 24 }}>
            {/* Email Input */}
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

            {/* Password Input */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('auth.password')}
                  placeholder={t('auth.enterPassword')}
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  isSecure
                  leftIcon={<Lock size={20} color={colors.textSecondary} />}
                  error={errors.password?.message}
                />
              )}
            />
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={{ marginBottom: 24 }}
          >
            <Text
              style={{
                color: colors.primary,
                fontSize: 14,
                fontWeight: '500',
              }}
            >
              {t('auth.forgotPassword')}
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <Button
            label={isLoading ? t('common.loading') : t('auth.login')}
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            disabled={isLoading}
            fullWidth
            size="lg"
            style={{ marginBottom: 16 }}
          />

          {/* Signup Link */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              {t('auth.dontHaveAccount')}{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 14,
                  fontWeight: '600',
                }}
              >
                {t('auth.signup')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
