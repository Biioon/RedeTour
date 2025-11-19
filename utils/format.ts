// Formatação de moeda
export const formatCurrency = (value: number, currency = 'BRL'): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value)
}

// Formatação de data
export const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }
  
  return new Intl.DateTimeFormat('pt-BR', { ...defaultOptions, ...options }).format(dateObj)
}

// Formatação de data e hora
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

// Formatação de número
export const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string => {
  return new Intl.NumberFormat('pt-BR', options).format(value)
}

// Formatação de porcentagem
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100)
}

// Formatação de CPF
export const formatCPF = (cpf: string): string => {
  const cleaned = cpf.replace(/\D/g, '')
  
  if (cleaned.length !== 11) {
    return cpf
  }
  
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

// Formatação de CNPJ
export const formatCNPJ = (cnpj: string): string => {
  const cleaned = cnpj.replace(/\D/g, '')
  
  if (cleaned.length !== 14) {
    return cnpj
  }
  
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

// Formatação de telefone
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  
  return phone
}

// Formatação de CEP
export const formatCEP = (cep: string): string => {
  const cleaned = cep.replace(/\D/g, '')
  
  if (cleaned.length !== 8) {
    return cep
  }
  
  return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2')
}

// Primeira letra maiúscula
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Primeira letra de cada palavra maiúscula
export const capitalizeWords = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

// Abreviar nome
export const abbreviateName = (fullName: string): string => {
  const names = fullName.trim().split(' ')
  
  if (names.length === 1) {
    return names[0]
  }
  
  const firstName = names[0]
  const lastName = names[names.length - 1]
  
  if (names.length === 2) {
    return `${firstName} ${lastName}`
  }
  
  return `${firstName} ${names.slice(1, -1).map(n => n.charAt(0) + '.').join(' ')} ${lastName}`
}

// Formatar tamanho de arquivo
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Formatar duração
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  } else {
    return `${remainingSeconds}s`
  }
}