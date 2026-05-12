import React from 'react';
import {
  View,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Phone } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCreateContact } from '@/hooks/useContacts';
import { ContactFormSchema, ContactFormInput } from '@/lib/validation';
import { Header } from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ToastManager } from '@/components/ui/Toast';

export default function CreateContactScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const createContact = useCreateContact();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactFormInput>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      job_title: '',
      notes: '',
    },
  });

  const onSubmit = async (data: ContactFormInput) => {
    if (!user?.id) return;
    try {
      await createContact.mutateAsync({
        ...data,
        user_id: user.id,
        source: 'manual',
      });
      ToastManager.show(t('contacts.addContactSuccess'), 'success');
      router.back();
    } catch (error) {
      console.error('[CreateContactScreen] Error:', error);
      ToastManager.show(t('contacts.contactAddFailed'), 'error');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title={t('contacts.addContact')} showBack />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Card padding="lg" style={{ marginBottom: 24 }}>
            {/* Name */}
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('contacts.name')}
                  placeholder={t('contacts.name')}
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="words"
                  leftIcon={<User size={20} color={colors.textSecondary} />}
                  error={errors.name?.message}
                />
              )}
            />

            {/* Email */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('contacts.email')}
                  placeholder={t('contacts.email')}
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon={<Mail size={20} color={colors.textSecondary} />}
                  error={errors.email?.message}
                />
              )}
            />

            {/* Phone */}
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('contacts.phone')}
                  placeholder={t('contacts.phone')}
                  value={value}
                  onChangeText={onChange}
                  keyboardType="phone-pad"
                  leftIcon={<Phone size={20} color={colors.textSecondary} />}
                  error={errors.phone?.message}
                />
              )}
            />

            {/* Company */}
            <Controller
              control={control}
              name="company"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('contacts.company')}
                  placeholder={t('contacts.company')}
                  value={value}
                  onChangeText={onChange}
                  error={errors.company?.message}
                />
              )}
            />

            {/* Job Title */}
            <Controller
              control={control}
              name="job_title"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('contacts.jobTitle')}
                  placeholder={t('contacts.jobTitle')}
                  value={value}
                  onChangeText={onChange}
                  error={errors.job_title?.message}
                />
              )}
            />

            {/* Notes */}
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('contacts.notes')}
                  placeholder={t('contacts.notes')}
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={3}
                  error={errors.notes?.message}
                />
              )}
            />
          </Card>

          {/* Save Button */}
          <Button
            label={isSubmitting ? t('common.loading') : t('common.save')}
            onPress={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            fullWidth
            size="lg"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
