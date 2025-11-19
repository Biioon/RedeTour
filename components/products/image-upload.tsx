'use client'

import { useState, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string | File
  onChange: (file: File | null) => void
  onUploadComplete?: (url: string) => void
  accept?: string
  maxSize?: number // in MB
  className?: string
  preview?: boolean
  disabled?: boolean
}

export function ImageUpload({
  value,
  onChange,
  onUploadComplete,
  accept = 'image/*',
  maxSize = 5,
  className,
  preview = true,
  disabled = false,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = useCallback((file: File) => {
    setError(null)

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida')
      return
    }

    // Validar tamanho
    const fileSizeInMB = file.size / (1024 * 1024)
    if (fileSizeInMB > maxSize) {
      setError(`A imagem deve ter no máximo ${maxSize}MB`)
      return
    }

    onChange(file)
    if (onUploadComplete) {
      // Simular upload (em produção, usar Supabase Storage)
      setIsUploading(true)
      setTimeout(() => {
        const fakeUrl = URL.createObjectURL(file)
        onUploadComplete(fakeUrl)
        setIsUploading(false)
      }, 1500)
    }
  }, [maxSize, onChange, onUploadComplete])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleRemove = useCallback(() => {
    onChange(null)
    setError(null)
  }, [onChange])

  const getPreviewUrl = () => {
    if (typeof value === 'string') return value
    if (value instanceof File) return URL.createObjectURL(value)
    return null
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors',
          isDragging && 'border-primary bg-primary/5',
          error && 'border-red-500',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {preview && getPreviewUrl() ? (
          <div className="relative">
            <img
              src={getPreviewUrl()!}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center">
            {isUploading ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Fazendo upload...</p>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Arraste uma imagem aqui ou{' '}
                    <label className="text-primary hover:underline cursor-pointer">
                      clique para selecionar
                      <input
                        type="file"
                        accept={accept}
                        onChange={handleFileInput}
                        className="sr-only"
                        disabled={disabled}
                      />
                    </label>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Máximo {maxSize}MB • Formatos aceitos: JPG, PNG, GIF
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}