import React, { useEffect, useState } from 'react';
import {
  View,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useProfile, useUpdateProfile, useUploadAvatar, useUploadCover } from '@/hooks/useProfile';
import { ProfileFormSchema, ProfileFormInput } from '@/lib/validation';
import { Header } from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Loading } from '@/components/ui/Loading';
import { ToastManager } from '@/components/ui/Toast';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const uploadCover = useUploadCover();

  const [showImageModal, setShowImageModal] = useState<'avatar' | 'cover' | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ProfileFormInput>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      full_name: '',
      job_title: '',
      company: '',
      address: '',
      primary_email: '',
      secondary_email: '',
      mobile_phone: '',
      work_phone: '',
      card_lang: 'pt',
    },
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name,
        job_title: profile.job_title,
        company: profile.company,
        address: profile.address,
        primary_email: profile.primary_email,
        secondary_email: profile.secondary_email,
        mobile_phone: profile.mobile_phone,
        work_phone: profile.work_phone,
        card_lang: profile.card_lang,
      });
    }
  }, [profile, reset]);

  const pickImage = async (type: 'avatar' | 'cover') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'avatar' ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        await handleImageUpload(result.assets[0].uri, type);
      }
    } catch (error) {
      console.error('[EditProfileScreen] Image picker error:', error);
      ToastManager.show(t('profile.uploadPhotoError'), 'error');
    }
    setShowImageModal(null);
  };

  const takePhoto = async (type: 'avatar' | 'cover') => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'avatar' ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        await handleImageUpload(result.assets[0].uri, type);
      }
    } catch (error) {
      console.error('[EditProfileScreen] Camera error:', error);
      ToastManager.show(t('profile.uploadPhotoError'), 'error');
    }
    setShowImageModal(null);
  };

  const handleImageUpload = async (imageUri: string, type: 'avatar' | 'cover') => {
    try {
      setUploadingImage(true);
      if (type === 'avatar') {
        await uploadAvatar.mutateAsync(imageUri);
      } else {
        await uploadCover.mutateAsync(imageUri);
      }
      ToastManager.show(t('profile.profileUpdated'), 'success');
    } catch (error) {
      console.error('[EditProfileScreen] Upload error:', error);
      ToastManager.show(t('profile.uploadPhotoError'), 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (data: ProfileFormInput) => {
    try {
      await updateProfile.mutateAsync(data);
      ToastManager.show(t('profile.profileUpdated'), 'success');
      router.back();
    } catch (error) {
      console.error('[EditProfileScreen] Update error:', error);
      ToastManager.show(t('profile.profileUpdateFailed'), 'error');
    }
  };

  if (profileLoading) {
    return <Loading />;
  }

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return '?';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title={t('profile.editProfile')} showBack />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Cover Photo Section */}
          <TouchableOpacity
            onPress={() => setShowImageModal('cover')}
            style={{
              width: '100%',
              height: 150,
              borderRadius: 12,
              marginBottom: 16,
              overflow: 'hidden',
              backgroundColor: colors.surface,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            {profile?.cover_url ? (
              <Image
                source={{ uri: profile.cover_url }}
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <View
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: colors.primaryLight,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Camera size={40} color={colors.primary} />
              </View>
            )}

            {uploadingImage && showImageModal === 'cover' && (
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <ActivityIndicator color="#FFFFFF" size="large" />
              </View>
            )}
          </TouchableOpacity>

          {/* Avatar Section */}
          <View
            style={{
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <TouchableOpacity
              onPress={() => setShowImageModal('avatar')}
              style={{
                position: 'relative',
              }}
            >
              <Avatar
                src={profile?.avatar_url}
                initials={getInitials()}
                size="xl"
              />

              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: colors.primary,
                  borderRadius: 20,
                  padding: 8,
                }}
              >
                <Camera size={20} color="#FFFFFF" />
              </View>

              {uploadingImage && showImageModal === 'avatar' && (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 48,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <ActivityIndicator color="#FFFFFF" size="large" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <Card padding="lg" style={{ marginBottom: 24 }}>
            {/* Full Name */}
            <Controller
              control={control}
              name="full_name"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('profile.fullName')}
                  placeholder={t('profile.fullName')}
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="words"
                  error={errors.full_name?.message}
                />
              )}
            />

            {/* Job Title */}
            <Controller
              control={control}
              name="job_title"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('profile.jobTitle')}
                  placeholder={t('profile.jobTitle')}
                  value={value}
                  onChangeText={onChange}
                  error={errors.job_title?.message}
                />
              )}
            />

            {/* Company */}
            <Controller
              control={control}
              name="company"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('profile.company')}
                  placeholder={t('profile.company')}
                  value={value}
                  onChangeText={onChange}
                  error={errors.company?.message}
                />
              )}
            />

            {/* Address */}
            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('profile.address')}
                  placeholder={t('profile.address')}
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={3}
                  error={errors.address?.message}
                />
              )}
            />

            {/* Primary Email */}
            <Controller
              control={control}
              name="primary_email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('profile.primaryEmail')}
                  placeholder={t('profile.primaryEmail')}
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.primary_email?.message}
                />
              )}
            />

            {/* Secondary Email */}
            <Controller
              control={control}
              name="secondary_email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('profile.secondaryEmail')}
                  placeholder={t('profile.secondaryEmail')}
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.secondary_email?.message}
                />
              )}
            />

            {/* Mobile Phone */}
            <Controller
              control={control}
              name="mobile_phone"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('profile.mobilePhone')}
                  placeholder={t('profile.mobilePhone')}
                  value={value}
                  onChangeText={onChange}
                  keyboardType="phone-pad"
                  error={errors.mobile_phone?.message}
                />
              )}
            />

            {/* Work Phone */}
            <Controller
              control={control}
              name="work_phone"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('profile.workPhone')}
                  placeholder={t('profile.workPhone')}
                  value={value}
                  onChangeText={onChange}
                  keyboardType="phone-pad"
                  error={errors.work_phone?.message}
                />
              )}
            />
          </Card>

          {/* Save Button */}
          <Button
            label={isSubmitting ? t('common.loading') : t('common.save')}
            onPress={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
            disabled={isSubmitting || uploadingImage}
            fullWidth
            size="lg"
            style={{ marginBottom: 24 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Image Picker Modal */}
      <Modal
        isVisible={showImageModal !== null}
        title={showImageModal === 'avatar' ? t('profile.changeAvatar') : t('profile.changeCover')}
        onClose={() => setShowImageModal(null)}
      >
        <View style={{ gap: 12 }}>
          <Button
            label={t('profile.selectPhoto')}
            variant="primary"
            fullWidth
            onPress={() => {
              if (showImageModal) {
                pickImage(showImageModal);
              }
            }}
          />
          <Button
            label={t('profile.takePhoto')}
            variant="secondary"
            fullWidth
            onPress={() => {
              if (showImageModal) {
                takePhoto(showImageModal);
              }
            }}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

import { StyleSheet } from 'react-native';
