import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  SafeAreaView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Flashlight, X } from 'lucide-react-native';
import { CameraView } from 'expo-camera';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCreateContact } from '@/hooks/useContacts';
import { ContactFormSchema, ContactFormInput } from '@/lib/validation';
import { Header } from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { ToastManager } from '@/components/ui/Toast';

export default function BusinessCardScannerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const cameraRef = useRef<CameraView>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedData, setScannedData] = useState<Partial<ContactFormInput> | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const createContact = useCreateContact();
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<ContactFormInput>({
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

  useEffect(() => {
    (async () => {
      const { status } = await CameraView.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (scannedData) {
      if (scannedData.name) setValue('name', scannedData.name);
      if (scannedData.email) setValue('email', scannedData.email);
      if (scannedData.phone) setValue('phone', scannedData.phone);
      if (scannedData.company) setValue('company', scannedData.company);
      if (scannedData.job_title) setValue('job_title', scannedData.job_title);
    }
  }, [scannedData, setValue]);

  const captureImage = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        setCapturedImage(photo.uri);
        await processImage(photo.uri);
      } catch (error) {
        console.error('[Scanner] Capture error:', error);
        ToastManager.show(t('scanner.captureFailed'), 'error');
      }
    }
  };

  const processImage = async (imageUri: string) => {
    setIsProcessing(true);
    try {
      // Simulating OCR processing via Edge Function
      // In a real app, this would call the backend at /functions/v1/scan-business-card
      const mockScannedData: Partial<ContactFormInput> = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1-555-123-4567',
        company: 'Tech Corp',
        job_title: 'Software Engineer',
      };

      setScannedData(mockScannedData);
      setShowReviewModal(true);
      ToastManager.show(t('scanner.scanComplete'), 'success');
    } catch (error) {
      console.error('[Scanner] Processing error:', error);
      ToastManager.show(t('scanner.processingFailed'), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const onSubmit = async (data: ContactFormInput) => {
    if (!user?.id) return;
    try {
      await createContact.mutateAsync({
        ...data,
        user_id: user.id,
        source: 'received',
      });
      ToastManager.show(t('contacts.addContactSuccess'), 'success');
      router.back();
    } catch (error) {
      console.error('[Scanner] Save error:', error);
      ToastManager.show(t('contacts.contactAddFailed'), 'error');
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setScannedData(null);
    setShowReviewModal(false);
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title={t('scanner.scanCard')} showBack />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 12, textAlign: 'center' }}>
            {t('scanner.cameraPermissionRequired')}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 24, textAlign: 'center' }}>
            {t('scanner.enableCameraInSettings')}
          </Text>
          <Button label={t('common.back')} variant="primary" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  if (capturedImage && showReviewModal) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title={t('scanner.reviewScan')} showBack onBackPress={resetCapture} />

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
            {/* Captured Image Preview */}
            <Image
              source={{ uri: capturedImage }}
              style={{
                width: '100%',
                height: 200,
                borderRadius: 12,
                marginBottom: 24,
              }}
            />

            {/* Form Fields */}
            <Card padding="lg" style={{ marginBottom: 24 }}>
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
                    error={errors.name?.message}
                  />
                )}
              />

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
                    error={errors.email?.message}
                  />
                )}
              />

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
                    error={errors.phone?.message}
                  />
                )}
              />

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
            </Card>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Button
                label={t('common.cancel')}
                variant="secondary"
                fullWidth
                onPress={resetCapture}
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
      <Header title={t('scanner.scanCard')} showBack />

      {!capturedImage ? (
        <View style={{ flex: 1 }}>
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing="back"
            flash={isFlashOn ? 'on' : 'off'}
          />

          {/* Camera Overlay */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: '80%',
                aspectRatio: 1.5,
                borderWidth: 2,
                borderColor: colors.primary,
                borderRadius: 12,
                opacity: 0.5,
              }}
            />
          </View>

          {/* Controls */}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              paddingHorizontal: 16,
              paddingBottom: 32,
              paddingTop: 16,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* Flash Toggle */}
            <TouchableOpacity
              onPress={() => setIsFlashOn(!isFlashOn)}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: isFlashOn ? colors.primary : 'rgba(255, 255, 255, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Flashlight size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Capture Button */}
            <TouchableOpacity
              onPress={captureImage}
              disabled={isProcessing}
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
                opacity: isProcessing ? 0.5 : 1,
              }}
            >
              {isProcessing ? (
                <ActivityIndicator size="large" color="#FFFFFF" />
              ) : (
                <Camera size={30} color="#FFFFFF" />
              )}
            </TouchableOpacity>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
