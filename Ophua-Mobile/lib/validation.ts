import { z } from 'zod';

// Auth Schemas
export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const SignupSchema = z.object({
  full_name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Senhas não correspondem',
  path: ['confirm_password'],
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const ResetPasswordSchema = z.object({
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Senhas não correspondem',
  path: ['confirm_password'],
});

// Profile Schemas
export const ProfileFormSchema = z.object({
  full_name: z.string().min(2, 'Nome obrigatório'),
  job_title: z.string().optional().default(''),
  company: z.string().optional().default(''),
  address: z.string().optional().default(''),
  primary_email: z.string().email('Email inválido').optional().default(''),
  secondary_email: z.string().email('Email inválido').optional().or(z.literal('')).default(''),
  mobile_phone: z.string().optional().default(''),
  work_phone: z.string().optional().default(''),
  card_lang: z.enum(['pt', 'en']).default('pt'),
});

// Contact Schemas
export const ContactFormSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional().default(''),
  company: z.string().optional().default(''),
  job_title: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

// Contact Exchange Schema
export const ContactExchangeSchema = z.object({
  full_name: z.string().min(2, 'Nome obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string(),
  company: z.string().optional().default(''),
  job_title: z.string().optional().default(''),
  message: z.string().optional().default(''),
});

// Business Card Scanner Schema
export const BusinessCardSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional().default(''),
  company: z.string().optional().default(''),
  job_title: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

// Types from Schemas
export type LoginInput = z.infer<typeof LoginSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type ProfileFormInput = z.infer<typeof ProfileFormSchema>;
export type ContactFormInput = z.infer<typeof ContactFormSchema>;
export type ContactExchangeInput = z.infer<typeof ContactExchangeSchema>;
export type BusinessCardInput = z.infer<typeof BusinessCardSchema>;
