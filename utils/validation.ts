// Validação de email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validação de CPF
export const isValidCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, '')
  
  if (cleaned.length !== 11) {
    return false
  }
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleaned)) {
    return false
  }
  
  // Validação do primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i)
  }
  let remainder = sum % 11
  let digit1 = remainder < 2 ? 0 : 11 - remainder
  
  if (parseInt(cleaned.charAt(9)) !== digit1) {
    return false
  }
  
  // Validação do segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i)
  }
  remainder = sum % 11
  let digit2 = remainder < 2 ? 0 : 11 - remainder
  
  return parseInt(cleaned.charAt(10)) === digit2
}

// Validação de CNPJ
export const isValidCNPJ = (cnpj: string): boolean => {
  const cleaned = cnpj.replace(/\D/g, '')
  
  if (cleaned.length !== 14) {
    return false
  }
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleaned)) {
    return false
  }
  
  // Validação do primeiro dígito verificador
  let sum = 0
  let multiplier = 5
  
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned.charAt(i)) * multiplier
    multiplier = multiplier === 2 ? 9 : multiplier - 1
  }
  
  let remainder = sum % 11
  let digit1 = remainder < 2 ? 0 : 11 - remainder
  
  if (parseInt(cleaned.charAt(12)) !== digit1) {
    return false
  }
  
  // Validação do segundo dígito verificador
  sum = 0
  multiplier = 6
  
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned.charAt(i)) * multiplier
    multiplier = multiplier === 2 ? 9 : multiplier - 1
  }
  
  remainder = sum % 11
  let digit2 = remainder < 2 ? 0 : 11 - remainder
  
  return parseInt(cleaned.charAt(13)) === digit2
}

// Validação de telefone brasileiro
export const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '')
  
  // Verifica se tem 10 ou 11 dígitos (com ou sem DDD)
  return cleaned.length === 10 || cleaned.length === 11
}

// Validação de CEP
export const isValidCEP = (cep: string): boolean => {
  const cleaned = cep.replace(/\D/g, '')
  
  return cleaned.length === 8
}

// Validação de senha forte
export const isStrongPassword = (password: string): boolean => {
  // Pelo menos 8 caracteres
  if (password.length < 8) {
    return false
  }
  
  // Pelo menos uma letra maiúscula
  if (!/[A-Z]/.test(password)) {
    return false
  }
  
  // Pelo menos uma letra minúscula
  if (!/[a-z]/.test(password)) {
    return false
  }
  
  // Pelo menos um número
  if (!/\d/.test(password)) {
    return false
  }
  
  // Pelo menos um caractere especial
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return false
  }
  
  return true
}

// Validação de URL
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Validação de número de cartão de crédito usando algoritmo de Luhn
export const isValidCreditCard = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\s/g, '')
  
  if (!/^\d+$/.test(cleaned)) {
    return false
  }
  
  let sum = 0
  let isEven = false
  
  // Processa da direita para a esquerda
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i))
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  return sum % 10 === 0
}

// Validação de data (não permite datas futuras ou muito antigas)
export const isValidDate = (date: string, minAge = 0, maxAge = 120): boolean => {
  const dateObj = new Date(date)
  const now = new Date()
  
  // Verifica se a data é válida
  if (isNaN(dateObj.getTime())) {
    return false
  }
  
  // Não permite datas futuras
  if (dateObj > now) {
    return false
  }
  
  // Calcula idade
  const age = now.getFullYear() - dateObj.getFullYear()
  const monthDiff = now.getMonth() - dateObj.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dateObj.getDate())) {
    age--
  }
  
  // Verifica limites de idade
  return age >= minAge && age <= maxAge
}

// Validação de horário (formato HH:MM)
export const isValidTime = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(time)
}

// Validação de nome (apenas letras e espaços)
export const isValidName = (name: string): boolean => {
  const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/
  return nameRegex.test(name) && name.trim().length > 0
}

// Validação de username (letras, números e underscores)
export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]+$/
  return usernameRegex.test(username) && username.length >= 3 && username.length <= 20
}

// Validação de slug
export const isValidSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 50
}

// Validação de hex color
export const isValidHexColor = (color: string): boolean => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  return hexRegex.test(color)
}

// Validação de MIME type de imagem
export const isValidImageType = (mimeType: string): boolean => {
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
  ]
  
  return validTypes.includes(mimeType)
}

// Validação de tamanho de arquivo
export const isValidFileSize = (size: number, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return size <= maxSizeBytes
}

// Validação de CPF ou CNPJ
export const isValidDocument = (document: string): boolean => {
  const cleaned = document.replace(/\D/g, '')
  
  if (cleaned.length === 11) {
    return isValidCPF(document)
  } else if (cleaned.length === 14) {
    return isValidCNPJ(document)
  }
  
  return false
}