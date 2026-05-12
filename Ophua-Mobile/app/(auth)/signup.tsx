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
import { Mail, Lock, User } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { SignupSchema, SignupInput } from '@/lib/validation';

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<SignupInput>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      confirm_password: '',
    },
  });

  const onSubmit = useCallback(async (data: SignupInput) => {
    try {
      setError(null);
      setIsLoading(true);
      await signup(data.email, data.password, data.full_name);
      router.replace('/(app)/home');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta';
      setError(message);
      console.error('[SignupScreen] Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [signup, router]);

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
              Criar Conta
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              Preencha os dados para criar sua conta
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
            {/* Full Name Input */}
            <Controller
              control={control}
              name="full_name"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('auth.fullName')}
                  placeholder={t('auth.enterName')}
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="words"
                  leftIcon={<User size={20} color={colors.textSecondary} />}
                  error={errors.full_name?.message}
                />
              )}
            />

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
                  isSecure
                  leftIcon={<Lock size={20} color={colors.textSecondary} />}
                  error={errors.password?.message}
                />
              )}
            />

            {/* Confirm Password Input */}
            <Controller
              control={control}
              name="confirm_password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('auth.confirmPassword')}
                  placeholder={t('auth.enterPassword')}
                  value={value}
                  onChangeText={onChange}
                  isSecure
                  leftIcon={<Lock size={20} color={colors.textSecondary} />}
                  error={errors.confirm_password?.message}
                />
              )}
            />
          </View>

          {/* Signup Button */}
          <Button
            label={isLoading ? t('common.loading') : t('auth.signup')}
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            disabled={isLoading}
            fullWidth
            size="lg"
            style={{ marginBottom: 16 }}
          />

          {/* Login Link */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              {t('auth.haveAccount')}{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 14,
                  fontWeight: '600',
                }}
              >
                {t('auth.login')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
