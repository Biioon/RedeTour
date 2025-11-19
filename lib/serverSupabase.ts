/**
 * Cliente Supabase para uso server-side
 * Este cliente usa a service role key e NUNCA deve ser exposto ao cliente
 * 
 * IMPORTANTE: Use este cliente apenas em:
 * - Server Components
 * - Server Actions
 * - API Routes
 * - Middleware
 * 
 * NUNCA use em Client Components!
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

// Variáveis de ambiente para server-side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Validação de variáveis de ambiente
if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase server environment variables. Please check your .env file.');
}

/**
 * Cria um cliente Supabase com privilégios administrativos
 * Use com extrema cautela - este cliente ignora RLS!
 */
export function createServiceRoleClient() {
  return createServerClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    cookies: {
      get(name: string) {
        const cookieStore = cookies();
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        const cookieStore = cookies();
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string) {
        const cookieStore = cookies();
        cookieStore.set({ name, value: '', maxAge: 0 });
      },
    },
    global: {
      headers: {
        'x-application-name': 'redetour-server',
      },
    },
  });
}

/**
 * Cria um cliente Supabase com contexto de usuário autenticado
 * Este cliente respeita RLS e deve ser usado para operações em nome do usuário
 */
export function createAuthenticatedClient() {
  const cookieStore = cookies();
  
  return createServerClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string) {
        cookieStore.set({ name, value: '', maxAge: 0 });
      },
    },
    global: {
      headers: {
        'x-application-name': 'redetour-authenticated',
      },
    },
  });
}

/**
 * Helper para obter sessão atual
 */
export async function getSession() {
  const supabase = createAuthenticatedClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Helper para obter usuário atual
 */
export async function getUser() {
  const supabase = createAuthenticatedClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Helper para obter perfil completo do usuário
 */
export async function getUserProfile() {
  const session = await getSession();
  if (!session?.user) return null;
  
  const supabase = createServiceRoleClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
    
  return profile;
}

/**
 * Helper para verificar se usuário tem role específico
 */
export async function hasUserRole(role: string): Promise<boolean> {
  const profile = await getUserProfile();
  return profile?.role === role;
}

/**
 * Helper para verificar se usuário é admin
 */
export async function isUserAdmin(): Promise<boolean> {
  return hasUserRole('admin');
}

/**
 * Helper para verificar se usuário é parceiro
 */
export async function isUserPartner(): Promise<boolean> {
  return hasUserRole('partner');
}

/**
 * Helper para verificar se usuário é afiliado
 */
export async function isUserAffiliate(): Promise<boolean> {
  return hasUserRole('affiliate');
}

/**
 * Helper para criar registro de segurança
 */
export async function logSecurityEvent(
  eventType: string,
  metadata?: Record<string, any>
) {
  try {
    const session = await getSession();
    const ip = headers().get('x-forwarded-for') ?? 'unknown';
    const userAgent = headers().get('user-agent') ?? 'unknown';
    
    const supabase = createServiceRoleClient();
    await supabase.from('security_events').insert({
      event_type: eventType,
      user_id: session?.user?.id,
      ip,
      user_agent: userAgent,
      meta: metadata,
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

/**
 * Helper para obter código de afiliado dos cookies
 */
export function getAffiliateCode(): string | null {
  const cookieStore = cookies();
  return cookieStore.get('affiliate_code')?.value ?? null;
}

/**
 * Helper para definir código de afiliado nos cookies
 */
export async function setAffiliateCode(code: string, days: number = 30) {
  const cookieStore = cookies();
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  cookieStore.set('affiliate_code', code, {
    expires,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  });
}

/**
 * Helper para remover código de afiliado dos cookies
 */
export async function removeAffiliateCode() {
  const cookieStore = cookies();
  cookieStore.set('affiliate_code', '', {
    maxAge: 0,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  });
}

/**
 * Helper para buscar afiliado por código
 */
export async function getAffiliateByCode(code: string) {
  const supabase = createServiceRoleClient();
  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .single();
    
  return affiliate;
}

/**
 * Helper para registrar clique de afiliado
 */
export async function trackAffiliateClick(
  affiliateId: string,
  path: string,
  ip?: string,
  userAgent?: string,
  referrer?: string
) {
  try {
    const supabase = createServiceRoleClient();
    await supabase.from('affiliate_clicks').insert({
      affiliate_id: affiliateId,
      path,
      ip: ip ?? 'unknown',
      user_agent: userAgent ?? 'unknown',
      referrer: referrer ?? null,
    });
  } catch (error) {
    console.error('Failed to track affiliate click:', error);
  }
}

/**
 * Helper para registrar venda de afiliado
 */
export async function trackAffiliateSale(
  affiliateId: string,
  bookingId: string,
  commissionAmount: number,
  commissionRate: number
) {
  try {
    const supabase = createServiceRoleClient();
    await supabase.from('affiliate_sales').insert({
      affiliate_id: affiliateId,
      booking_id: bookingId,
      commission_amount: commissionAmount,
      commission_rate: commissionRate,
      status: 'pending',
    });
  } catch (error) {
    console.error('Failed to track affiliate sale:', error);
  }
}

/**
 * Helper para calcular comissão baseada no tipo de produto
 */
export async function calculateCommission(
  productType: 'accommodation' | 'experience' | 'vehicle',
  totalPrice: number,
  category?: string
): Promise<{ rate: number; amount: number }> {
  const supabase = createServiceRoleClient();
  
  // Buscar configuração de comissão
  const { data: commission } = await supabase
    .from('commissions')
    .select('default_percent')
    .eq('product_type', productType)
    .eq('is_active', true)
    .maybeSingle();
    
  const rate = commission?.default_percent ?? 0.05; // 5% default
  const amount = totalPrice * rate;
  
  return { rate, amount };
}

// Import necessário para server-side
import { headers } from 'next/headers';

export default {
  createServiceRoleClient,
  createAuthenticatedClient,
  getSession,
  getUser,
  getUserProfile,
  hasUserRole,
  isUserAdmin,
  isUserPartner,
  isUserAffiliate,
  logSecurityEvent,
  getAffiliateCode,
  setAffiliateCode,
  removeAffiliateCode,
  getAffiliateByCode,
  trackAffiliateClick,
  trackAffiliateSale,
  calculateCommission,