import React from 'react';
import {
  View,
  SafeAreaView,
  ScrollView,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useProfile } from '@/hooks/useProfile';
import QRCode from 'react-native-qrcode-svg';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';

export default function QRCardScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const { data: profile, isLoading } = useProfile(user?.id);

  const cardShareUrl = `https://ophua.com/card/${user?.id}`;

  if (isLoading || !profile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title={t('card.showQR')} showBack />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const initials = profile.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title={t('card.showQR')} showBack />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Card Info */}
        <Card padding="lg" style={{ marginBottom: 24, alignItems: 'center' }}>
          <Avatar initials={initials} size="lg" style={{ marginBottom: 12 }} />

          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 4,
            }}
          >
            {profile.full_name}
          </Text>

          {profile.job_title && (
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 14,
                textAlign: 'center',
              }}
            >
              {profile.job_title}
            </Text>
          )}
        </Card>

        {/* QR Code */}
        <Card
          padding="xl"
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FFFFFF',
            marginBottom: 24,
          }}
        >
          <QRCode
            value={cardShareUrl}
            size={250}
            color={colors.primary}
            backgroundColor="#FFFFFF"
          />
        </Card>

        {/* Instructions */}
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 14,
            textAlign: 'center',
            lineHeight: 20,
          }}
        >
          {t('card.qrInstructions')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
