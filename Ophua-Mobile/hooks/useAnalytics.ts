import { useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useTrackProfileView() {
  return useMutation({
    mutationFn: async (profileId: string) => {
      const { error } = await supabase
        .from('profile_views')
        .insert({
          profile_id: profileId,
          visitor_id: null,
        });

      if (error) throw error;
    },
  });
}

export function useTrackProfileClick() {
  return useMutation({
    mutationFn: async (profileId: string, clickType: 'email' | 'phone' | 'whatsapp' | 'address' | 'website') => {
      const { error } = await supabase
        .from('profile_clicks')
        .insert({
          profile_id: profileId,
          click_type: clickType,
        });

      if (error) throw error;
    },
  });
}
