export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          job_title: string;
          company: string;
          address: string;
          primary_email: string;
          secondary_email: string;
          mobile_phone: string;
          work_phone: string;
          avatar_url: string | null;
          cover_url: string | null;
          card_lang: 'pt' | 'en';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          job_title?: string;
          company?: string;
          address?: string;
          primary_email?: string;
          secondary_email?: string;
          mobile_phone?: string;
          work_phone?: string;
          avatar_url?: string | null;
          cover_url?: string | null;
          card_lang?: 'pt' | 'en';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          job_title?: string;
          company?: string;
          address?: string;
          primary_email?: string;
          secondary_email?: string;
          mobile_phone?: string;
          work_phone?: string;
          avatar_url?: string | null;
          cover_url?: string | null;
          card_lang?: 'pt' | 'en';
          updated_at?: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          company: string | null;
          job_title: string | null;
          notes: string | null;
          source: 'manual' | 'received';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          job_title?: string | null;
          notes?: string | null;
          source?: 'manual' | 'received';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          job_title?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      contact_exchanges: {
        Row: {
          id: string;
          owner_id: string;
          full_name: string;
          email: string;
          phone: string;
          company: string;
          job_title: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          full_name: string;
          email: string;
          phone: string;
          company?: string;
          job_title?: string;
          message?: string;
          created_at?: string;
        };
      };
      profile_views: {
        Row: {
          id: string;
          profile_id: string;
          visitor_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          visitor_id?: string | null;
          created_at?: string;
        };
      };
      profile_clicks: {
        Row: {
          id: string;
          profile_id: string;
          click_type: 'email' | 'phone' | 'whatsapp' | 'address' | 'website';
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          click_type: string;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {
      scan_business_card: {
        Args: {
          image_base64: string;
        };
        Returns: {
          name: string;
          email: string;
          phone: string;
          company: string;
          job_title: string;
          notes: string;
        };
      };
    };
    Enums: {};
  };
};
