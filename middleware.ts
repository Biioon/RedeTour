import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { 
  createMiddlewareSupabaseClient,
  getCurrentUserWithProfile,
  hasRole,
  isPublicRoute,
  isAuthRoute,
  isProtectedRoute,
  isAdminRoute,
  isPartnerRoute,
  isAffiliateRoute,
  createRedirectUrl,
  applySecurityHeaders,
  type UserWithProfile
} from "@/lib/middleware/auth-helpers";

/**
 * Função auxiliar para logging estruturado
 */
function logMiddleware(level: 'info' | 'warn' | 'error', message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level,
    message,
    ...data
  };
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] ${level.toUpperCase()}: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  logMiddleware('info', 'Processando rota', { pathname });

  try {
    // Ignorar rotas de sistema e arquivos estáticos
    if (pathname.startsWith("/_next") || 
        pathname.startsWith("/static") ||
        pathname.includes(".") && !pathname.includes("/api/")) {
      return NextResponse.next();
    }

    // Criar cliente Supabase
    const supabase = createMiddlewareSupabaseClient(request);
    
    // Verificar sessão atual
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      logMiddleware('error', 'Erro ao verificar sessão', { error: error.message });
    }

    const isAuthenticated = !!session;
    const user = session?.user;

    logMiddleware('info', 'Estado de autenticação', { 
      isAuthenticated, 
      userId: user?.id,
      userEmail: user?.email 
    });

    // Obter dados completos do usuário se autenticado
    let userWithProfile: UserWithProfile | null = null;
    if (isAuthenticated && user) {
      userWithProfile = await getCurrentUserWithProfile(request);
      logMiddleware('info', 'Perfil do usuário obtido', { 
        role: userWithProfile?.role,
        isActive: userWithProfile?.is_active 
      });
    }

    // Redirecionamento para usuários autenticados em rotas de auth
    if (isAuthenticated && isAuthRoute(pathname)) {
      logMiddleware('info', 'Usuário autenticado acessando rota de auth, redirecionando para dashboard');
      return NextResponse.redirect(createRedirectUrl('/dashboard', request.url));
    }

    // Verificar rotas protegidas
    if (isProtectedRoute(pathname)) {
      if (!isAuthenticated) {
        logMiddleware('warn', 'Usuário não autenticado tentando acessar rota protegida', { pathname });
        
        // Redirecionar para login com redirect URL
        return NextResponse.redirect(
          createRedirectUrl('/login', request.url, { redirectTo: pathname })
        );
      }

      // Verificar se o usuário está ativo
      if (userWithProfile && !userWithProfile.is_active) {
        logMiddleware('warn', 'Usuário inativo tentando acessar rota protegida', { 
          userId: userWithProfile.id 
        });
        
        // Redirecionar para página de conta suspensa
        return NextResponse.redirect(
          createRedirectUrl('/account-suspended', request.url)
        );
      }
    }

    // Verificar rotas de admin
    if (isAdminRoute(pathname)) {
      const isUserAdmin = await hasRole(request, 'admin');
      
      if (!isUserAdmin) {
        logMiddleware('warn', 'Usuário não autorizado tentando acessar rota de admin', { 
          pathname,
          userRole: userWithProfile?.role 
        });
        
        return NextResponse.redirect(
          createRedirectUrl('/dashboard', request.url, { 
            error: 'unauthorized',
            message: 'Acesso negado. Requer privilégios de administrador.' 
          })
        );
      }
    }

    // Verificar rotas de parceiro
    if (isPartnerRoute(pathname)) {
      const hasPartnerRole = await hasRole(request, ['partner', 'admin']);
      
      if (!hasPartnerRole) {
        logMiddleware('warn', 'Usuário não autorizado tentando acessar rota de parceiro', { 
          pathname,
          userRole: userWithProfile?.role 
        });
        
        return NextResponse.redirect(
          createRedirectUrl('/dashboard', request.url, { 
            error: 'unauthorized',
            message: 'Acesso negado. Requer privilégios de parceiro.' 
          })
        );
      }
    }

    // Verificar rotas de afiliado
    if (isAffiliateRoute(pathname)) {
      const hasAffiliateRole = await hasRole(request, ['affiliate', 'partner', 'admin']);
      
      if (!hasAffiliateRole) {
        logMiddleware('warn', 'Usuário não autorizado tentando acessar rota de afiliado', { 
          pathname,
          userRole: userWithProfile?.role 
        });
        
        return NextResponse.redirect(
          createRedirectUrl('/dashboard', request.url, { 
            error: 'unauthorized',
            message: 'Acesso negado. Requer privilégios de afiliado.' 
          })
        );
      }
    }

    // Criar resposta com headers de segurança
    const response = NextResponse.next();
    
    // Adicionar headers de segurança
    applySecurityHeaders(response);
    
    // Adicionar headers customizados para debug (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      response.headers.set('X-User-Authenticated', isAuthenticated.toString());
      response.headers.set('X-User-Id', user?.id || 'anonymous');
      response.headers.set('X-User-Role', userWithProfile?.role || 'none');
    }

    logMiddleware('info', 'Requisição processada com sucesso', { pathname });
    return response;

  } catch (error) {
    logMiddleware('error', 'Erro não tratado no middleware', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Em caso de erro, redirecionar para login se for rota protegida
    if (isProtectedRoute(pathname) || isAdminRoute(pathname) || isPartnerRoute(pathname)) {
      return NextResponse.redirect(
        createRedirectUrl('/login', request.url, { 
          error: 'system_error',
          message: 'Erro ao processar autenticação. Por favor, tente novamente.' 
        })
      );
    }
    
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};