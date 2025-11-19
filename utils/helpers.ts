// Delay/timeout helper
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle function
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Gerar ID único
export const generateId = (prefix = 'id'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}-${Date.now().toString(36)}`
}

// Gerar slug a partir de texto
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50)
}

// Copiar para área de transferência
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback para navegadores antigos
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        document.execCommand('copy')
        return true
      } catch (error) {
        return false
      } finally {
        textArea.remove()
      }
    }
  } catch (error) {
    console.error('Erro ao copiar texto:', error)
    return false
  }
}

// Obter parâmetros da URL
export const getQueryParams = (url: string): Record<string, string> => {
  const params: Record<string, string> = {}
  const urlObj = new URL(url)
  
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value
  })
  
  return params
}

// Construir URL com parâmetros
export const buildUrl = (baseUrl: string, params: Record<string, string | number | boolean>): string => {
  const url = new URL(baseUrl)
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })
  
  return url.toString()
}

// Agrupar array por chave
export const groupBy = <T, K extends keyof any>(
  array: T[],
  key: (item: T) => K
): Record<K, T[]> => {
  return array.reduce((result, item) => {
    const group = key(item)
    if (!result[group]) {
      result[group] = []
    }
    result[group].push(item)
    return result
  }, {} as Record<K, T[]>)
}

// Embaralhar array
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled
}

// Remover duplicatas de array
export const removeDuplicates = <T>(array: T[], key?: keyof T): T[] => {
  if (!key) {
    return [...new Set(array)]
  }
  
  const seen = new Set()
  return array.filter(item => {
    const value = item[key]
    if (seen.has(value)) {
      return false
    }
    seen.add(value)
    return true
  })
}

// Dividir array em chunks
export const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = []
  
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  
  return chunks
}

// Verificar se é objeto vazio
export const isEmptyObject = (obj: Record<string, any>): boolean => {
  return Object.keys(obj).length === 0
}

// Verificar se é array vazio
export const isEmptyArray = (arr: any[]): boolean => {
  return Array.isArray(arr) && arr.length === 0
}

// Deep clone de objeto
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }
  
  return obj
}

// Comparar objetos profundamente
export const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) {
    return true
  }
  
  if (obj1 == null || obj2 == null) {
    return false
  }
  
  if (typeof obj1 !== typeof obj2) {
    return false
  }
  
  if (typeof obj1 !== 'object') {
    return false
  }
  
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)
  
  if (keys1.length !== keys2.length) {
    return false
  }
  
  for (const key of keys1) {
    if (!keys2.includes(key)) {
      return false
    }
    
    if (!deepEqual(obj1[key], obj2[key])) {
      return false
    }
  }
  
  return true
}

// Converter bytes para base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

// Converter base64 para blob
export const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const byteCharacters = atob(base64.split(',')[1])
  const byteArrays = []
  
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512)
    const byteNumbers = new Array(slice.length)
    
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }
    
    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }
  
  return new Blob(byteArrays, { type: mimeType })
}

// Verificar se é dispositivo móvel
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') {
    return false
  }
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

// Verificar se é navegador
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined'
}

// Scroll suave para elemento
export const scrollToElement = (elementId: string, offset = 0): void => {
  if (typeof window === 'undefined') {
    return
  }
  
  const element = document.getElementById(elementId)
  
  if (element) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
    const offsetPosition = elementPosition - offset
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}

// Scroll para o topo
export const scrollToTop = (): void => {
  if (typeof window === 'undefined') {
    return
  }
  
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}