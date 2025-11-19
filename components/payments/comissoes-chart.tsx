'use client'

import { useEffect, useRef } from 'react'

interface ComissoesChartProps {
  data: Array<{
    mes: string
    total_comissoes: number
    comissoes_pagas: number
  }>
}

export function ComissoesChart({ data }: ComissoesChartProps) {
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

    // Cores
    const colors = {
      total: '#8B5CF6', // purple-500
      paga: '#10B981', // emerald-500
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

    // Desenhar linhas
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
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(
        item.mes.split('/')[0], // Mês apenas
        x,
        padding + chartHeight + 20
      )
    })

    // Legenda
    ctx.font = '12px sans-serif'
    
    // Legenda Total
    ctx.fillStyle = colors.total
    ctx.beginPath()
    ctx.arc(padding + 10, 10, 6, 0, 2 * Math.PI)
    ctx.fill()
    ctx.fillStyle = colors.text
    ctx.textAlign = 'left'
    ctx.fillText('Total', padding + 25, 15)

    // Legenda Paga
    ctx.fillStyle = colors.paga
    ctx.beginPath()
    ctx.arc(padding + 100, 10, 6, 0, 2 * Math.PI)
    ctx.fill()
    ctx.fillStyle = colors.text
    ctx.fillText('Paga', padding + 115, 15)

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