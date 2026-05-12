import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Contact, ContactFormData, ContactExchange, ContactExchangeFormData } from '../types';

const CONTACTS_QUERY_KEY = 'contacts';
const CONTACT_EXCHANGES_QUERY_KEY = 'contact_exchanges';

export function useContacts(userId: string | null | undefined) {
  return useQuery({
    queryKey: [CONTACTS_QUERY_KEY, userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Contact[];
    },
    enabled: !!userId,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactData: ContactFormData) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('contacts')
        .insert({
          ...contactData,
          user_id: session.session.user.id,
          source: 'manual',
        })
        .select()
        .single();

      if (error) throw error;
      return data as Contact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTACTS_QUERY_KEY] });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Contact) => {
      const { error } = await supabase
        .from('contacts')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTACTS_QUERY_KEY] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTACTS_QUERY_KEY] });
    },
  });
}

// Contact Exchanges
export function useContactExchanges(userId: string | null | undefined) {
  return useQuery({
    queryKey: [CONTACT_EXCHANGES_QUERY_KEY, userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('contact_exchanges')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ContactExchange[];
    },
    enabled: !!userId,
  });
}

export function useSendContactExchange() {
  return useMutation({
    mutationFn: async (exchangeData: ContactExchangeFormData & { targetProfileId: string }) => {
      const { targetProfileId, ...data } = exchangeData;

      const { error } = await supabase
        .from('contact_exchanges')
        .insert({
          ...data,
          owner_id: targetProfileId,
        });

      if (error) throw error;
    },
  });
}

export function useDeleteContactExchange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (exchangeId: string) => {
      const { error } = await supabase
        .from('contact_exchanges')
        .delete()
        .eq('id', exchangeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTACT_EXCHANGES_QUERY_KEY] });
    },
  });
}
