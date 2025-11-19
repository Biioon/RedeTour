// Configurações base do RedeTour
export const APP_CONFIG = {
  // Informações da aplicação
  name: 'RedeTour',
  description: 'Plataforma de turismo com sistema de afiliados',
  version: '0.1.0',
  
  // URLs
  url: process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000',
  apiUrl: '/api',
  
  // Configurações de autenticação
  auth: {
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
    cookieName: 'redetour-auth-token',
  },
  
  // Configurações de upload
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedDocumentTypes: ['application/pdf'],
  },
  
  // Configurações de paginação
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },
  
  // Configurações de cache
  cache: {
    static: 60 * 60 * 24, // 24 horas
    api: 60 * 5, // 5 minutos
  },
  
  // Configurações de validação
  validation: {
    minPasswordLength: 8,
    maxPasswordLength: 128,
    minUsernameLength: 3,
    maxUsernameLength: 30,
  },
  
  // Configurações de formulário
  form: {
    debounceDelay: 300, // ms
    maxRetries: 3,
  },
  
  // Configurações de UI
  ui: {
    toastDuration: 5000, // ms
    modalAnimationDuration: 300, // ms
    sidebarWidth: 280, // px
  },
} as const

// Cores do tema RedeTour
export const THEME_COLORS = {
  primary: {
    50: '#f0f9fb',
    100: '#dcf2f7',
    200: '#bce5ed',
    300: '#8dd0de',
    400: '#57b5c8',
    500: '#1BBFD9', // Turquoise
    600: '#006C8A', // Ocean
    700: '#005a72',
    800: '#004859',
    900: '#003245', // Navy
    950: '#002030',
  },
  secondary: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#FFD76B', // Yellow accent
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
  },
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
  },
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
  },
} as const

// Rotas principais da aplicação
export const ROUTES = {
  // Públicas
  home: '/',
  login: '/login',
  register: '/register',
  about: '/about',
  contact: '/contact',
  
  // Dashboard
  dashboard: '/dashboard',
  profile: '/dashboard/profile',
  settings: '/dashboard/settings',
  
  // Admin (para uso futuro)
  admin: '/admin',
  adminUsers: '/admin/users',
  adminReports: '/admin/reports',
  
  // API
  api: {
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      logout: '/api/auth/logout',
      refresh: '/api/auth/refresh',
    },
    upload: '/api/upload',
  },
} as const

// Mensagens de erro padrão
export const ERROR_MESSAGES = {
  network: 'Erro de conexão. Verifique sua internet e tente novamente.',
  server: 'Erro no servidor. Tente novamente mais tarde.',
  unauthorized: 'Você não tem permissão para acessar este recurso.',
  notFound: 'Recurso não encontrado.',
  validation: 'Dados inválidos. Verifique os campos e tente novamente.',
  timeout: 'A requisição demorou muito tempo. Tente novamente.',
  unknown: 'Ocorreu um erro inesperado. Tente novamente.',
} as const

// Mensagens de sucesso padrão
export const SUCCESS_MESSAGES = {
  saved: 'Dados salvos com sucesso!',
  updated: 'Dados atualizados com sucesso!',
  deleted: 'Item excluído com sucesso!',
  uploaded: 'Arquivo enviado com sucesso!',
  sent: 'Mensagem enviada com sucesso!',
  welcome: 'Bem-vindo ao RedeTour!',
} as const