import React from 'react';
import { View, SafeAreaView, Text, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Edit2 } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useProfile } from '@/hooks/useProfile';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Loading } from '@/components/ui/Loading';

export default function ViewProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { data: profile, isLoading } = useProfile(user?.id);

  if (isLoading) {
    return <Loading />;
  }

  if (!profile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title={t('profile.myProfile')} showBack />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>Profile not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header 
        title={t('profile.myProfile')} 
        showBack
        rightIcon={<Edit2 size={24} color={colors.primary} />}
        onRightPress={() => router.push('/(app)/profile/edit')}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover Image */}
        {profile.cover_url && (
          <View
            style={{
              width: '100%',
              height: 150,
              borderRadius: 12,
              marginBottom: 16,
              overflow: 'hidden',
            }}
          >
            {/* TODO: Image component */}
          </View>
        )}

        {/* Avatar and Basic Info */}
        <Card padding="lg" style={{ marginBottom: 24 }}>
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Avatar
              src={profile.avatar_url}
              initials={profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
              size="xl"
            />
          </View>

          <Text
            style={{
              color: colors.text,
              fontSize: 20,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 8,
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
                fontSize: 14,
                textAlign: 'center',
              }}
            >
              {profile.company}
            </Text>
          )}
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
          Informações de Contato
        </Text>

        <Card padding="lg" style={{ marginBottom: 24 }}>
          {profile.primary_email && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>
                Email Principal
              </Text>
              <Text style={{ color: colors.text, fontSize: 14 }}>
                {profile.primary_email}
              </Text>
            </View>
          )}

          {profile.secondary_email && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>
                Email Secundário
              </Text>
              <Text style={{ color: colors.text, fontSize: 14 }}>
                {profile.secondary_email}
              </Text>
            </View>
          )}

          {profile.mobile_phone && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>
                Celular
              </Text>
              <Text style={{ color: colors.text, fontSize: 14 }}>
                {profile.mobile_phone}
              </Text>
            </View>
          )}

          {profile.work_phone && (
            <View>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>
                Telefone Comercial
              </Text>
              <Text style={{ color: colors.text, fontSize: 14 }}>
                {profile.work_phone}
              </Text>
            </View>
          )}
        </Card>

        {/* Address */}
        {profile.address && (
          <>
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: '600',
                marginBottom: 12,
              }}
            >
              Endereço
            </Text>

            <Card padding="lg">
              <Text style={{ color: colors.text, fontSize: 14 }}>
                {profile.address}
              </Text>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
