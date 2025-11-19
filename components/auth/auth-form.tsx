'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2 } from 'lucide-react'

interface AuthFormProps {
  type: 'login' | 'register'
  onSubmit: (data: { email: string; password: string; fullName?: string }) => Promise<void>
  loading?: boolean
  error?: string | null
}

export function AuthForm({ type, onSubmit, loading = false, error = null }: AuthFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpar erro do campo ao digitar
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Validação de email
    if (!formData.email) {
      errors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido'
    }

    // Validação de senha
    if (!formData.password) {
      errors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    // Validações específicas do registro
    if (type === 'register') {
      if (!formData.fullName.trim()) {
        errors.fullName = 'Nome é obrigatório'
      } else if (formData.fullName.trim().length < 2) {
        errors.fullName = 'Nome deve ter pelo menos 2 caracteres'
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Confirmação de senha é obrigatória'
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Senhas não coincidem'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await onSubmit({
        email: formData.email,
        password: formData.password,
        fullName: type === 'register' ? formData.fullName : undefined,
      })
    } catch (error) {
      // Erros são tratados pelo componente pai
      console.error('Auth form error:', error)
    }
  }

  const isFieldInvalid = (fieldName: string) => {
    return !!validationErrors[fieldName]
  }

  const getFieldError = (fieldName: string) => {
    return validationErrors[fieldName]
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {type === 'register' && (
        <div className="space-y-2">
          <Label htmlFor="fullName">Nome Completo</Label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Seu nome completo"
            value={formData.fullName}
            onChange={handleInputChange}
            disabled={loading}
            className={isFieldInvalid('fullName') ? 'border-red-500' : ''}
          />
          {isFieldInvalid('fullName') && (
            <p className="text-sm text-red-500">{getFieldError('fullName')}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="seu@email.com"
          value={formData.email}
          onChange={handleInputChange}
          disabled={loading}
          className={isFieldInvalid('email') ? 'border-red-500' : ''}
        />
        {isFieldInvalid('email') && (
          <p className="text-sm text-red-500">{getFieldError('email')}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Sua senha"
          value={formData.password}
          onChange={handleInputChange}
          disabled={loading}
          className={isFieldInvalid('password') ? 'border-red-500' : ''}
        />
        {isFieldInvalid('password') && (
          <p className="text-sm text-red-500">{getFieldError('password')}</p>
        )}
      </div>

      {type === 'register' && (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Senha</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirme sua senha"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            disabled={loading}
            className={isFieldInvalid('confirmPassword') ? 'border-red-500' : ''}
          />
          {isFieldInvalid('confirmPassword') && (
            <p className="text-sm text-red-500">{getFieldError('confirmPassword')}</p>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {type === 'login' ? 'Entrar' : 'Criar Conta'}
      </Button>
    </form>
  )
}