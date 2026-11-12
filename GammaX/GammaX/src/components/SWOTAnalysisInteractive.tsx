import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, X, TrendUp, TrendDown, Target, Warning } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export interface SWOTItem {
  id: string
  text: string
  priority?: 'high' | 'medium' | 'low'
  tags?: string[]
}

export interface SWOTData {
  strengths: SWOTItem[]
  weaknesses: SWOTItem[]
  opportunities: SWOTItem[]
  threats: SWOTItem[]
}

interface SWOTAnalysisProps {
  data: SWOTData
  editable?: boolean
  onUpdate?: (data: SWOTData) => void
  interactive?: boolean
  colors?: {
    strengths: string
    weaknesses: string
    opportunities: string
    threats: string
  }
}

export function SWOTAnalysisInteractive({
  data: initialData,
  editable = false,
  onUpdate,
  interactive = true,
  colors = {
    strengths: 'oklch(0.62 0.20 160)',
    weaknesses: 'oklch(0.60 0.22 25)',
    opportunities: 'oklch(0.60 0.24 220)',
    threats: 'oklch(0.58 0.20 320)'
  }
}: SWOTAnalysisProps) {
  const [data, setData] = useState<SWOTData>(initialData)
  const [selectedQuadrant, setSelectedQuadrant] = useState<keyof SWOTData | null>(null)
  const [editingItem, setEditingItem] = useState<{ quadrant: keyof SWOTData; id: string } | null>(null)
  const [newItemText, setNewItemText] = useState('')
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const handleAddItem = (quadrant: keyof SWOTData) => {
    if (!newItemText.trim()) return

    const newItem: SWOTItem = {
      id: `${quadrant}-${Date.now()}`,
      text: newItemText.trim(),
      priority: 'medium'
    }

    const updatedData = {
      ...data,
      [quadrant]: [...data[quadrant], newItem]
    }

    setData(updatedData)
    onUpdate?.(updatedData)
    setNewItemText('')
    setSelectedQuadrant(null)
  }

  const handleRemoveItem = (quadrant: keyof SWOTData, itemId: string) => {
    const updatedData = {
      ...data,
      [quadrant]: data[quadrant].filter(item => item.id !== itemId)
    }

    setData(updatedData)
    onUpdate?.(updatedData)
  }

  const handlePriorityChange = (quadrant: keyof SWOTData, itemId: string, priority: 'high' | 'medium' | 'low') => {
    const updatedData = {
      ...data,
      [quadrant]: data[quadrant].map(item =>
        item.id === itemId ? { ...item, priority } : item
      )
    }

    setData(updatedData)
    onUpdate?.(updatedData)
  }

  const getPriorityColor = (priority?: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-700 border-red-300'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-300'
      case 'low':
        return 'bg-green-500/20 text-green-700 border-green-300'
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-300'
    }
  }

  const quadrants: Array<{
    key: keyof SWOTData
    label: string
    icon: React.ElementType
    description: string
    color: string
    iconColor: string
  }> = [
    {
      key: 'strengths',
      label: 'Strengths',
      icon: TrendUp,
      description: 'Internal positive attributes',
      color: colors.strengths,
      iconColor: 'text-green-600'
    },
    {
      key: 'weaknesses',
      label: 'Weaknesses',
      icon: TrendDown,
      description: 'Internal limitations',
      color: colors.weaknesses,
      iconColor: 'text-red-600'
    },
    {
      key: 'opportunities',
      label: 'Opportunities',
      icon: Target,
      description: 'External favorable conditions',
      color: colors.opportunities,
      iconColor: 'text-blue-600'
    },
    {
      key: 'threats',
      label: 'Threats',
      icon: Warning,
      description: 'External challenges',
      color: colors.threats,
      iconColor: 'text-purple-600'
    }
  ]

  return (
    <div className="w-full h-full p-4">
      <div className="grid grid-cols-2 gap-4 h-full">
        {quadrants.map((quadrant, index) => {
          const Icon = quadrant.icon
          const items = data[quadrant.key]
          const isSelected = selectedQuadrant === quadrant.key

          return (
            <motion.div
              key={quadrant.key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <Card
                className={`h-full p-5 transition-all duration-300 ${
                  isSelected ? 'ring-2 ring-accent shadow-lg scale-[1.02]' : 'hover:shadow-md'
                } ${interactive ? 'cursor-pointer' : ''}`}
                style={{
                  borderColor: quadrant.color,
                  borderWidth: '2px',
                  backgroundColor: `${quadrant.color}08`
                }}
                onClick={() => interactive && setSelectedQuadrant(isSelected ? null : quadrant.key)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${quadrant.iconColor} bg-white shadow-sm`}
                    >
                      <Icon weight="fill" className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{quadrant.label}</h3>
                      <p className="text-xs text-muted-foreground">{quadrant.description}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {items.length}
                  </Badge>
                </div>

                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {items.map((item, itemIndex) => {
                      const isHovered = hoveredItem === item.id
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ delay: itemIndex * 0.05 }}
                          layout
                          className={`group relative p-3 rounded-lg border transition-all duration-200 ${
                            isHovered ? 'bg-white shadow-sm scale-[1.02]' : 'bg-white/50'
                          }`}
                          onMouseEnter={() => setHoveredItem(item.id)}
                          onMouseLeave={() => setHoveredItem(null)}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium leading-snug">{item.text}</p>
                              {item.tags && item.tags.length > 0 && (
                                <div className="flex gap-1 mt-2">
                                  {item.tags.map((tag, tagIndex) => (
                                    <Badge
                                      key={tagIndex}
                                      variant="outline"
                                      className="text-[10px] px-1.5 py-0"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            {editable && (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <select
                                  value={item.priority || 'medium'}
                                  onChange={(e) =>
                                    handlePriorityChange(
                                      quadrant.key,
                                      item.id,
                                      e.target.value as 'high' | 'medium' | 'low'
                                    )
                                  }
                                  className="text-xs px-1 py-0.5 rounded border"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <option value="high">High</option>
                                  <option value="medium">Med</option>
                                  <option value="low">Low</option>
                                </select>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveItem(quadrant.key, item.id)
                                  }}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>

                          {item.priority && (
                            <div className="absolute top-2 right-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  item.priority === 'high'
                                    ? 'bg-red-500'
                                    : item.priority === 'medium'
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                }`}
                              />
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>

                  {items.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No items yet. {editable && 'Click to add.'}
                    </div>
                  )}
                </div>

                {editable && isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t"
                  >
                    <div className="flex gap-2">
                      <Textarea
                        placeholder={`Add new ${quadrant.label.toLowerCase()}...`}
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleAddItem(quadrant.key)
                          }
                        }}
                        className="flex-1 min-h-[60px] text-sm"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Button
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddItem(quadrant.key)
                        }}
                        disabled={!newItemText.trim()}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export const sampleSWOTData: SWOTData = {
  strengths: [
    { id: 's1', text: 'Strong technical team with AI expertise', priority: 'high', tags: ['Team', 'Technology'] },
    { id: 's2', text: 'Innovative product with unique features', priority: 'high', tags: ['Product'] },
    { id: 's3', text: 'Early mover advantage in niche market', priority: 'medium', tags: ['Market'] },
    { id: 's4', text: 'Solid financial backing from investors', priority: 'medium', tags: ['Finance'] }
  ],
  weaknesses: [
    { id: 'w1', text: 'Limited brand recognition in market', priority: 'high', tags: ['Brand', 'Marketing'] },
    { id: 'w2', text: 'Small customer support team', priority: 'medium', tags: ['Operations'] },
    { id: 'w3', text: 'Dependency on third-party APIs', priority: 'low', tags: ['Technology'] }
  ],
  opportunities: [
    { id: 'o1', text: 'Growing demand for AI-powered tools', priority: 'high', tags: ['Market', 'Trend'] },
    { id: 'o2', text: 'Potential partnerships with major platforms', priority: 'high', tags: ['Business'] },
    { id: 'o3', text: 'Expansion into international markets', priority: 'medium', tags: ['Growth'] },
    { id: 'o4', text: 'Enterprise segment shows strong interest', priority: 'medium', tags: ['Sales'] }
  ],
  threats: [
    { id: 't1', text: 'Established competitors with larger budgets', priority: 'high', tags: ['Competition'] },
    { id: 't2', text: 'Rapidly changing AI regulations', priority: 'high', tags: ['Legal', 'Compliance'] },
    { id: 't3', text: 'Economic downturn affecting SaaS spending', priority: 'medium', tags: ['Market', 'Economy'] }
  ]
}
