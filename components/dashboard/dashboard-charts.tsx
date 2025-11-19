'use client'

import { useEffect, useRef } from 'react'

interface SalesChartProps {
  data: Array<{
    mes: string
    vendas: number
    receita: number
  }>
  title?: string
  height?: number
}

export function SalesChart({ data, title, height = 250 }: SalesChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !data.length) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Configurar canvas com alta resolução
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Configurações do gráfico
    const padding = 40
    const chartWidth = rect.width - padding * 2
    const chartHeight = rect.height - padding * 2

    // Encontrar valores máximos
    const maxVendas = Math.max(...data.map(d => d.vendas))
    const maxReceita = Math.max(...data.map(d => d.receita))

    // Cores modernas
    const colors = {
      vendas: '#3B82F6', // blue-500
      receita: '#10B981', // emerald-500
      grid: '#E5E7EB', // gray-200
      text: '#6B7280', // gray-500
      background: '#F9FAFB' // gray-50
    }

    // Desenhar fundo
    ctx.fillStyle = colors.background
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Desenhar grid
    ctx.strokeStyle = colors.grid
    ctx.lineWidth = 1
    
    // Linhas horizontais
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(padding + chartWidth, y)
      ctx.stroke()
    }

    // Desenhar barras com animação suave
    const barWidth = chartWidth / (data.length * 2 + data.length - 1)
    const barSpacing = barWidth * 0.5

    data.forEach((item, index) => {
      const x = padding + index * (barWidth * 2 + barSpacing)
      
      // Barra de vendas
      const vendasHeight = (item.vendas / maxVendas) * chartHeight
      ctx.fillStyle = colors.vendas
      ctx.fillRect(x, padding + chartHeight - vendasHeight, barWidth, vendasHeight)

      // Barra de receita
      const receitaHeight = (item.receita / maxReceita) * chartHeight
      ctx.fillStyle = colors.receita
      ctx.fillRect(x + barWidth + barSpacing, padding + chartHeight - receitaHeight, barWidth, receitaHeight)

      // Labels dos meses
      ctx.fillStyle = colors.text
      ctx.font = '12px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(
        item.mes.split('/')[0], // Mês apenas
        x + barWidth + barSpacing / 2,
        padding + chartHeight + 20
      )
    })

    // Legenda
    ctx.font = '12px Inter, sans-serif'
    
    // Legenda Vendas
    ctx.fillStyle = colors.vendas
    ctx.fillRect(padding, 15, 15, 15)
    ctx.fillStyle = colors.text
    ctx.textAlign = 'left'
    ctx.fillText('Vendas', padding + 25, 27)

    // Legenda Receita
    ctx.fillStyle = colors.receita
    ctx.fillRect(padding + 100, 15, 15, 15)
    ctx.fillStyle = colors.text
    ctx.fillText('Receita', padding + 125, 27)

  }, [data])

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      )}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full border rounded-lg"
          style={{ width: '100%', height: `${height}px` }}
        />
      </div>
    </div>
  )
}

interface CommissionChartProps {
  data: Array<{
    mes: string
    total_comissoes: number
    comissoes_pagas: number
  }>
  title?: string
  height?: number
}

export function CommissionChart({ data, title, height = 250 }: CommissionChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !data.length) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Configurar canvas
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Configurações do gráfico
    const padding = 40
    const chartWidth = rect.width - padding * 2
    const chartHeight = rect.height - padding * 2

    // Encontrar valor máximo
    const maxValue = Math.max(...data.map(d => d.total_comissoes))

    // Cores modernas
    const colors = {
      total: '#8B5CF6', // purple-500
      paga: '#10B981', // emerald-500
      grid: '#E5E7EB', // gray-200
      text: '#6B7280', // gray-500
      background: '#F9FAFB' // gray-50
    }

    // Desenhar fundo
    ctx.fillStyle = colors.background
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Desenhar grid
    ctx.strokeStyle = colors.grid
    ctx.lineWidth = 1
    
    // Linhas horizontais
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(padding + chartWidth, y)
      ctx.stroke()
    }

    // Desenhar linhas suaves
    const pointSpacing = chartWidth / (data.length - 1)
    const pointRadius = 4

    // Linha de comissões totais
    ctx.strokeStyle = colors.total
    ctx.lineWidth = 3
    ctx.beginPath()
    
    data.forEach((item, index) => {
      const x = padding + index * pointSpacing
      const y = padding + chartHeight - (item.total_comissoes / maxValue) * chartHeight
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Linha de comissões pagas
    ctx.strokeStyle = colors.paga
    ctx.lineWidth = 3
    ctx.beginPath()
    
    data.forEach((item, index) => {
      const x = padding + index * pointSpacing
      const y = padding + chartHeight - (item.comissoes_pagas / maxValue) * chartHeight
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Desenhar pontos
    data.forEach((item, index) => {
      const x = padding + index * pointSpacing
      
      // Ponto de comissões totais
      const yTotal = padding + chartHeight - (item.total_comissoes / maxValue) * chartHeight
      ctx.fillStyle = colors.total
      ctx.beginPath()
      ctx.arc(x, yTotal, pointRadius, 0, 2 * Math.PI)
      ctx.fill()

      // Ponto de comissões pagas
      const yPaga = padding + chartHeight - (item.comissoes_pagas / maxValue) * chartHeight
      ctx.fillStyle = colors.paga
      ctx.beginPath()
      ctx.arc(x, yPaga, pointRadius, 0, 2 * Math.PI)
      ctx.fill()

      // Labels dos meses
      ctx.fillStyle = colors.text
      ctx.font = '12px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(
        item.mes.split('/')[0], // Mês apenas
        x,
        padding + chartHeight + 20
      )
    })

    // Legenda
    ctx.font = '12px Inter, sans-serif'
    
    // Legenda Total
    ctx.fillStyle = colors.total
    ctx.beginPath()
    ctx.arc(padding + 10, 15, 6, 0, 2 * Math.PI)
    ctx.fill()
    ctx.fillStyle = colors.text
    ctx.textAlign = 'left'
    ctx.fillText('Total', padding + 25, 20)

    // Legenda Paga
    ctx.fillStyle = colors.paga
    ctx.beginPath()
    ctx.arc(padding + 100, 15, 6, 0, 2 * Math.PI)
    ctx.fill()
    ctx.fillStyle = colors.text
    ctx.fillText('Paga', padding + 115, 20)

  }, [data])

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      )}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full border rounded-lg"
          style={{ width: '100%', height: `${height}px` }}
        />
      </div>
    </div>
  )
}

