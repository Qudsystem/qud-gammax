import React from 'react'
import { DiagramData, DiagramNode, DiagramEdge } from '@/lib/types'
import { cn } from '@/lib/utils'

interface SmartShapeProps {
  data: DiagramData
  className?: string
}

export function SmartShape({ data, className }: SmartShapeProps) {
  const renderFlowchart = () => {
    return (
      <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="currentColor" />
          </marker>
        </defs>
        
        {data.edges?.map((edge) => {
          const fromNode = data.nodes.find(n => n.id === edge.from)
          const toNode = data.nodes.find(n => n.id === edge.to)
          if (!fromNode || !toNode || !fromNode.position || !toNode.position) return null
          
          return (
            <g key={edge.id}>
              <line
                x1={fromNode.position.x}
                y1={fromNode.position.y}
                x2={toNode.position.x}
                y2={toNode.position.y}
                stroke={edge.color || 'currentColor'}
                strokeWidth="2"
                strokeDasharray={edge.type === 'dashed' ? '5,5' : edge.type === 'dotted' ? '2,2' : '0'}
                markerEnd="url(#arrowhead)"
              />
              {edge.label && (
                <text
                  x={(fromNode.position.x + toNode.position.x) / 2}
                  y={(fromNode.position.y + toNode.position.y) / 2 - 10}
                  textAnchor="middle"
                  className="text-xs fill-current"
                >
                  {edge.label}
                </text>
              )}
            </g>
          )
        })}
        
        {data.nodes.map((node) => {
          if (!node.position) return null
          const size = node.size === 'sm' ? 80 : node.size === 'lg' ? 140 : 110
          
          return (
            <g key={node.id}>
              {node.type === 'start' || node.type === 'end' ? (
                <ellipse
                  cx={node.position.x}
                  cy={node.position.y}
                  rx={size / 2}
                  ry={size / 3}
                  fill={node.color || 'oklch(0.95 0.04 280)'}
                  stroke="currentColor"
                  strokeWidth="2"
                />
              ) : node.type === 'decision' ? (
                <polygon
                  points={`${node.position.x},${node.position.y - size/2} ${node.position.x + size/2},${node.position.y} ${node.position.x},${node.position.y + size/2} ${node.position.x - size/2},${node.position.y}`}
                  fill={node.color || 'oklch(0.95 0.04 280)'}
                  stroke="currentColor"
                  strokeWidth="2"
                />
              ) : (
                <rect
                  x={node.position.x - size / 2}
                  y={node.position.y - size / 3}
                  width={size}
                  height={size * 0.66}
                  rx="8"
                  fill={node.color || 'oklch(0.95 0.04 280)'}
                  stroke="currentColor"
                  strokeWidth="2"
                />
              )}
              <text
                x={node.position.x}
                y={node.position.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm font-medium fill-current"
              >
                {node.label}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  const renderMindmap = () => {
    const centerNode = data.nodes[0]
    const childNodes = data.nodes.slice(1)
    
    return (
      <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
        {data.edges?.map((edge) => {
          const fromNode = data.nodes.find(n => n.id === edge.from)
          const toNode = data.nodes.find(n => n.id === edge.to)
          if (!fromNode || !toNode || !fromNode.position || !toNode.position) return null
          
          return (
            <path
              key={edge.id}
              d={`M ${fromNode.position.x},${fromNode.position.y} Q ${(fromNode.position.x + toNode.position.x) / 2},${fromNode.position.y} ${toNode.position.x},${toNode.position.y}`}
              stroke={edge.color || 'currentColor'}
              strokeWidth="2"
              fill="none"
            />
          )
        })}
        
        {centerNode && centerNode.position && (
          <g>
            <circle
              cx={centerNode.position.x}
              cy={centerNode.position.y}
              r="60"
              fill="oklch(0.50 0.22 280)"
              className="fill-primary"
            />
            <text
              x={centerNode.position.x}
              y={centerNode.position.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-base font-bold fill-white"
            >
              {centerNode.label}
            </text>
          </g>
        )}
        
        {childNodes.map((node) => {
          if (!node.position) return null
          return (
            <g key={node.id}>
              <rect
                x={node.position.x - 60}
                y={node.position.y - 25}
                width="120"
                height="50"
                rx="25"
                fill={node.color || 'oklch(0.95 0.04 280)'}
                stroke="currentColor"
                strokeWidth="2"
              />
              <text
                x={node.position.x}
                y={node.position.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm font-medium fill-current"
              >
                {node.label}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  const renderTimeline = () => {
    const lineY = 300
    
    return (
      <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
        <line
          x1="50"
          y1={lineY}
          x2="750"
          y2={lineY}
          stroke="currentColor"
          strokeWidth="3"
        />
        
        {data.nodes.map((node, index) => {
          const x = 100 + (index * (600 / (data.nodes.length - 1)))
          const isEven = index % 2 === 0
          const y = isEven ? lineY - 100 : lineY + 100
          
          return (
            <g key={node.id}>
              <line
                x1={x}
                y1={lineY}
                x2={x}
                y2={y}
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              <circle
                cx={x}
                cy={lineY}
                r="8"
                fill={node.color || 'oklch(0.50 0.22 280)'}
                className="fill-primary"
              />
              <circle
                cx={x}
                cy={y}
                r="45"
                fill={node.color || 'oklch(0.95 0.04 280)'}
                stroke="currentColor"
                strokeWidth="2"
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-medium fill-current"
              >
                {node.label}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  const renderOrgChart = () => {
    return (
      <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
        {data.edges?.map((edge) => {
          const fromNode = data.nodes.find(n => n.id === edge.from)
          const toNode = data.nodes.find(n => n.id === edge.to)
          if (!fromNode || !toNode || !fromNode.position || !toNode.position) return null
          
          return (
            <path
              key={edge.id}
              d={`M ${fromNode.position.x},${fromNode.position.y + 35} L ${fromNode.position.x},${fromNode.position.y + 60} L ${toNode.position.x},${toNode.position.y - 60} L ${toNode.position.x},${toNode.position.y - 35}`}
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          )
        })}
        
        {data.nodes.map((node) => {
          if (!node.position) return null
          return (
            <g key={node.id}>
              <rect
                x={node.position.x - 70}
                y={node.position.y - 35}
                width="140"
                height="70"
                rx="8"
                fill={node.color || 'oklch(0.95 0.04 280)'}
                stroke="currentColor"
                strokeWidth="2"
              />
              <text
                x={node.position.x}
                y={node.position.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm font-medium fill-current"
              >
                {node.label}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  const renderVenn = () => {
    return (
      <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
        <circle cx="300" cy="300" r="120" fill="oklch(0.65 0.20 280 / 0.5)" stroke="currentColor" strokeWidth="2" />
        <circle cx="450" cy="300" r="120" fill="oklch(0.65 0.20 340 / 0.5)" stroke="currentColor" strokeWidth="2" />
        {data.nodes[2] && (
          <circle cx="375" cy="200" r="120" fill="oklch(0.65 0.20 180 / 0.5)" stroke="currentColor" strokeWidth="2" />
        )}
        
        {data.nodes.map((node, index) => {
          const positions = [
            { x: 250, y: 350 },
            { x: 500, y: 350 },
            { x: 375, y: 150 }
          ]
          const pos = positions[index]
          if (!pos) return null
          
          return (
            <text
              key={node.id}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              className="text-sm font-semibold fill-current"
            >
              {node.label}
            </text>
          )
        })}
      </svg>
    )
  }

  const renderPyramid = () => {
    const levels = data.nodes.length
    return (
      <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
        {data.nodes.map((node, index) => {
          const levelHeight = 400 / levels
          const y = 100 + (index * levelHeight)
          const width = 600 - (index * (500 / levels))
          const x = 400 - width / 2
          
          return (
            <g key={node.id}>
              <rect
                x={x}
                y={y}
                width={width}
                height={levelHeight - 10}
                fill={node.color || `oklch(${0.5 + index * 0.1} 0.20 ${280 + index * 30})`}
                stroke="currentColor"
                strokeWidth="2"
              />
              <text
                x={400}
                y={y + levelHeight / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-base font-medium fill-white"
              >
                {node.label}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  const renderCycle = () => {
    const centerX = 400
    const centerY = 300
    const radius = 150
    const nodeCount = data.nodes.length
    
    return (
      <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
        <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
        
        {data.nodes.map((node, index) => {
          const angle = (index / nodeCount) * 2 * Math.PI - Math.PI / 2
          const x = centerX + radius * Math.cos(angle)
          const y = centerY + radius * Math.sin(angle)
          
          const nextAngle = ((index + 1) / nodeCount) * 2 * Math.PI - Math.PI / 2
          const nextX = centerX + radius * Math.cos(nextAngle)
          const nextY = centerY + radius * Math.sin(nextAngle)
          
          return (
            <g key={node.id}>
              <line
                x1={x}
                y1={y}
                x2={nextX}
                y2={nextY}
                stroke="currentColor"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
              <circle
                cx={x}
                cy={y}
                r="50"
                fill={node.color || `oklch(0.${55 + index * 5} 0.22 ${280 + index * 40})`}
                stroke="currentColor"
                strokeWidth="2"
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm font-medium fill-white"
              >
                {node.label}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  const renderNetwork = () => {
    const centerX = 400
    const centerY = 300
    
    return (
      <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
        {data.edges?.map((edge) => {
          const fromNode = data.nodes.find(n => n.id === edge.from)
          const toNode = data.nodes.find(n => n.id === edge.to)
          if (!fromNode || !toNode || !fromNode.position || !toNode.position) return null
          
          return (
            <line
              key={edge.id}
              x1={fromNode.position.x}
              y1={fromNode.position.y}
              x2={toNode.position.x}
              y2={toNode.position.y}
              stroke={edge.color || 'oklch(0.70 0.15 280)'}
              strokeWidth="2"
              opacity="0.6"
            />
          )
        })}
        
        {data.nodes.map((node) => {
          if (!node.position) return null
          const size = node.size === 'sm' ? 30 : node.size === 'lg' ? 60 : 45
          
          return (
            <g key={node.id}>
              <circle
                cx={node.position.x}
                cy={node.position.y}
                r={size}
                fill={node.color || 'oklch(0.50 0.22 280)'}
                stroke="currentColor"
                strokeWidth="2"
              />
              <text
                x={node.position.x}
                y={node.position.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-medium fill-white"
              >
                {node.label}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  const renderMatrix = () => {
    const rows = Math.ceil(Math.sqrt(data.nodes.length))
    const cols = Math.ceil(data.nodes.length / rows)
    const cellWidth = 700 / cols
    const cellHeight = 500 / rows
    const startX = 50
    const startY = 50
    
    return (
      <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
        <line x1={startX + cellWidth} y1={startY} x2={startX + cellWidth} y2={startY + rows * cellHeight} stroke="currentColor" strokeWidth="2" />
        <line x1={startX} y1={startY + cellHeight} x2={startX + cols * cellWidth} y2={startY + cellHeight} stroke="currentColor" strokeWidth="2" />
        
        {data.nodes.map((node, index) => {
          const row = Math.floor(index / cols)
          const col = index % cols
          const x = startX + col * cellWidth + cellWidth / 2
          const y = startY + row * cellHeight + cellHeight / 2
          
          const quadrant = row === 0 ? (col === 0 ? 'High/Low' : 'High/High') : (col === 0 ? 'Low/Low' : 'Low/High')
          const colors = ['oklch(0.85 0.15 120)', 'oklch(0.75 0.22 160)', 'oklch(0.65 0.20 30)', 'oklch(0.55 0.24 340)']
          
          return (
            <g key={node.id}>
              <rect
                x={x - 60}
                y={y - 30}
                width="120"
                height="60"
                rx="8"
                fill={node.color || colors[index % colors.length]}
                stroke="currentColor"
                strokeWidth="2"
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm font-medium fill-white"
              >
                {node.label}
              </text>
            </g>
          )
        })}
        
        <text x={startX + cellWidth / 2} y={startY - 10} textAnchor="middle" className="text-xs font-semibold fill-current">Low Impact</text>
        <text x={startX + cellWidth * 1.5} y={startY - 10} textAnchor="middle" className="text-xs font-semibold fill-current">High Impact</text>
        <text x={startX - 10} y={startY + cellHeight / 2} textAnchor="end" className="text-xs font-semibold fill-current">High Effort</text>
        <text x={startX - 10} y={startY + cellHeight * 1.5} textAnchor="end" className="text-xs font-semibold fill-current">Low Effort</text>
      </svg>
    )
  }

  const renderFunnel = () => {
    const levels = data.nodes.length
    const topWidth = 600
    const bottomWidth = 200
    
    return (
      <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
        {data.nodes.map((node, index) => {
          const levelHeight = 450 / levels
          const y = 75 + index * levelHeight
          const progress = index / (levels - 1 || 1)
          const width = topWidth - (topWidth - bottomWidth) * progress
          const x = 400 - width / 2
          const nextWidth = topWidth - (topWidth - bottomWidth) * ((index + 1) / (levels - 1 || 1))
          const nextX = 400 - nextWidth / 2
          
          return (
            <g key={node.id}>
              <path
                d={`M ${x},${y} L ${x + width},${y} L ${nextX + nextWidth},${y + levelHeight} L ${nextX},${y + levelHeight} Z`}
                fill={node.color || `oklch(${0.50 + index * 0.08} 0.22 ${280 - index * 20})`}
                stroke="currentColor"
                strokeWidth="2"
              />
              <text
                x={400}
                y={y + levelHeight / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-base font-medium fill-white"
              >
                {node.label}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  const renderTree = () => {
    return (
      <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="tree-arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="currentColor" />
          </marker>
        </defs>
        
        {data.edges?.map((edge) => {
          const fromNode = data.nodes.find(n => n.id === edge.from)
          const toNode = data.nodes.find(n => n.id === edge.to)
          if (!fromNode || !toNode || !fromNode.position || !toNode.position) return null
          
          return (
            <path
              key={edge.id}
              d={`M ${fromNode.position.x},${fromNode.position.y + 25} L ${fromNode.position.x},${(fromNode.position.y + toNode.position.y) / 2} L ${toNode.position.x},${(fromNode.position.y + toNode.position.y) / 2} L ${toNode.position.x},${toNode.position.y - 25}`}
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          )
        })}
        
        {data.nodes.map((node) => {
          if (!node.position) return null
          const size = node.size === 'sm' ? 35 : node.size === 'lg' ? 55 : 45
          
          return (
            <g key={node.id}>
              <circle
                cx={node.position.x}
                cy={node.position.y}
                r={size}
                fill={node.color || 'oklch(0.95 0.04 280)'}
                stroke="currentColor"
                strokeWidth="2"
              />
              <text
                x={node.position.x}
                y={node.position.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-medium fill-current"
              >
                {node.label}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  const renderGantt = () => {
    const rowHeight = 60
    const startX = 150
    const barWidth = 500
    
    return (
      <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
        {data.nodes.map((node, index) => {
          const y = 50 + index * rowHeight
          const progress = ((index + 1) / data.nodes.length) * 0.8
          const width = barWidth * (0.3 + Math.random() * 0.5)
          
          return (
            <g key={node.id}>
              <text
                x={startX - 10}
                y={y + rowHeight / 2}
                textAnchor="end"
                dominantBaseline="middle"
                className="text-sm font-medium fill-current"
              >
                {node.label}
              </text>
              <rect
                x={startX}
                y={y + 10}
                width={width}
                height={rowHeight - 20}
                rx="6"
                fill={node.color || `oklch(${0.55 + index * 0.05} 0.22 ${280 + index * 30})`}
                stroke="currentColor"
                strokeWidth="2"
              />
            </g>
          )
        })}
        
        <line x1={startX} y1={30} x2={startX + barWidth} y2={30} stroke="currentColor" strokeWidth="1" />
        {[0, 1, 2, 3, 4].map(i => (
          <g key={i}>
            <line 
              x1={startX + (barWidth / 4) * i} 
              y1={30} 
              x2={startX + (barWidth / 4) * i} 
              y2={data.nodes.length * rowHeight + 40} 
              stroke="currentColor" 
              strokeWidth="1" 
              strokeDasharray="3,3"
              opacity="0.3"
            />
            <text
              x={startX + (barWidth / 4) * i}
              y={20}
              textAnchor="middle"
              className="text-xs fill-current"
            >
              Q{i + 1}
            </text>
          </g>
        ))}
      </svg>
    )
  }

  const renderSwot = () => {
    const categories = ['Strengths', 'Weaknesses', 'Opportunities', 'Threats']
    const colors = [
      'oklch(0.65 0.20 140)',
      'oklch(0.60 0.24 30)',
      'oklch(0.70 0.22 220)',
      'oklch(0.58 0.26 350)'
    ]
    
    return (
      <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
        {categories.map((category, quadIndex) => {
          const row = Math.floor(quadIndex / 2)
          const col = quadIndex % 2
          const x = 50 + col * 350
          const y = 50 + row * 250
          
          const quadrantNodes = data.nodes.slice(
            quadIndex * Math.ceil(data.nodes.length / 4),
            (quadIndex + 1) * Math.ceil(data.nodes.length / 4)
          )
          
          return (
            <g key={category}>
              <rect
                x={x}
                y={y}
                width="330"
                height="230"
                rx="12"
                fill={colors[quadIndex]}
                fillOpacity="0.15"
                stroke={colors[quadIndex]}
                strokeWidth="2"
              />
              <text
                x={x + 165}
                y={y + 25}
                textAnchor="middle"
                className="text-lg font-bold fill-current"
              >
                {category}
              </text>
              
              {quadrantNodes.map((node, idx) => (
                <text
                  key={node.id}
                  x={x + 15}
                  y={y + 55 + idx * 30}
                  className="text-sm fill-current"
                >
                  • {node.label}
                </text>
              ))}
            </g>
          )
        })}
      </svg>
    )
  }

  return (
    <div className={cn("w-full h-full min-h-[400px] flex items-center justify-center", className)}>
      {data.type === 'flowchart' && renderFlowchart()}
      {data.type === 'mindmap' && renderMindmap()}
      {data.type === 'timeline' && renderTimeline()}
      {data.type === 'org-chart' && renderOrgChart()}
      {data.type === 'venn' && renderVenn()}
      {data.type === 'pyramid' && renderPyramid()}
      {data.type === 'cycle' && renderCycle()}
      {data.type === 'network' && renderNetwork()}
      {data.type === 'matrix' && renderMatrix()}
      {data.type === 'funnel' && renderFunnel()}
      {data.type === 'tree' && renderTree()}
      {data.type === 'gantt' && renderGantt()}
      {data.type === 'swot' && renderSwot()}
      {!['flowchart', 'mindmap', 'timeline', 'org-chart', 'venn', 'pyramid', 'cycle', 'network', 'matrix', 'funnel', 'tree', 'gantt', 'swot'].includes(data.type) && (
        <div className="text-muted-foreground">Diagram type not supported yet</div>
      )}
    </div>
  )
}
