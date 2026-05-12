import React from 'react';
import { View, SafeAreaView, Text } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { Header } from '@/components/ui/Header';
import { Empty } from '@/components/ui/Empty';

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title={t('analytics.analytics')} />
      
      <Empty
        title={t('analytics.noData')}
        description="Ainda não há dados de visualizações ou cliques"
      />
    </SafeAreaView>
  );
}
