'use client'

import { useEffect, useRef } from 'react'

interface VendasChartProps {
  data: Array<{
    mes: string
    vendas: number
    receita: number
  }>
}

export function VendasChart({ data }: VendasChartProps) {
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

    // Encontrar valores máximos
    const maxVendas = Math.max(...data.map(d => d.vendas))
    const maxReceita = Math.max(...data.map(d => d.receita))

    // Cores
    const colors = {
      vendas: '#3B82F6', // blue-500
      receita: '#10B981', // emerald-500
      grid: '#E5E7EB', // gray-200
      text: '#6B7280', // gray-500
    }

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

    // Desenhar barras
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
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(
        item.mes.split('/')[0], // Mês apenas
        x + barWidth + barSpacing / 2,
        padding + chartHeight + 20
      )
    })

    // Legenda
    ctx.font = '12px sans-serif'
    
    // Legenda Vendas
    ctx.fillStyle = colors.vendas
    ctx.fillRect(padding, 10, 15, 15)
    ctx.fillStyle = colors.text
    ctx.textAlign = 'left'
    ctx.fillText('Vendas', padding + 20, 22)

    // Legenda Receita
    ctx.fillStyle = colors.receita
    ctx.fillRect(padding + 100, 10, 15, 15)
    ctx.fillStyle = colors.text
    ctx.fillText('Receita', padding + 120, 22)

  }, [data])

  return (
    <div className="w-full h-64">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '256px' }}
      />
    </div>
  )
}