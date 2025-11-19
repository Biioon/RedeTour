/**
 * Cliente Supabase para uso no browser
 * Este cliente usa a anon key e é seguro para uso em componentes client-side
 * 
 * IMPORTANTE: Nunca exponha a service role key no cliente!
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

// Variáveis de ambiente necessárias
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Validação de variáveis de ambiente
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

/**
 * Cria e retorna um cliente Supabase configurado para uso no browser
 * Este cliente automaticamente gerencia cookies e sessões
 */
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        const cookieStore = document.cookie
          .split('; ')
          .find(row => row.startsWith(`${name}=`));
        return cookieStore?.split('=')[1] || null;
      },
      set(name: string, value: string, options?: any) {
        document.cookie = `${name}=${value}; path=/; ${options?.secure ? 'secure;' : ''} ${options?.sameSite ? `samesite=${options.sameSite};` : ''}`;
      },
      remove(name: string) {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      },
    },
    global: {
      headers: {
        'x-application-name': 'redetour-client',
      },
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'redetour-auth-token',
    },
    db: {
      schema: 'public',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
}

/**
 * Hook customizado para usar Supabase em componentes client-side
 * Exemplo de uso:
 * 
 * ```tsx
 * 'use client';
 * import { useSupabase } from '@/lib/supabaseClient';
 * 
 * export function MyComponent() {
 *   const supabase = useSupabase();
 *   
 *   const handleSignOut = async () => {
 *     await supabase.auth.signOut();
 *   };
 *   
 *   return <button onClick={handleSignOut}>Sign Out</button>;
 * }
 * ```
 */
import { useMemo } from 'react';

export function useSupabase() {
  return useMemo(() => createClient(), []);
}

/**
 * Tipos úteis para trabalhar com Supabase
 */
export type SupabaseClient = ReturnType<typeof createClient>;
export type User = Database['public']['Tables']['profiles']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type Accommodation = Database['public']['Tables']['accommodations']['Row'];
export type Experience = Database['public']['Tables']['experiences']['Row'];
export type Vehicle = Database['public']['Tables']['vehicles']['Row'];
export type Affiliate = Database['public']['Tables']['affiliates']['Row'];

/**
 * Helper para verificar se usuário está autenticado
 */
export async function isAuthenticated(supabase: SupabaseClient): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

/**
 * Helper para obter usuário atual
 */
export async function getCurrentUser(supabase: SupabaseClient): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  return profile;
}

/**
 * Helper para obter role do usuário
 */
export async function getUserRole(supabase: SupabaseClient): Promise<string | null> {
  const user = await getCurrentUser(supabase);
  return user?.role || null;
}

/**
 * Helper para verificar se usuário tem role específico
 */
export async function hasRole(supabase: SupabaseClient, role: string): Promise<boolean> {
  const userRole = await getUserRole(supabase);
  return userRole === role;
}

/**
 * Helper para verificar se usuário é admin
 */
export async function isAdmin(supabase: SupabaseClient): Promise<boolean> {
  return hasRole(supabase, 'admin');
}

/**
 * Helper para verificar se usuário é parceiro
 */
export async function isPartner(supabase: SupabaseClient): Promise<boolean> {
  return hasRole(supabase, 'partner');
}

/**
 * Helper para verificar se usuário é afiliado
 */
export async function isAffiliate(supabase: SupabaseClient): Promise<boolean> {
  return hasRole(supabase, 'affiliate');
}

/**
 * Helper para obter código de afiliado dos cookies
 */
export function getAffiliateCode(): string | null {
  if (typeof window === 'undefined') return null;
  
  const cookieStore = document.cookie
    .split('; ')
    .find(row => row.startsWith('affiliate_code='));
  return cookieStore?.split('=')[1] || null;
}

/**
 * Helper para definir código de afiliado nos cookies
 */
export function setAffiliateCode(code: string, days: number = 30): void {
  if (typeof window === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  document.cookie = `affiliate_code=${code}; expires=${expires.toUTCString()}; path=/; SameSite=Lax; ${process.env.NODE_ENV === 'production' ? 'Secure' : ''}`;
}

/**
 * Helper para remover código de afiliado dos cookies
 */
export function removeAffiliateCode(): void {
  if (typeof window === 'undefined') return;
  
  document.cookie = 'affiliate_code=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

export