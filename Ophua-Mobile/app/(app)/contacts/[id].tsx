import React, { useState } from 'react';
import {
  View,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Phone, Edit2, Copy } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useContact, useUpdateContact } from '@/hooks/useContacts';
import { ContactFormSchema, ContactFormInput } from '@/lib/validation';
import { Header } from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { ToastManager } from '@/components/ui/Toast';

export default function ContactDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const { data: contact, isLoading } = useContact(id as string);
  const updateContact = useUpdateContact();

  const { control, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm<ContactFormInput>({
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

  React.useEffect(() => {
    if (contact && isEditing) {
      reset({
        name: contact.name,
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        job_title: contact.job_title || '',
        notes: contact.notes || '',
      });
    }
  }, [contact, isEditing, reset]);

  const onSubmit = async (data: ContactFormInput) => {
    try {
      await updateContact.mutateAsync({
        id: id as string,
        ...data,
      });
      ToastManager.show(t('contacts.updateContactSuccess'), 'success');
      setIsEditing(false);
    } catch (error) {
      console.error('[ContactDetailScreen] Error:', error);
      ToastManager.show(t('contacts.contactUpdateFailed'), 'error');
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!contact) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title={t('contacts.viewContact')} showBack />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>{t('errors.notFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const initials = contact.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (isEditing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title={t('contacts.editContact')} showBack />

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

            {/* Save/Cancel Buttons */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Button
                label={t('common.cancel')}
                variant="secondary"
                fullWidth
                onPress={() => {
                  setIsEditing(false);
                  reset();
                }}
                style={{ flex: 1 }}
              />
              <Button
                label={isSubmitting ? t('common.loading') : t('common.save')}
                variant="primary"
                fullWidth
                onPress={handleSubmit(onSubmit)}
                isLoading={isSubmitting}
                disabled={isSubmitting}
                style={{ flex: 1 }}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title={t('contacts.viewContact')}
        showBack
        rightIcon={<Edit2 size={24} color={colors.primary} />}
        onRightPress={() => setIsEditing(true)}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar and Basic Info */}
        <Card padding="lg" style={{ marginBottom: 24, alignItems: 'center' }}>
          <Avatar initials={initials} size="xl" style={{ marginBottom: 16 }} />

          <Text
            style={{
              color: colors.text,
              fontSize: 20,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            {contact.name}
          </Text>

          {contact.job_title && (
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 14,
                textAlign: 'center',
                marginBottom: 4,
              }}
            >
              {contact.job_title}
            </Text>
          )}

          {contact.company && (
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 14,
                textAlign: 'center',
                marginBottom: 12,
              }}
            >
              {contact.company}
            </Text>
          )}

          <Badge
            label={contact.source === 'manual' ? t('contacts.manual') : t('contacts.received')}
            variant={contact.source === 'manual' ? 'primary' : 'secondary'}
          />
        </Card>

        {/* Contact Information */}
        <Text
          style={{
            color: colors.text,
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 12,
          }}
        >
          {t('common.contacts')}
        </Text>

        <Card padding="lg" style={{ marginBottom: 24 }}>
          {contact.email && (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                marginBottom: 12,
              }}
            >
              <Mail size={20} color={colors.primary} style={{ marginRight: 12 }} />
              <Text
                style={{
                  flex: 1,
                  color: colors.text,
                  fontSize: 14,
                }}
              >
                {contact.email}
              </Text>
              <Copy size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}

          {contact.phone && (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
              }}
            >
              <Phone size={20} color={colors.primary} style={{ marginRight: 12 }} />
              <Text
                style={{
                  flex: 1,
                  color: colors.text,
                  fontSize: 14,
                }}
              >
                {contact.phone}
              </Text>
              <Copy size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </Card>

        {/* Notes */}
        {contact.notes && (
          <>
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: '600',
                marginBottom: 12,
              }}
            >
              {t('contacts.notes')}
            </Text>

            <Card padding="lg">
              <Text
                style={{
                  color: colors.text,
                  fontSize: 14,
                  lineHeight: 20,
                }}
              >
                {contact.notes}
              </Text>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
