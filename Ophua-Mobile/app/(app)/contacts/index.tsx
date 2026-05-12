import React, { useMemo, useState } from 'react';
import {
  View,
  SafeAreaView,
  FlatList,
  Text,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Search, Trash2, Camera } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useContacts, useDeleteContact } from '@/hooks/useContacts';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Empty } from '@/components/ui/Empty';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { ToastManager } from '@/components/ui/Toast';

export default function ContactsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const { data: contacts = [], isLoading, refetch } = useContacts(user?.id);
  const deleteContact = useDeleteContact();

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ visible: boolean; contactId: string | null }>({
    visible: false,
    contactId: null,
  });

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const query = searchQuery.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.phone?.includes(query)
    );
  }, [contacts, searchQuery]);

  const handleDeleteContact = async () => {
    if (!deleteModal.contactId) return;
    try {
      await deleteContact.mutateAsync(deleteModal.contactId);
      ToastManager.show(t('contacts.deleteContactSuccess'), 'success');
      setDeleteModal({ visible: false, contactId: null });
    } catch (error) {
      console.error('[ContactsScreen] Delete error:', error);
      ToastManager.show(t('contacts.contactDeleteFailed'), 'error');
    }
  };

  const renderContactCard = ({ item }: { item: any }) => {
    const initials = item.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <TouchableOpacity
        onPress={() => router.push(`/(app)/contacts/${item.id}`)}
        style={{ marginBottom: 12 }}
      >
        <Card padding="lg">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flexDirection: 'row', flex: 1, marginRight: 12 }}>
              <Avatar initials={initials} size="md" />

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 14,
                    fontWeight: '600',
                    marginBottom: 4,
                  }}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>

                {item.email && (
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 4,
                    }}
                    numberOfLines={1}
                  >
                    {item.email}
                  </Text>
                )}

                {item.company && (
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 6,
                    }}
                    numberOfLines={1}
                  >
                    {item.company}
                  </Text>
                )}

                <Badge
                  label={item.source === 'manual' ? t('contacts.manual') : t('contacts.received')}
                  variant={item.source === 'manual' ? 'primary' : 'secondary'}
                  size="sm"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setDeleteModal({ visible: true, contactId: item.id })}
              style={{ padding: 8 }}
            >
              <Trash2 size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 }}>
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: 'bold' }}>
          {t('common.contacts')}
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.push('/(app)/contacts/scanner')}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: colors.surface,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Camera size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(app)/contacts/create')}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {contacts.length > 0 && (
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderRadius: 8,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Search size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              placeholder={t('contacts.searchContacts')}
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                color: colors.text,
                fontSize: 14,
                paddingVertical: 10,
              }}
            />
          </View>
        </View>
      )}

      {contacts.length === 0 ? (
        <Empty
          title={t('contacts.noContacts')}
          description={t('contacts.noContacts')}
        />
      ) : (
        <FlatList
          data={filteredContacts}
          renderItem={renderContactCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexGrow: 1,
          }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />}
          ListEmptyComponent={
            <Empty
              title="Nenhum contato encontrado"
              description={`"${searchQuery}" não foi encontrado`}
            />
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isVisible={deleteModal.visible}
        title={t('contacts.deleteContact')}
        onClose={() => setDeleteModal({ visible: false, contactId: null })}
        onConfirm={handleDeleteContact}
        confirmLabel={t('common.delete')}
        isDanger
      >
        <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
          {t('contacts.deleteContactConfirm')}
        </Text>
      </Modal>
    </SafeAreaView>
  );
}
