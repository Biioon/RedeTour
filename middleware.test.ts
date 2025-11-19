/**
 * Testes para o middleware de autenticação
 * Execute com: npm test middleware.test.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { middleware } from './middleware';

// Mock do NextRequest
function createMockRequest(url: string, cookies: Record<string, string> = {}): NextRequest {
  const request = new NextRequest(new Request(url));
  
  // Adicionar cookies mock
  Object.entries(cookies).forEach(([name, value]) => {
    request.cookies.set(name, value);
  });
  
  return request;
}

// Mock do Supabase (precisa ser configurado baseado em sua implementação)
jest.mock('@/lib/middleware/auth-helpers', () => ({
  createMiddlewareSupabaseClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(() => ({
        data: { session: null },
        error: null
      })),
      getUser: jest.fn(() => ({
        data: { user: null },
        error: null
      }))
    }
  })),
  getCurrentUserWithProfile: jest.fn(() => null),
  hasRole: jest.fn(() => false),
  isPublicRoute: jest.fn((pathname) => 
    ['/', '/login', '/register', '/auth/callback'].includes(pathname)
  ),
  isAuthRoute: jest.fn((pathname) => 
    ['/login', '/register', '/forgot-password'].includes(pathname)
  ),
  isProtectedRoute: jest.fn((pathname) => 
    ['/dashboard', '/profile', '/bookings'].includes(pathname)
  ),
  isAdminRoute: jest.fn((pathname) => 
    pathname.startsWith('/admin')
  ),
  isPartnerRoute: jest.fn((pathname) => 
    pathname.startsWith('/partner')
  ),
  isAffiliateRoute: jest.fn((pathname) => 
    pathname.startsWith('/affiliate')
  ),
  createRedirectUrl: jest.fn((pathname, baseUrl, params) => {
    const url = new URL(pathname, baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
    return url;
  }),
  applySecurityHeaders: jest.fn((response) => response)
}));

describe('Middleware de Autenticação', () => {
  beforeEach(() => {
    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
  });

  describe('Rotas Públicas', () => {
    it('deve permitir acesso à página inicial sem autenticação', async () => {
      const request = createMockRequest('http://localhost:3000/');
      const response = await middleware(request);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('location')).toBeNull();
    });

    it('deve permitir acesso à página de login sem autenticação', async () => {
      const request = createMockRequest('http://localhost:3000/login');
      const response = await middleware(request);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('location')).toBeNull();
    });
  });

  describe('Rotas de Autenticação', () => {
    it('deve redirecionar usuário autenticado de /login para /dashboard', async () => {
      // Mock de usuário autenticado
      const { createMiddlewareSupabaseClient } = require('@/lib/middleware/auth-helpers');
      createMiddlewareSupabaseClient.mockReturnValue({
        auth: {
          getSession: jest.fn(() => ({
            data: { 
              session: { 
                user: { id: '123', email: 'test@example.com' } 
              } 
            },
            error: null
          }))
        }
      });

      const request = createMockRequest('http://localhost:3000/login');
      const response = await middleware(request);
      
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://localhost:3000/dashboard');
    });

    it('deve permitir acesso à página de registro sem autenticação', async () => {
      const request = createMockRequest('http://localhost:3000/register');
      const response = await middleware(request);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('location')).toBeNull();
    });
  });

  describe('Rotas Protegidas', () => {
    it('deve redirecionar usuário não autenticado de /dashboard para /login', async () => {
      const request = createMockRequest('http://localhost:3000/dashboard');
      const response = await middleware(request);
      
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
      expect(response.headers.get('location')).toContain('redirectTo=/dashboard');
    });

    it('deve permitir acesso ao dashboard para usuário autenticado', async () => {
      // Mock de usuário autenticado
      const { createMiddlewareSupabaseClient } = require('@/lib/middleware/auth-helpers');
      createMiddlewareSupabaseClient.mockReturnValue({
        auth: {
          getSession: jest.fn(() => ({
            data: { 
              session: { 
                user: { id: '123', email: 'test@example.com' } 
              } 
            },
            error: null
          }))
        }
      });

      const request = createMockRequest('http://localhost:3000/dashboard');
      const response = await middleware(request);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('location')).toBeNull();
    });
  });

  describe('Rotas de Admin', () => {
    it('deve redirecionar usuário não admin de /admin para /dashboard', async () => {
      // Mock de usuário autenticado mas não admin
      const { createMiddlewareSupabaseClient, hasRole } = require('@/lib/middleware/auth-helpers');
      createMiddlewareSupabaseClient.mockReturnValue({
        auth: {
          getSession: jest.fn(() => ({
            data: { 
              session: { 
                user: { id: '123', email: 'test@example.com' } 
              } 
            },
            error: null
          }))
        }
      });
      hasRole.mockReturnValue(false);

      const request = createMockRequest('http://localhost:3000/admin');
      const response = await middleware(request);
      
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://localhost:3000/dashboard');
    });

    it('deve permitir acesso ao admin para usuário admin', async () => {
      // Mock de usuário admin
      const { createMiddlewareSupabaseClient, hasRole } = require('@/lib/middleware/auth-helpers');
      createMiddlewareSupabaseClient.mockReturnValue({
        auth: {
          getSession: jest.fn(() => ({
            data: { 
              session: { 
                user: { id: '123', email: 'admin@example.com' } 
              } 
            },
            error: null
          }))
        }
      });
      hasRole.mockReturnValue(true);

      const request = createMockRequest('http://localhost:3000/admin');
      const response = await middleware(request);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('location')).toBeNull();
    });
  });

  describe('Headers de Segurança', () => {
    it('deve adicionar headers de segurança à resposta', async () => {
      const request = createMockRequest('http://localhost:3000/');
      const response = await middleware(request);
      
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
      expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(response.headers.get('Content-Security-Policy')).toBeTruthy();
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve redirecionar para login em caso de erro em rota protegida', async () => {
      // Mock que lança erro
      const { createMiddlewareSupabaseClient } = require('@/lib/middleware/auth-helpers');
      createMiddlewareSupabaseClient.mockImplementation(() => {
        throw new Error('Erro de conexão');
      });

      const request = createMockRequest('http://localhost:3000/dashboard');
      const response = await middleware(request);
      
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
    });

    it('deve continuar processamento em caso de erro em rota pública', async () => {
      // Mock que lança erro
      const { createMiddlewareSupabaseClient } = require('@/lib/middleware/auth-helpers');
      createMiddlewareSupabaseClient.mockImplementation(() => {
        throw new Error('Erro de conexão');
      });

      const request = createMockRequest('http://localhost:3000/');
      const response = await middleware(request);
      
      expect(response.status).toBe(200);
    });
  });
});