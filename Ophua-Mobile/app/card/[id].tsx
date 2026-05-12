import React from 'react';
import {
  View,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  Linking,
  Share,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Mail, Phone, MapPin, Share2 } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { usePublicProfile } from '@/hooks/useProfile';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';

export default function PublicCardScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const { data: profile, isLoading, error } = usePublicProfile(id as string);

  const handleShare = async () => {
    try {
      const url = `https://ophua.com/card/${id}`;
      await Share.share({
        message: `${t('card.shareMessage', { name: profile?.full_name || 'Cartão Digital' })} ${url}`,
        url: url,
        title: profile?.full_name || 'Cartão Digital',
      });
    } catch (err) {
      console.error('[PublicCardScreen] Share error:', err);
    }
  };

  const handleContactByEmail = () => {
    if (profile?.primary_email) {
      Linking.openURL(`mailto:${profile.primary_email}`);
    }
  };

  const handleContactByPhone = () => {
    if (profile?.mobile_phone) {
      Linking.openURL(`tel:${profile.mobile_phone}`);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title={t('card.card')} showBack />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.error, fontSize: 16, fontWeight: '600' }}>
            {t('errors.notFound')}
          </Text>
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
        title={t('card.card')}
        showBack
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
        {/* Main Card */}
        <Card
          padding="lg"
          style={{
            marginBottom: 24,
            backgroundColor: colors.primaryLight,
            borderRadius: 16,
          }}
        >
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Avatar initials={initials} size="lg" />
          </View>

          <Text
            style={{
              color: colors.primary,
              fontSize: 20,
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
                fontSize: 13,
                textAlign: 'center',
                marginBottom: 16,
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
              marginVertical: 16,
            }}
          />

          {/* Contact Details */}
          <View style={{ gap: 12 }}>
            {profile.primary_email && (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={handleContactByEmail}
              >
                <Mail size={16} color={colors.primary} style={{ marginRight: 8 }} />
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 13,
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {profile.primary_email}
                </Text>
              </TouchableOpacity>
            )}

            {profile.mobile_phone && (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={handleContactByPhone}
              >
                <Phone size={16} color={colors.primary} style={{ marginRight: 8 }} />
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 13,
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {profile.mobile_phone}
                </Text>
              </TouchableOpacity>
            )}

            {profile.address && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                }}
              >
                <MapPin size={16} color={colors.primary} style={{ marginRight: 8, marginTop: 2 }} />
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 13,
                    flex: 1,
                  }}
                  numberOfLines={3}
                >
                  {profile.address}
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={{ gap: 12 }}>
          {profile.primary_email && (
            <Button
              label={t('card.sendEmail')}
              variant="primary"
              size="lg"
              fullWidth
              leftIcon={<Mail size={20} color="#FFFFFF" />}
              onPress={handleContactByEmail}
            />
          )}

          {profile.mobile_phone && (
            <Button
              label={t('card.callPhone')}
              variant="secondary"
              size="lg"
              fullWidth
              leftIcon={<Phone size={20} color={colors.primary} />}
              onPress={handleContactByPhone}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
