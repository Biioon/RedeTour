/**
 * Helpers e utilitários para o middleware de autenticação
 * Funções reutilizáveis para verificação de permissões e roles
 */

import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Interface para dados do usuário com perfil
 */
export interface UserWithProfile {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'affiliate' | 'partner';
  full_name?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

/**
 * Cria cliente Supabase para uso no middleware
 */
export function createMiddlewareSupabaseClient(request: NextRequest) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        // Não podemos setar cookies diretamente no middleware
        // Mas precisamos implementar a interface
        return;
      },
      remove(name: string) {
        // Não podemos remover cookies diretamente no middleware
        return;
      },
    },
  });
}

/**
 * Obtém o usuário atual com perfil completo
 */
export async function getCurrentUserWithProfile(request: NextRequest): Promise<UserWithProfile | null> {
  try {
    const supabase = createMiddlewareSupabaseClient(request);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    return {
      id: user.id,
      email: user.email!,
      role: profile.role || 'user',
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      is_active: profile.is_active ?? true,
      created_at: profile.created_at,
    };
  } catch (error) {
    console.error('[Auth Helpers] Erro ao obter usuário:', error);
    return null;
  }
}

/**
 * Verifica se o usuário tem uma role específica
 */
export async function hasRole(request: NextRequest, role: string | string[]): Promise<boolean> {
  const user = await getCurrentUserWithProfile(request);
  
  if (!user) {
    return false;
  }

  if (Array.isArray(role)) {
    return role.includes(user.role);
  }

  return user.role === role;
}

/**
 * Verifica se o usuário é admin
 */
export async function isAdmin(request: NextRequest): Promise<boolean> {
  return hasRole(request, 'admin');
}

/**
 * Verifica se o usuário é parceiro
 */
export async function isPartner(request: NextRequest): Promise<boolean> {
  return hasRole(request, 'partner');
}

/**
 * Verifica se o usuário é afiliado
 */
export async function isAffiliate(request: NextRequest): Promise<boolean> {
  return hasRole(request, 'affiliate');
}

/**
 * Verifica se o usuário está ativo
 */
export async function isUserActive(request: NextRequest): Promise<boolean> {
  const user = await getCurrentUserWithProfile(request);
  return user?.is_active ?? false;
}

/**
 * Configurações de rotas do sistema
 */
export const ROUTE_CONFIG = {
  // Rotas públicas (sem autenticação)
  public: [
    '/',
    '/login',
    '/register',
    '/auth/callback',
    '/forgot-password',
    '/reset-password',
    '/terms',
    '/privacy',
    '/about',
    '/contact',
    '/tours',
    '/blog',
  ],

  // Rotas de autenticação (redirecionar se autenticado)
  auth: [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ],

  // Rotas protegidas (requerem autenticação)
  protected: [
    '/dashboard',
    '/profile',
    '/settings',
    '/bookings',
    '/favorites',
    '/messages',
    '/notifications',
  ],

  // Rotas de admin (requerem role admin)
  admin: [
    '/admin',
    '/admin/dashboard',
    '/admin/users',
    '/admin/tours',
    '/admin/bookings',
    '/admin/commissions',
    '/admin/settings',
  ],

  // Rotas de parceiro (requerem role partner ou admin)
  partner: [
    '/partner',
    '/partner/dashboard',
    '/partner/tours',
    '/partner/bookings',
    '/partner/earnings',
  ],

  // Rotas de afiliado (requerem role affiliate ou superior)
  affiliate: [
    '/affiliate',
    '/affiliate/dashboard',
    '/affiliate/links',
    '/affiliate/commissions',
    '/affiliate/stats',
  ],
} as const;

/**
 * Verifica se uma rota é pública
 */
export function isPublicRoute(pathname: string): boolean {
  return ROUTE_CONFIG.public.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
}

/**
 * Verifica se uma rota é de autenticação
 */
export function isAuthRoute(pathname: string): boolean {
  return ROUTE_CONFIG.auth.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
}

/**
 * Verifica se uma rota é protegida
 */
export function isProtectedRoute(pathname: string): boolean {
  return ROUTE_CONFIG.protected.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
}

/**
 * Verifica se uma rota é de admin
 */
export function isAdminRoute(pathname: string): boolean {
  return ROUTE_CONFIG.admin.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
}

/**
 * Verifica se uma rota é de parceiro
 */
export function isPartnerRoute(pathname: string): boolean {
  return ROUTE_CONFIG.partner.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
}

/**
 * Verifica se uma rota é de afiliado
 */
export function isAffiliateRoute(pathname: string): boolean {
  return ROUTE_CONFIG.affiliate.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
}

/**
 * Cria URL de redirecionamento com parâmetros
 */
export function createRedirectUrl(pathname: string, baseUrl: string, params?: Record<string, string>) {
  const url = new URL(pathname, baseUrl);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  return url;
}

/**
 * Headers de segurança padrão
 */
export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.supabase.io https://*.supabase.co;",
} as const;

/**
 * Aplica headers de segurança à resposta
 */
export function applySecurityHeaders(response: Response) {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}