interface UserGrowthChartProps {
  data: Array<{
    mes: string
    novos_usuarios: number
    usuarios_totais: number
  }>
  title?: string
  height?: number
}

export function UserGrowthChart({ data, title, height = 250 }: UserGrowthChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !data.length) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Configurar canvas
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Configurações do gráfico
    const padding = 40
    const chartWidth = rect.width - padding * 2
    const chartHeight = rect.height - padding * 2

    // Encontrar valor máximo
    const maxValue = Math.max(...data.map(d => d.usuarios_totais))

    // Cores modernas
    const colors = {
      novos: '#3B82F6', // blue-500
      total: '#10B981', // emerald-500
      grid: '#E5E7EB', // gray-200
      text: '#6B7280', // gray-500
      background: '#F9FAFB' // gray-50
    }

    // Desenhar fundo
    ctx.fillStyle = colors.background
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Desenhar grid
    ctx.strokeStyle = colors.grid
    ctx.lineWidth = 1
    
    // Linhas horizontais
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(padding + chartWidth, y)
      ctx.stroke()
    }

    // Desenhar linhas de área
    const pointSpacing = chartWidth / (data.length - 1)

    // Área de usuários totais
    ctx.fillStyle = `${colors.total}20`
    ctx.beginPath()
    ctx.moveTo(padding, padding + chartHeight)
    
    data.forEach((item, index) => {
      const x = padding + index * pointSpacing
      const y = padding + chartHeight - (item.usuarios_totais / maxValue) * chartHeight
      ctx.lineTo(x, y)
    })
    
    ctx.lineTo(padding + chartWidth, padding + chartHeight)
    ctx.closePath()
    ctx.fill()

    // Linha de usuários totais
    ctx.strokeStyle = colors.total
    ctx.lineWidth = 3
    ctx.beginPath()
    
    data.forEach((item, index) => {
      const x = padding + index * pointSpacing
      const y = padding + chartHeight - (item.usuarios_totais / maxValue) * chartHeight
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Pontos de novos usuários
    ctx.fillStyle = colors.novos
    data.forEach((item, index) => {
      const x = padding + index * pointSpacing
      const y = padding + chartHeight - (item.novos_usuarios / maxValue) * chartHeight
      
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fill()
    })

    // Labels dos meses
    ctx.fillStyle = colors.text
    ctx.font = '12px Inter, sans-serif'
    ctx.textAlign = 'center'
    data.forEach((item, index) => {
      const x = padding + index * pointSpacing
      ctx.fillText(
        item.mes.split('/')[0], // Mês apenas
        x,
        padding + chartHeight + 20
      )
    })

    // Legenda
    ctx.font = '12px Inter, sans-serif'
    
    // Legenda Novos Usuários
    ctx.fillStyle = colors.novos
    ctx.beginPath()
    ctx.arc(padding + 10, 15, 4, 0, 2 * Math.PI)
    ctx.fill()
    ctx.fillStyle = colors.text
    ctx.textAlign = 'left'
    ctx.fillText('Novos Usuários', padding + 25, 20)

    // Legenda Total
    ctx.fillStyle = colors.total
    ctx.fillRect(padding + 140, 10, 15, 10)
    ctx.fillStyle = colors.text
    ctx.fillText('Total de Usuários', padding + 165, 20)

  }, [data])

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      )}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full border rounded-lg"
          style={{ width: '100%', height: `${height}px` }}
        />
      </div>
    </div>
  )
}