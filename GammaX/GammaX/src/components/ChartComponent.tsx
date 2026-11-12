import React from 'react'
import { DiagramData } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ChartComponentProps {
  data: DiagramData
  className?: string
}

export function ChartComponent({ data, className }: ChartComponentProps) {
  const renderPieChart = () => {
    const total = data.nodes.reduce((sum, node) => sum + (parseFloat(node.label.match(/\d+/)?.[0] || '1')), 0)
    let currentAngle = -90
    
    return (
      <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
        {data.nodes.map((node, index) => {
          const value = parseFloat(node.label.match(/\d+/)?.[0] || '1')
          const percentage = (value / total) * 100
          const angle = (percentage / 100) * 360
          
          const startAngle = currentAngle
          const endAngle = currentAngle + angle
          currentAngle = endAngle
          
          const startX = 200 + 120 * Math.cos((startAngle * Math.PI) / 180)
          const startY = 200 + 120 * Math.sin((startAngle * Math.PI) / 180)
          const endX = 200 + 120 * Math.cos((endAngle * Math.PI) / 180)
          const endY = 200 + 120 * Math.sin((endAngle * Math.PI) / 180)
          
          const largeArcFlag = angle > 180 ? 1 : 0
          
          const midAngle = startAngle + angle / 2
          const labelX = 200 + 80 * Math.cos((midAngle * Math.PI) / 180)
          const labelY = 200 + 80 * Math.sin((midAngle * Math.PI) / 180)
          
          const colors = [
            'oklch(0.60 0.25 30)',
            'oklch(0.55 0.22 280)',
            'oklch(0.62 0.24 150)',
            'oklch(0.58 0.26 340)',
            'oklch(0.65 0.23 200)',
            'oklch(0.57 0.28 60)'
          ]
          
          return (
            <g key={node.id}>
              <path
                d={`M 200,200 L ${startX},${startY} A 120,120 0 ${largeArcFlag},1 ${endX},${endY} Z`}
                fill={node.color || colors[index % colors.length]}
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-semibold fill-white"
              >
                {percentage.toFixed(0)}%
              </text>
            </g>
          )
        })}
        
        <g transform="translate(320, 50)">
          {data.nodes.map((node, index) => {
            const colors = [
              'oklch(0.60 0.25 30)',
              'oklch(0.55 0.22 280)',
              'oklch(0.62 0.24 150)',
              'oklch(0.58 0.26 340)',
              'oklch(0.65 0.23 200)',
              'oklch(0.57 0.28 60)'
            ]
            
            return (
              <g key={node.id} transform={`translate(0, ${index * 30})`}>
                <rect
                  width="15"
                  height="15"
                  fill={node.color || colors[index % colors.length]}
                />
                <text x="20" y="12" className="text-xs fill-current">
                  {node.label.replace(/\d+/, '').trim()}
                </text>
              </g>
            )
          })}
        </g>
      </svg>
    )
  }

  const renderBarChart = () => {
    const values = data.nodes.map(n => parseFloat(n.label.match(/\d+/)?.[0] || '0'))
    const maxValue = Math.max(...values, 1)
    const barWidth = 600 / data.nodes.length - 20
    
    return (
      <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
        <line x1="50" y1="350" x2="750" y2="350" stroke="currentColor" strokeWidth="2" />
        <line x1="50" y1="50" x2="50" y2="350" stroke="currentColor" strokeWidth="2" />
        
        {data.nodes.map((node, index) => {
          const value = parseFloat(node.label.match(/\d+/)?.[0] || '0')
          const height = (value / maxValue) * 280
          const x = 80 + index * (barWidth + 20)
          const y = 350 - height
          
          const colors = [
            'oklch(0.55 0.22 280)',
            'oklch(0.60 0.25 30)',
            'oklch(0.62 0.24 150)',
            'oklch(0.58 0.26 340)',
            'oklch(0.65 0.23 200)'
          ]
          
          return (
            <g key={node.id}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={height}
                fill={node.color || colors[index % colors.length]}
                rx="4"
              />
              <text
                x={x + barWidth / 2}
                y={y - 10}
                textAnchor="middle"
                className="text-sm font-semibold fill-current"
              >
                {value}
              </text>
              <text
                x={x + barWidth / 2}
                y="370"
                textAnchor="middle"
                className="text-xs fill-current"
              >
                {node.label.replace(/\d+/, '').trim()}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  const renderLineChart = () => {
    const values = data.nodes.map(n => parseFloat(n.label.match(/\d+/)?.[0] || '0'))
    const maxValue = Math.max(...values, 1)
    const stepX = 700 / (data.nodes.length - 1)
    
    const points = data.nodes.map((node, index) => {
      const value = parseFloat(node.label.match(/\d+/)?.[0] || '0')
      const x = 50 + index * stepX
      const y = 350 - (value / maxValue) * 280
      return { x, y, value, label: node.label.replace(/\d+/, '').trim() }
    })
    
    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ')
    
    return (
      <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
        <line x1="50" y1="350" x2="750" y2="350" stroke="currentColor" strokeWidth="2" />
        <line x1="50" y1="50" x2="50" y2="350" stroke="currentColor" strokeWidth="2" />
        
        <path
          d={pathData}
          fill="none"
          stroke="oklch(0.55 0.22 280)"
          strokeWidth="3"
        />
        
        <path
          d={`${pathData} L 750,350 L 50,350 Z`}
          fill="oklch(0.55 0.22 280 / 0.2)"
        />
        
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="6"
              fill="oklch(0.55 0.22 280)"
              stroke="white"
              strokeWidth="2"
            />
            <text
              x={point.x}
              y={point.y - 15}
              textAnchor="middle"
              className="text-sm font-semibold fill-current"
            >
              {point.value}
            </text>
            <text
              x={point.x}
              y="370"
              textAnchor="middle"
              className="text-xs fill-current"
            >
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    )
  }

  return (
    <div className={cn("w-full h-full min-h-[14rem] md:min-h-[20rem] lg:min-h-[400px] flex items-center justify-center", className)}>
      {data.type === 'pie' && renderPieChart()}
      {data.type === 'bar' && renderBarChart()}
      {data.type === 'line' && renderLineChart()}
      {!['pie', 'bar', 'line'].includes(data.type) && (
        <div className="text-muted-foreground">Chart type not supported</div>
      )}
    </div>
  )
}
