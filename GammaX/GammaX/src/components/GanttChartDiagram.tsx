import { useState } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'

export interface GanttTask {
  id: string
  name: string
  start: Date
  end: Date
  progress: number
  assignee?: string
  color?: string
  milestone?: boolean
  dependencies?: string[]
}

interface GanttChartDiagramProps {
  tasks: GanttTask[]
  width?: number
  height?: number
  interactive?: boolean
  onTaskClick?: (task: GanttTask) => void
  colors?: {
    primary: string
    secondary: string
    accent: string
  }
}

export function GanttChartDiagram({
  tasks,
  width = 900,
  height = 400,
  interactive = true,
  onTaskClick,
  colors = {
    primary: 'oklch(0.50 0.22 280)',
    secondary: 'oklch(0.94 0.04 280)',
    accent: 'oklch(0.65 0.20 220)'
  }
}: GanttChartDiagramProps) {
  const [hoveredTask, setHoveredTask] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<string | null>(null)

  const chartMargin = { top: 50, right: 20, bottom: 50, left: 180 }
  const chartWidth = width - chartMargin.left - chartMargin.right
  const chartHeight = height - chartMargin.top - chartMargin.bottom
  const rowHeight = chartHeight / tasks.length

  const allDates = tasks.flatMap(t => [t.start, t.end])
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())))
  const timeRange = maxDate.getTime() - minDate.getTime()

  const dateToX = (date: Date) => {
    return ((date.getTime() - minDate.getTime()) / timeRange) * chartWidth
  }

  const getWeeks = () => {
    const weeks: Date[] = []
    const current = new Date(minDate)
    while (current <= maxDate) {
      weeks.push(new Date(current))
      current.setDate(current.getDate() + 7)
    }
    return weeks
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getTaskColor = (task: GanttTask, opacity: number = 1) => {
    if (task.color) return task.color
    const baseColor = colors.accent
    return baseColor.replace(/[\d.]+\)$/, `${opacity})`)
  }

  const handleTaskClick = (task: GanttTask) => {
    setSelectedTask(task.id)
    onTaskClick?.(task)
  }

  return (
    <TooltipProvider>
      <div className="relative w-full" style={{ height }}>
        <svg width={width} height={height} className="overflow-visible">
          <defs>
            <linearGradient id="taskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: colors.accent, stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: colors.primary, stopOpacity: 0.9 }} />
            </linearGradient>

            <filter id="taskShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="0" dy="2" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill={colors.accent} opacity="0.6" />
            </marker>
          </defs>

          <g transform={`translate(${chartMargin.left}, ${chartMargin.top})`}>
            {getWeeks().map((week, i) => {
              const x = dateToX(week)
              return (
                <g key={i}>
                  <line
                    x1={x}
                    y1={-10}
                    x2={x}
                    y2={chartHeight}
                    stroke={colors.secondary}
                    strokeWidth="1"
                    strokeDasharray="2,4"
                    opacity="0.3"
                  />
                  <text
                    x={x}
                    y={-15}
                    fontSize="11"
                    fill="currentColor"
                    textAnchor="middle"
                    className="text-muted-foreground"
                  >
                    {formatDate(week)}
                  </text>
                </g>
              )
            })}

            {tasks.map((task, i) => {
              const y = i * rowHeight + rowHeight / 2
              const taskStart = dateToX(task.start)
              const taskWidth = dateToX(task.end) - taskStart
              const isHovered = hoveredTask === task.id
              const isSelected = selectedTask === task.id

              return (
                <g key={task.id}>
                  <text
                    x={-10}
                    y={y + 5}
                    fill="currentColor"
                    textAnchor="end"
                    className="font-medium"
                    opacity={isHovered || isSelected ? 1 : 0.7}
                  >
                    {task.name}
                  </text>

                  {task.milestone ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <g
                          transform={`translate(${taskStart}, ${y})`}
                          onClick={() => interactive && handleTaskClick(task)}
                          onMouseEnter={() => interactive && setHoveredTask(task.id)}
                          onMouseLeave={() => interactive && setHoveredTask(null)}
                          className={interactive ? 'cursor-pointer' : ''}
                        >
                          <polygon
                            points="0,-8 8,0 0,8 -8,0"
                            fill="url(#taskGradient)"
                            stroke={colors.primary}
                            strokeWidth={isSelected ? 3 : 2}
                            filter={isHovered ? 'url(#taskShadow)' : undefined}
                          />
                        </g>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm">
                          <div className="font-semibold">{task.name}</div>
                          <div className="text-muted-foreground">{formatDate(task.start)}</div>
                          {task.assignee && <div className="mt-1">Assigned to: {task.assignee}</div>}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <g
                          onClick={() => interactive && handleTaskClick(task)}
                          onMouseEnter={() => interactive && setHoveredTask(task.id)}
                          onMouseLeave={() => interactive && setHoveredTask(null)}
                          className={interactive ? 'cursor-pointer' : ''}
                        >
                          <rect
                            x={taskStart}
                            y={y - 12}
                            width={taskWidth}
                            height={24}
                            rx="6"
                            fill={getTaskColor(task, 0.15)}
                            stroke={getTaskColor(task, 1)}
                            strokeWidth={isSelected ? 2.5 : 1.5}
                            filter={isHovered ? 'url(#taskShadow)' : undefined}
                            className="transition-all duration-200"
                          />

                          <rect
                            x={taskStart}
                            y={y - 12}
                            width={taskWidth * (task.progress / 100)}
                            height={24}
                            rx="6"
                            fill="url(#taskGradient)"
                            className="transition-all duration-300"
                          />

                          <text
                            x={taskStart + taskWidth / 2}
                            y={y + 5}
                            fontSize="11"
                            fill="currentColor"
                            textAnchor="middle"
                            className="font-medium pointer-events-none"
                            opacity="0.9"
                          >
                            {task.progress}%
                          </text>
                        </g>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm space-y-1">
                          <div className="font-semibold">{task.name}</div>
                          <div className="text-muted-foreground">
                            {formatDate(task.start)} - {formatDate(task.end)}
                          </div>
                          <div>Progress: {task.progress}%</div>
                          {task.assignee && <div>Assigned to: {task.assignee}</div>}
                          {task.dependencies && task.dependencies.length > 0 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Depends on: {task.dependencies.join(', ')}
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {task.dependencies?.map((depId) => {
                    const depTask = tasks.find(t => t.id === depId)
                    if (!depTask) return null

                    const depIndex = tasks.indexOf(depTask)
                    const depY = depIndex * rowHeight + rowHeight / 2
                    const depEnd = dateToX(depTask.end)

                    return (
                      <line
                        key={`${task.id}-${depId}`}
                        x1={depEnd}
                        y1={depY}
                        x2={taskStart}
                        y2={y}
                        stroke={colors.accent}
                        strokeWidth="2"
                        opacity="0.4"
                        markerEnd="url(#arrowhead)"
                      />
                    )
                  })}
                </g>
              )
            })}
          </g>
        </svg>

        {selectedTask && (
          <div className="absolute top-4 right-4 bg-card border border-border rounded-lg p-3 shadow-lg">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-sm font-semibold">Selected Task</span>
              <Badge variant="secondary">{tasks.find(t => t.id === selectedTask)?.name}</Badge>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

export const sampleGanttTasks: GanttTask[] = [
  {
    id: 't1',
    name: 'Project Planning',
    start: new Date(2024, 0, 1),
    end: new Date(2024, 0, 15),
    progress: 100,
    assignee: 'Alex Chen',
    milestone: false
  },
  {
    id: 't2',
    name: 'Design Phase',
    start: new Date(2024, 0, 16),
    end: new Date(2024, 1, 1),
    progress: 80,
    assignee: 'Sarah Kim',
    dependencies: ['t1']
  },
  {
    id: 't3',
    name: 'Development Sprint 1',
    start: new Date(2024, 1, 2),
    end: new Date(2024, 1, 16),
    progress: 60,
    assignee: 'Jordan Lee',
    dependencies: ['t2']
  },
  {
    id: 't4',
    name: 'Testing & QA',
    start: new Date(2024, 1, 17),
    end: new Date(2024, 2, 1),
    progress: 40,
    assignee: 'Morgan Taylor',
    dependencies: ['t3']
  },
  {
    id: 't5',
    name: 'Launch',
    start: new Date(2024, 2, 1),
    end: new Date(2024, 2, 1),
    progress: 0,
    milestone: true,
    dependencies: ['t4']
  }
]
