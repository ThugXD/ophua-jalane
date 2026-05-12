// API Response Types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
  message?: string;
  status?: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: string;
}

// Auth Response Types
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user?: {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
}

export interface SignupResponse {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}

// Profile Response Types
export interface ProfileResponse {
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
}

// Contact Response Types
export interface ContactResponse {
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
}

// Analytics Response Types
export interface ProfileViewResponse {
  id: string;
  profile_id: string;
  visitor_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileClickResponse {
  id: string;
  profile_id: string;
  click_type: 'email' | 'phone' | 'whatsapp' | 'address' | 'website';
  created_at: string;
  updated_at: string;
}

export interface ContactExchangeResponse {
  id: string;
  owner_id: string;
  full_name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  message: string;
  created_at: string;
  updated_at: string;
}

// Scanner Response Types
export interface ScannerResponse {
  name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  notes?: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
