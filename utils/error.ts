// Tipos de erro personalizados
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
    
    // Mantém o stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }
}

// Erros de validação
export class ValidationError extends AppError {
  constructor(message: string, public field?: string, public details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
  }
}

// Erros de autenticação
export class AuthenticationError extends AppError {
  constructor(message = 'Não autorizado') {
    super(message, 'AUTHENTICATION_ERROR', 401)
    this.name = 'AuthenticationError'
  }
}

// Erros de autorização
export class AuthorizationError extends AppError {
  constructor(message = 'Acesso negado') {
    super(message, 'AUTHORIZATION_ERROR', 403)
    this.name = 'AuthorizationError'
  }
}

// Erros de não encontrado
export class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(`${resource} não encontrado`, 'NOT_FOUND_ERROR', 404)
    this.name = 'NotFoundError'
  }
}

// Erros de conflito
export class ConflictError extends AppError {
  constructor(message = 'Conflito de dados') {
    super(message, 'CONFLICT_ERROR', 409)
    this.name = 'ConflictError'
  }
}

// Erros de servidor
export class ServerError extends AppError {
  constructor(message = 'Erro interno do servidor') {
    super(message, 'SERVER_ERROR', 500)
    this.name = 'ServerError'
  }
}

// Erros de rede
export class NetworkError extends AppError {
  constructor(message = 'Erro de conexão') {
    super(message, 'NETWORK_ERROR', 0)
    this.name = 'NetworkError'
  }
}

// Erros de timeout
export class TimeoutError extends AppError {
  constructor(message = 'Tempo limite excedido') {
    super(message, 'TIMEOUT_ERROR', 408)
    this.name = 'TimeoutError'
  }
}

// Mapeamento de códigos de erro HTTP
export const HTTP_ERROR_CODES = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  408: 'Request Timeout',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
} as const

// Mensagens de erro amigáveis para o usuário
export const USER_FRIENDLY_MESSAGES = {
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet e tente novamente.',
  SERVER_ERROR: 'Erro no servidor. Tente novamente mais tarde.',
  TIMEOUT_ERROR: 'A requisição demorou muito tempo. Tente novamente.',
  VALIDATION_ERROR: 'Dados inválidos. Verifique os campos e tente novamente.',
  AUTHENTICATION_ERROR: 'Você precisa estar logado para acessar este recurso.',
  AUTHORIZATION_ERROR: 'Você não tem permissão para acessar este recurso.',
  NOT_FOUND_ERROR: 'Recurso não encontrado.',
  CONFLICT_ERROR: 'Conflito de dados. Este recurso já existe.',
  UNKNOWN_ERROR: 'Ocorreu um erro inesperado. Tente novamente.',
} as const

// Função para obter mensagem amigável
export const getUserFriendlyMessage = (error: AppError | Error | string): string => {
  const errorMessage = typeof error === 'string' ? error : error.message
  const errorCode = error instanceof AppError ? error.code : undefined
  
  if (errorCode && USER_FRIENDLY_MESSAGES[errorCode as keyof typeof USER_FRIENDLY_MESSAGES]) {
    return USER_FRIENDLY_MESSAGES[errorCode as keyof typeof USER_FRIENDLY_MESSAGES]
  }
  
  // Mapeia mensagens comuns
  if (errorMessage.toLowerCase().includes('network')) {
    return USER_FRIENDLY_MESSAGES.NETWORK_ERROR
  }
  
  if (errorMessage.toLowerCase().includes('timeout')) {
    return USER_FRIENDLY_MESSAGES.TIMEOUT_ERROR
  }
  
  if (errorMessage.toLowerCase().includes('validation')) {
    return USER_FRIENDLY_MESSAGES.VALIDATION_ERROR
  }
  
  if (errorMessage.toLowerCase().includes('unauthorized')) {
    return USER_FRIENDLY_MESSAGES.AUTHENTICATION_ERROR
  }
  
  if (errorMessage.toLowerCase().includes('forbidden')) {
    return USER_FRIENDLY_MESSAGES.AUTHORIZATION_ERROR
  }
  
  if (errorMessage.toLowerCase().includes('not found')) {
    return USER_FRIENDLY_MESSAGES.NOT_FOUND_ERROR
  }
  
  if (errorMessage.toLowerCase().includes('conflict')) {
    return USER_FRIENDLY_MESSAGES.CONFLICT_ERROR
  }
  
  return USER_FRIENDLY_MESSAGES.UNKNOWN_ERROR
}

