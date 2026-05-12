import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Home, Users, BarChart3, Settings } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import HomeScreen from './home';
import ContactsScreen from './contacts/_layout';
import AnalyticsScreen from './analytics';
import SettingsScreen from './settings';

const Tab = createBottomTabNavigator();

export default function AppLayout() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();

  const TabBarIcon = ({ Icon, color }: { Icon: any; color: string }) => (
    <Icon size={24} color={color} />
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 4,
        },
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen
        name="home"
        options={{
          title: t('common.home'),
          tabBarIcon: ({ color }) => <TabBarIcon Icon={Home} color={color} />,
        }}
      />

      <Tab.Screen
        name="contacts"
        options={{
          title: t('common.contacts'),
          tabBarIcon: ({ color }) => <TabBarIcon Icon={Users} color={color} />,
        }}
      />

      <Tab.Screen
        name="analytics"
        options={{
          title: t('common.analytics'),
          tabBarIcon: ({ color }) => <TabBarIcon Icon={BarChart3} color={color} />,
        }}
      />

      <Tab.Screen
        name="settings"
        options={{
          title: t('common.settings'),
          tabBarIcon: ({ color }) => <TabBarIcon Icon={Settings} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
