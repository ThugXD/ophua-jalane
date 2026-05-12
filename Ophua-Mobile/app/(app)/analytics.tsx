import React, { useState } from 'react';
import {
  View,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { data: analytics, isLoading } = useAnalytics(user?.id);

  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'year'>('week');

  // Mock data for charts
  const chartData = {
    labels: timePeriod === 'week' 
      ? ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom']
      : timePeriod === 'month'
      ? ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']
      : ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    datasets: [
      {
        data: timePeriod === 'week'
          ? [12, 15, 8, 20, 18, 25, 16]
          : timePeriod === 'month'
          ? [50, 65, 58, 72]
          : [120, 135, 118, 145, 160, 175, 165, 180, 190, 185, 195, 210],
      },
    ],
  };

  const clicksByType = {
    email: 45,
    whatsapp: 32,
    phone: 28,
    address: 15,
  };

  const statCards = [
    {
      label: t('analytics.totalViews'),
      value: '1,234',
      change: '+12%',
      color: colors.primary,
    },
    {
      label: t('analytics.totalClicks'),
      value: '456',
      change: '+8%',
      color: colors.success || '#10B981',
    },
    {
      label: t('analytics.conversionRate'),
      value: '37%',
      change: '+4%',
      color: colors.warning || '#F59E0B',
    },
    {
      label: t('analytics.uniqueVisitors'),
      value: '892',
      change: '+5%',
      color: colors.info || '#3B82F6',
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title={t('analytics.analytics')} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Time Period Selector */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
          {(['week', 'month', 'year'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => setTimePeriod(period)}
              style={{
                flex: 1,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 8,
                backgroundColor: timePeriod === period ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  color: timePeriod === period ? '#FFFFFF' : colors.text,
                  fontSize: 12,
                  fontWeight: '600',
                  textAlign: 'center',
                }}
              >
                {period === 'week' ? t('analytics.thisWeek') : period === 'month' ? t('analytics.thisMonth') : t('analytics.thisYear')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Statistics Cards */}
        <View style={{ gap: 12, marginBottom: 24 }}>
          {statCards.map((stat, index) => (
            <Card
              key={index}
              padding="lg"
              style={{
                borderLeftWidth: 4,
                borderLeftColor: stat.color,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 4,
                    }}
                  >
                    {stat.label}
                  </Text>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 24,
                      fontWeight: 'bold',
                    }}
                  >
                    {stat.value}
                  </Text>
                </View>
                <Badge
                  label={stat.change}
                  variant="success"
                  size="sm"
                />
              </View>
            </Card>
          ))}
        </View>

        {/* Views Chart */}
        <Card padding="lg" style={{ marginBottom: 24 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 16,
              fontWeight: '600',
              marginBottom: 12,
            }}
          >
            {t('analytics.viewsOverTime')}
          </Text>

          <LineChart
            data={chartData}
            width={320}
            height={220}
            chartConfig={{
              backgroundColor: colors.background,
              backgroundGradientFrom: colors.background,
              backgroundGradientTo: colors.background,
              decimalPlaces: 0,
              color: () => colors.primary,
              labelColor: () => colors.textSecondary,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '5',
                strokeWidth: '2',
                stroke: colors.primary,
              },
              propsForBackgroundLines: {
                strokeDasharray: '0',
                stroke: colors.border,
                strokeWidth: 0.5,
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </Card>

        {/* Clicks Breakdown */}
        <Card padding="lg" style={{ marginBottom: 24 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 16,
              fontWeight: '600',
              marginBottom: 12,
            }}
          >
            {t('analytics.clickBreakdown')}
          </Text>

          <BarChart
            data={{
              labels: ['Email', 'WhatsApp', 'Telefone', 'Endereço'],
              datasets: [
                {
                  data: [
                    clicksByType.email,
                    clicksByType.whatsapp,
                    clicksByType.phone,
                    clicksByType.address,
                  ],
                },
              ],
            }}
            width={320}
            height={220}
            chartConfig={{
              backgroundColor: colors.background,
              backgroundGradientFrom: colors.background,
              backgroundGradientTo: colors.background,
              decimalPlaces: 0,
              color: () => colors.primary,
              labelColor: () => colors.textSecondary,
              style: {
                borderRadius: 16,
              },
              propsForBackgroundLines: {
                strokeDasharray: '0',
                stroke: colors.border,
                strokeWidth: 0.5,
              },
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </Card>

        {/* Detailed Breakdown Table */}
        <Card padding="lg">
          <Text
            style={{
              color: colors.text,
              fontSize: 16,
              fontWeight: '600',
              marginBottom: 16,
            }}
          >
            {t('analytics.detailedBreakdown')}
          </Text>

          <View style={{ gap: 12 }}>
            {Object.entries(clicksByType).map(([key, value]) => (
              <View
                key={key}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <View>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 14,
                      fontWeight: '500',
                      textTransform: 'capitalize',
                    }}
                  >
                    {t(`analytics.${key}`)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: 14,
                      fontWeight: '600',
                    }}
                  >
                    {value}
                  </Text>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                    }}
                  >
                    {((value / Object.values(clicksByType).reduce((a, b) => a + b)) * 100).toFixed(1)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
