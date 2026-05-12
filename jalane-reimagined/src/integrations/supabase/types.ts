export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          free_trial_days: number
          id: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          free_trial_days?: number
          id?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          free_trial_days?: number
          id?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string
          actor_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          group_id: string | null
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_email?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          group_id?: string | null
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_email?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          group_id?: string | null
          id?: string
          metadata?: Json
        }
        Relationships: []
      }
      contact_exchanges: {
        Row: {
          company: string
          created_at: string
          email: string
          full_name: string
          id: string
          job_title: string
          message: string
          owner_id: string
          phone: string
        }
        Insert: {
          company?: string
          created_at?: string
          email?: string
          full_name: string
          id?: string
          job_title?: string
          message?: string
          owner_id: string
          phone?: string
        }
        Update: {
          company?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          job_title?: string
          message?: string
          owner_id?: string
          phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_exchanges_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string
          read: boolean
        }
        Insert: {
          created_at?: string
          email?: string
          id?: string
          message: string
          name: string
          phone?: string
          read?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string
          read?: boolean
        }
        Relationships: []
      }
      contacts: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          id: string
          job_title: string | null
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          job_title?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          job_title?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          created_at: string
          group_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          address: string
          admin_id: string | null
          cover_url: string | null
          created_at: string
          created_by: string
          description: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          address?: string
          admin_id?: string | null
          cover_url?: string | null
          created_at?: string
          created_by: string
          description?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          address?: string
          admin_id?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          metadata: Json
          read_at: string | null
          recipient_id: string
          title: string
          type: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          metadata?: Json
          read_at?: string | null
          recipient_id: string
          title: string
          type: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          metadata?: Json
          read_at?: string | null
          recipient_id?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      profile_clicks: {
        Row: {
          click_type: string
          created_at: string
          id: string
          profile_id: string
          viewer_id: string | null
        }
        Insert: {
          click_type: string
          created_at?: string
          id?: string
          profile_id: string
          viewer_id?: string | null
        }
        Update: {
          click_type?: string
          created_at?: string
          id?: string
          profile_id?: string
          viewer_id?: string | null
        }
        Relationships: []
      }
      profile_views: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          viewer_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          viewer_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          viewer_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string
          avatar_url: string | null
          card_lang: string
          company: string
          cover_url: string | null
          created_at: string
          full_name: string
          id: string
          job_title: string
          mobile_phone: string
          primary_email: string
          secondary_email: string
          updated_at: string
          work_phone: string
        }
        Insert: {
          address?: string
          avatar_url?: string | null
          card_lang?: string
          company?: string
          cover_url?: string | null
          created_at?: string
          full_name?: string
          id: string
          job_title?: string
          mobile_phone?: string
          primary_email?: string
          secondary_email?: string
          updated_at?: string
          work_phone?: string
        }
        Update: {
          address?: string
          avatar_url?: string | null
          card_lang?: string
          company?: string
          cover_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          job_title?: string
          mobile_phone?: string
          primary_email?: string
          secondary_email?: string
          updated_at?: string
          work_phone?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          group_id: string | null
          id: string
          notes: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          group_id?: string | null
          id?: string
          notes?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          group_id?: string | null
          id?: string
          notes?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_plan: {
        Args: { _user_id: string }
        Returns: {
          expires_at: string
          is_active: boolean
          plan: Database["public"]["Enums"]["subscription_plan"]
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_group_admin: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      is_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      notify_admins: {
        Args: { _body: string; _metadata?: Json; _title: string; _type: string }
        Returns: undefined
      }
      user_admin_groups: { Args: { _user_id: string }; Returns: string[] }
    }
    Enums: {
      app_role: "superadmin" | "admin" | "user"
      subscription_plan: "free" | "pro" | "business"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["superadmin", "admin", "user"],
      subscription_plan: ["free", "pro", "business"],
    },
  },
} as const
