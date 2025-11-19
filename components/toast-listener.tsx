'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

interface ToastEvent {
  detail: {
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
  }
}

export function ToastListener() {
  useEffect(() => {
    const handleToastEvent = (event: CustomEvent<ToastEvent['detail']>) => {
      const { message, type } = event.detail
      
      switch (type) {
        case 'success':
          toast.success(message)
          break
        case 'error':
          toast.error(message)
          break
        case 'info':
          toast.info(message)
          break
        case 'warning':
          toast.warning(message)
          break
        default:
          toast(message)
      }
    }

    // Adicionar listener para eventos customizados
    window.addEventListener('show-toast', handleToastEvent as EventListener)

    return () => {
      window.removeEventListener('show-toast', handleToastEvent as EventListener)
    }
  }, [])

  return null
}