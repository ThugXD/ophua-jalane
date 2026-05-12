import React from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Edit2, Share2, Eye } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Header } from '@/components/ui/Header';
import { Loading } from '@/components/ui/Loading';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { data: profile, isLoading, error } = useProfile(user?.id);

  if (isLoading) {
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
    return user?.email?.[0].toUpperCase() || '?';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title={t('common.home')} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        {profile && (
          <Card padding="lg" style={{ marginBottom: 24 }}>
            {/* Avatar and Info */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                marginBottom: 16,
              }}
            >
              <Avatar
                src={profile.avatar_url}
                initials={getInitials()}
                size="lg"
              />

              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginBottom: 4,
                  }}
                >
                  {profile.full_name}
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 14,
                    marginBottom: 8,
                  }}
                >
                  {profile.job_title || t('profile.jobTitle')}
                </Text>
                {profile.company && (
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                    }}
                  >
                    {profile.company}
                  </Text>
                )}
              </View>
            </View>

            {/* Action Buttons */}
            <View
              style={{
                flexDirection: 'row',
                gap: 8,
              }}
            >
              <Button
                label={t('profile.editProfile')}
                variant="primary"
                size="sm"
                fullWidth
                leftIcon={<Edit2 size={16} color="#FFFFFF" />}
                onPress={() => router.push('/(app)/profile/edit')}
              />
              <Button
                label={t('card.shareCard')}
                variant="secondary"
                size="sm"
                fullWidth
                leftIcon={<Share2 size={16} color={colors.primary} />}
                onPress={() => {
                  // TODO: Implement share functionality
                }}
              />
            </View>

            {/* Contact Info */}
            {profile.primary_email && (
              <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                    marginBottom: 8,
                  }}
                >
                  Email
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 14,
                  }}
                >
                  {profile.primary_email}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Quick Actions */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 16,
              fontWeight: '600',
              marginBottom: 12,
            }}
          >
            Ações Rápidas
          </Text>

          <Card padding="lg">
            <TouchableOpacity
              onPress={() => router.push('/(app)/contacts/create')}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: '500' }}>
                Adicionar Contato
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 20 }}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(app)/profile/index')}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: '500' }}>
                Ver Meu Perfil
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 20 }}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(app)/analytics')}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 12,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: '500' }}>
                Ver Analytics
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 20 }}>›</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Stats */}
        {profile && (
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: '600',
                marginBottom: 12,
              }}
            >
              Estatísticas
            </Text>

            <View
              style={{
                flexDirection: 'row',
                gap: 12,
              }}
            >
              <Card padding="lg" style={{ flex: 1 }}>
                <Eye size={24} color={colors.primary} style={{ marginBottom: 8 }} />
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 20,
                    fontWeight: 'bold',
                    marginBottom: 4,
                  }}
                >
                  0
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                  }}
                >
                  Visualizações
                </Text>
              </Card>

              <Card padding="lg" style={{ flex: 1 }}>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    backgroundColor: colors.primary,
                    marginBottom: 8,
                  }}
                />
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 20,
                    fontWeight: 'bold',
                    marginBottom: 4,
                  }}
                >
                  0
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                  }}
                >
                  Cliques
                </Text>
              </Card>
            </View>
          </View>
        )}

        {error && (
          <Card
            style={{
              backgroundColor: `${colors.error}20`,
              borderLeftWidth: 4,
              borderLeftColor: colors.error,
            }}
          >
            <Text style={{ color: colors.error, fontSize: 14 }}>
              Erro ao carregar perfil
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
