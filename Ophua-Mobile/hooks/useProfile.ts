import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Profile, ProfileFormData } from '../types';

const PROFILE_QUERY_KEY = 'profile';

export function useProfile(userId: string | null | undefined) {
  return useQuery({
    queryKey: [PROFILE_QUERY_KEY, userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!userId,
  });
}

export function usePublicProfile(profileId: string | null | undefined) {
  return useQuery({
    queryKey: [PROFILE_QUERY_KEY, 'public', profileId],
    queryFn: async () => {
      if (!profileId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!profileId,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ProfileFormData>) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', session.session.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY] });
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileUri: string) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user.id) throw new Error('Not authenticated');

      // Convert URI to blob
      const response = await fetch(fileUri);
      const blob = await response.blob();

      // Upload to storage
      const fileName = `${session.session.user.id}-${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, { upsert: true });

      if (error) throw error;

      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      // Update profile with new avatar URL
      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl.publicUrl })
        .eq('id', session.session.user.id);

      return publicUrl.publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY] });
    },
  });
}

export function useUploadCover() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileUri: string) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user.id) throw new Error('Not authenticated');

      // Convert URI to blob
      const response = await fetch(fileUri);
      const blob = await response.blob();

      // Upload to storage
      const fileName = `${session.session.user.id}-cover-${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from('covers')
        .upload(fileName, blob, { upsert: true });

      if (error) throw error;

      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from('covers')
        .getPublicUrl(data.path);

      // Update profile with new cover URL
      await supabase
        .from('profiles')
        .update({ cover_url: publicUrl.publicUrl })
        .eq('id', session.session.user.id);

      return publicUrl.publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY] });
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.admin.deleteUser(
        (await supabase.auth.getSession()).data.session?.user.id || ''
      );
      if (error) throw error;
    },
  });
}
