import React, { useState } from 'react';
import { View, SafeAreaView, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LogOut, Moon, Sun, Globe } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const { colors, mode, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title={t('settings.settings')} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Theme Settings */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 16,
              fontWeight: '600',
              marginBottom: 12,
            }}
          >
            {t('settings.theme')}
          </Text>

          <Card padding="md">
            <View style={{ gap: 8 }}>
              {['light', 'dark', 'system'].map((themeMode) => (
                <TouchableOpacity
                  key={themeMode}
                  onPress={() => setTheme(themeMode as any)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                    borderRadius: 8,
                    backgroundColor:
                      mode === themeMode ? `${colors.primary}20` : 'transparent',
                  }}
                >
                  {themeMode === 'light' && <Sun size={20} color={colors.primary} />}
                  {themeMode === 'dark' && <Moon size={20} color={colors.primary} />}
                  {themeMode === 'system' && <Globe size={20} color={colors.primary} />}
                  
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 14,
                      fontWeight: '500',
                      marginLeft: 12,
                      flex: 1,
                    }}
                  >
                    {themeMode === 'light' && t('settings.theme')}
                    {themeMode === 'dark' && t('common.dark')}
                    {themeMode === 'system' && t('common.system')}
                  </Text>

                  {mode === themeMode && (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: colors.primary,
                      }}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </View>

        {/* Language Settings */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 16,
              fontWeight: '600',
              marginBottom: 12,
            }}
          >
            {t('settings.language')}
          </Text>

          <Card padding="md">
            <View style={{ gap: 8 }}>
              {['pt', 'en'].map((lang) => (
                <TouchableOpacity
                  key={lang}
                  onPress={() => setLanguage(lang as any)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                    borderRadius: 8,
                    backgroundColor:
                      language === lang ? `${colors.primary}20` : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 14,
                      fontWeight: '500',
                      flex: 1,
                    }}
                  >
                    {lang === 'pt' ? 'Português' : 'English'}
                  </Text>

                  {language === lang && (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: colors.primary,
                      }}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </View>

        {/* Account Settings */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 16,
              fontWeight: '600',
              marginBottom: 12,
            }}
          >
            {t('settings.account')}
          </Text>

          <Card padding="md">
            <TouchableOpacity
              onPress={() => setShowLogoutModal(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
              }}
            >
              <LogOut size={20} color={colors.error} />
              <Text
                style={{
                  color: colors.error,
                  fontSize: 14,
                  fontWeight: '500',
                  marginLeft: 12,
                  flex: 1,
                }}
              >
                {t('settings.logout')}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 20 }}>›</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* About */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 16,
              fontWeight: '600',
              marginBottom: 12,
            }}
          >
            {t('settings.about')}
          </Text>

          <Card padding="md">
            <View
              style={{
                alignItems: 'center',
                paddingVertical: 12,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: 14,
                  fontWeight: '500',
                  marginBottom: 4,
                }}
              >
                Ophua Mobile
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                v1.0.0
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Logout Modal */}
      <Modal
        isVisible={showLogoutModal}
        title={t('settings.logoutConfirm')}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        confirmLabel={t('settings.logout')}
        cancelLabel={t('common.cancel')}
        isDanger
      >
        <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
          Tem certeza que deseja sair da sua conta?
        </Text>
      </Modal>
    </SafeAreaView>
  );
}
