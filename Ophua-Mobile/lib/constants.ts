// Colors
export const COLORS = {
  light: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#000000',
    textSecondary: '#666666',
    border: '#E5E5E5',
    primary: '#007AFF',
    primaryLight: '#E8F2FE',
    success: '#34C759',
    error: '#FF3B30',
    warning: '#FF9500',
  },
  dark: {
    background: '#000000',
    surface: '#1C1C1C',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    border: '#333333',
    primary: '#0A84FF',
    primaryLight: '#1A3A5C',
    success: '#30B34B',
    error: '#FF453A',
    warning: '#FF9500',
  },
} as const;

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

// Border Radius
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/auth/v1/token',
    signup: '/functions/v1/public-signup',
    logout: '/auth/v1/logout',
    forgotPassword: '/functions/v1/forgot-password',
    resetPassword: '/functions/v1/reset-password',
  },
  
  // Profiles
  profiles: {
    get: '/rest/v1/profiles',
    update: '/rest/v1/profiles',
    publicGet: '/functions/v1/public-profile',
  },
  
  // Contacts
  contacts: {
    list: '/rest/v1/contacts',
    get: '/rest/v1/contacts',
    create: '/rest/v1/contacts',
    update: '/rest/v1/contacts',
    delete: '/rest/v1/contacts',
  },
  
  // Analytics
  analytics: {
    views: '/rest/v1/profile_views',
    clicks: '/rest/v1/profile_clicks',
    exchanges: '/rest/v1/contact_exchanges',
  },
  
  // Business Card Scanner
  scanner: {
    scan: '/functions/v1/scan-business-card',
  },
  
  // Tracking
  tracking: {
    profileViews: '/functions/v1/profile-views',
    profileClicks: '/functions/v1/profile-clicks',
    checkContact: '/functions/v1/check-contact-status',
  },
} as const;

// Validation Messages
export const VALIDATION_MESSAGES = {
  pt: {
    emailInvalid: 'Email inválido',
    passwordMin: 'Senha deve ter no mínimo 6 caracteres',
    passwordMismatch: 'Senhas não correspondem',
    nameRequired: 'Nome obrigatório',
    emailRequired: 'Email obrigatório',
    phoneInvalid: 'Telefone inválido',
  },
  en: {
    emailInvalid: 'Invalid email',
    passwordMin: 'Password must be at least 6 characters',
    passwordMismatch: 'Passwords do not match',
    nameRequired: 'Name is required',
    emailRequired: 'Email is required',
    phoneInvalid: 'Invalid phone',
  },
} as const;

// Analytics Events
export const ANALYTICS_EVENTS = {
  profileViewed: 'profile_viewed',
  profileClicked: 'profile_clicked',
  contactAdded: 'contact_added',
  contactRemoved: 'contact_removed',
  cardScanned: 'card_scanned',
} as const;

// Language
export const SUPPORTED_LANGUAGES = ['pt', 'en'] as const;
export type Language = typeof SUPPORTED_LANGUAGES[number];

// Storage Keys
export const STORAGE_KEYS = {
  authToken: 'auth_token',
  authRefresh: 'auth_refresh',
  userId: 'user_id',
  language: 'language',
  theme: 'theme',
  userProfile: 'user_profile',
} as const;
