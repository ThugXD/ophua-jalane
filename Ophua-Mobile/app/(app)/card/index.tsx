import React from 'react';
import {
  View,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  Share,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Share2, Eye, QrCode, Copy } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useProfile } from '@/hooks/useProfile';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { ToastManager } from '@/components/ui/Toast';

export default function MyCardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const { data: profile, isLoading } = useProfile(user?.id);

  const cardShareUrl = `https://ophua.com/card/${user?.id}`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: t('card.shareMessage', { name: profile?.full_name || 'Meu Cartão' }),
        url: cardShareUrl,
        title: t('card.myCard'),
      });
    } catch (error) {
      console.error('[MyCardScreen] Share error:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      // Implement copy to clipboard
      ToastManager.show(t('common.copiedToClipboard'), 'success');
    } catch (error) {
      console.error('[MyCardScreen] Copy error:', error);
    }
  };

  const handleViewCard = () => {
    router.push(`/card/${user?.id}`);
  };

  const handleShowQR = () => {
    router.push('/(app)/card/qr');
  };

  if (!profile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title={t('card.myCard')} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>{t('profile.loadingProfile')}</Text>
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
      <Header
        title={t('card.myCard')}
        rightIcon={<Share2 size={24} color={colors.primary} />}
        onRightPress={handleShare}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Card Preview */}
        <Card
          padding="lg"
          style={{
            marginBottom: 24,
            backgroundColor: colors.primaryLight,
            borderRadius: 16,
          }}
        >
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Avatar initials={initials} size="lg" />
          </View>

          <Text
            style={{
              color: colors.primary,
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
                marginBottom: 4,
              }}
            >
              {profile.job_title}
            </Text>
          )}

          {profile.company && (
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                textAlign: 'center',
                marginBottom: 12,
              }}
            >
              {profile.company}
            </Text>
          )}

          <View
            style={{
              width: '100%',
              height: 1,
              backgroundColor: colors.border,
              marginVertical: 12,
            }}
          />

          <View style={{ gap: 8 }}>
            {profile.primary_email && (
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                }}
                numberOfLines={1}
              >
                {profile.primary_email}
              </Text>
            )}

            {profile.mobile_phone && (
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                }}
                numberOfLines={1}
              >
                {profile.mobile_phone}
              </Text>
            )}

            {profile.address && (
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                }}
                numberOfLines={2}
              >
                {profile.address}
              </Text>
            )}
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={{ gap: 12, marginBottom: 24 }}>
          <Button
            label={t('card.viewCard')}
            variant="primary"
            size="lg"
            fullWidth
            leftIcon={<Eye size={20} color="#FFFFFF" />}
            onPress={handleViewCard}
          />

          <Button
            label={t('card.showQR')}
            variant="secondary"
            size="lg"
            fullWidth
            leftIcon={<QrCode size={20} color={colors.primary} />}
            onPress={handleShowQR}
          />
        </View>

        {/* Share Link Section */}
        <Card padding="lg">
          <Text
            style={{
              color: colors.text,
              fontSize: 14,
              fontWeight: '600',
              marginBottom: 12,
            }}
          >
            {t('card.shareLink')}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 12,
              paddingVertical: 10,
              gap: 8,
            }}
          >
            <Text
              style={{
                flex: 1,
                color: colors.text,
                fontSize: 12,
                fontFamily: 'monospace',
              }}
              numberOfLines={1}
            >
              {cardShareUrl}
            </Text>
            <TouchableOpacity onPress={handleCopyLink}>
              <Copy size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
