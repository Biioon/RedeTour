/// <reference types="next" />
/// <reference types="next/image-types/global" />

// Variáveis de ambiente do Next.js
namespace NodeJS {
  interface ProcessEnv {
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    SUPABASE_SERVICE_ROLE_KEY: string
    
    // Next Auth (se for usar depois)
    NEXTAUTH_URL: string
    NEXTAUTH_SECRET: string
    
    // Outras variáveis
    NODE_ENV: 'development' | 'production' | 'test'
    PORT?: string
    HOSTNAME?: string
    
    // Stripe (para uso futuro)
    STRIPE_SECRET_KEY?: string
    STRIPE_PUBLISHABLE_KEY?: string
    STRIPE_WEBHOOK_SECRET?: string
    
    // Email (para uso futuro)
    RESEND_API_KEY?: string
    
    // Analytics (para uso futuro)
    NEXT_PUBLIC_GA_ID?: string
    NEXT_PUBLIC_VERCEL_URL?: string
  }
}