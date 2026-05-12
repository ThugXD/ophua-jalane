// Database Types
export interface Profile {
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
  updated_at?: string;
}

export interface Contact {
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
  updated_at?: string;
}

export interface ContactExchange {
  id: string;
  owner_id: string;
  full_name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  message: string;
  created_at: string;
}

export interface ProfileView {
  id: string;
  profile_id: string;
  visitor_id: string | null;
  created_at: string;
}

export interface ProfileClick {
  id: string;
  profile_id: string;
  click_type: 'email' | 'phone' | 'whatsapp' | 'address' | 'website';
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
  };
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: User;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// Form Types
export interface ProfileFormData {
  full_name: string;
  job_title: string;
  company: string;
  address: string;
  primary_email: string;
  secondary_email: string;
  mobile_phone: string;
  work_phone: string;
  card_lang: 'pt' | 'en';
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  notes: string;
}

export interface ContactExchangeFormData {
  full_name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  message: string;
}

export interface BusinessCardData {
  name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  notes: string;
}

// Analytics Types
export interface ProfileStats {
  views: number;
  clicks: number;
  clicksByType: Record<string, number>;
  views_last_30_days: { date: string; count: number }[];
}

// Storage Types
export interface StoredAuthData {
  access_token: string;
  refresh_token: string;
  user_id: string;
  expires_at: number;
}