// Função para tratar erros do Supabase
export const handleSupabaseError = (error: any): AppError => {
  if (!error) {
    return new ServerError()
  }
  
  // Erros de autenticação
  if (error.code === 'PGRST116' || error.message?.includes('JWT')) {
    return new AuthenticationError('Sessão expirada')
  }
  
  // Erros de violação de chave única
  if (error.code === '23505') {
    const field = error.details?.match(/Key \(([^)]+)\)/)?.[1]
    return new ConflictError(`${field ? `O campo ${field}` : 'Este dado'} já está em uso`)
  }
  
  // Erros de chave estrangeira
  if (error.code === '23503') {
    return new NotFoundError('Registro relacionado não encontrado')
  }
  
  // Erros de validação
  if (error.code === '23514') {
    return new ValidationError('Dados inválidos')
  }
  
  // Timeout
  if (error.code === '57014') {
    return new TimeoutError()
  }
  
  // Erro genérico
  return new ServerError(error.message || 'Erro no banco de dados')
}

// Função para tratar erros de API
export const handleApiError = async (response: Response): Promise<AppError> => {
  const status = response.status
  
  try {
    const data = await response.json()
    const message = data.message || data.error || HTTP_ERROR_CODES[status as keyof typeof HTTP_ERROR_CODES]
    
    switch (status) {
      case 400:
        return new ValidationError(message)
      case 401:
        return new AuthenticationError(message)
      case 403:
        return new AuthorizationError(message)
      case 404:
        return new NotFoundError(message)
      case 408:
        return new TimeoutError(message)
      case 409:
        return new ConflictError(message)
      case 422:
        return new ValidationError(message)
      case 429:
        return new AppError(message, 'RATE_LIMIT_ERROR', 429)
      default:
        if (status >= 500) {
          return new ServerError(message)
        }
        return new AppError(message, `HTTP_ERROR_${status}`, status)
    }
  } catch {
    return new AppError(
      HTTP_ERROR_CODES[status as keyof typeof HTTP_ERROR_CODES] || 'Erro desconhecido',
      `HTTP_ERROR_${status}`,
      status
    )
  }
}

// Função para logar erros
export const logError = (error: Error | AppError, context?: string): void => {
  const errorInfo = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    ...(error instanceof AppError && {
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    }),
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.error('Erro capturado:', errorInfo)
  }
  
  // Aqui você pode enviar para um serviço de logging (ex: Sentry, LogRocket)
  // if (typeof window !== 'undefined' && window.Sentry) {
  //   window.Sentry.captureException(error, { extra: context })
  // }
}

// Função para criar mensagem de erro de formulário
export const createFormError = (field: string, message: string): ValidationError => {
  return new ValidationError(message, field, { field })
}

// Função para validar e lançar erro
export const validateOrThrow = <T>(
  value: T,
  validator: (value: T) => boolean,
  errorMessage: string,
  field?: string
): void => {
  if (!validator(value)) {
    throw new ValidationError(errorMessage, field)
  }
}

// Wrapper para try-catch com tratamento de erro
export const safeExecute = async <T>(
  fn: () => Promise<T>,
  errorHandler?: (error: Error) => AppError
): Promise<{ data?: T; error?: AppError }> => {
  try {
    const data = await fn()
    return { data }
  } catch (error) {
    const appError = error instanceof AppError 
      ? error 
      : errorHandler 
        ? errorHandler(error as Error)
        : new AppError((error as Error).message)
    
    return { error: appError }
  }
}