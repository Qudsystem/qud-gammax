import React from 'react'
import { Slide, PresentationStyle } from '@/lib/types'
import { styleConfigs } from '@/lib/styles'
import { Card } from '@/components/ui/card'
import * as Icons from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SlidePreviewProps {
  slide: Slide
  style: PresentationStyle
  isActive?: boolean
  onClick?: () => void
  slideNumber?: number
}

export function SlidePreview({ slide, style, isActive, onClick, slideNumber }: SlidePreviewProps) {
  const [interactionState, setInteractionState] = React.useState<Record<string, any>>({})
  const styleConfig = styleConfigs[style]
  const IconComponent = (Icons as any)[slide.icon || 'Sparkle'] || Icons.Sparkle

  const getAnimationProps = (index = 0) => {
    const delay = index * 0.1
    const duration = (slide.transitionDuration || 400) / 1000
    switch (slide.animation) {
      case 'slide':
        return { initial: { x: 50, opacity: 0 }, animate: { x: 0, opacity: 1 }, transition: { delay, duration } }
      case 'zoom':
      case 'grow':
        return { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { delay, duration } }
      case 'shrink':
        return { initial: { scale: 1.2, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { delay, duration } }
      case 'float':
        return {
          initial: { y: 20, opacity: 0 },
          animate: { y: [0, -10, 0], opacity: 1 },
          transition: { delay, y: { repeat: Infinity, duration: 3, ease: "easeInOut" }, opacity: { duration: 0.5 } }
        }
      case 'bounce':
        return { initial: { y: -50, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { type: 'spring', delay, stiffness: 300, damping: 10 } }
      case 'morph':
        return { initial: { borderRadius: '50%', opacity: 0 }, animate: { borderRadius: '0%', opacity: 1 }, transition: { delay, duration: 1 } }
      case 'fade':
      default:
        return { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay, duration } }
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  const renderInteractiveElements = () => {
    if (!slide.interactiveElements?.length) return null

    return (
      <div className="absolute inset-0 pointer-events-none z-50">
        {slide.interactiveElements.map(el => {
          const value = interactionState[el.id] ?? el.value ?? (el.type === 'toggle' ? false : 50)

          return (
            <div
              key={el.id}
              className="absolute pointer-events-auto flex flex-col items-center gap-2"
              style={{ left: `${el.x}%`, top: `${el.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              {el.label && (
                <span className="text-xs font-bold bg-white/80 backdrop-blur px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                  {el.label}
                </span>
              )}

              {el.type === 'toggle' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setInteractionState(prev => ({ ...prev, [el.id]: !value }))
                  }}
                  className={cn(
                    "w-12 h-7 rounded-full transition-colors relative shadow-md border-2",
                    value ? "bg-green-500 border-green-600" : "bg-slate-200 border-slate-300"
                  )}
                >
                  <motion.div
                    animate={{ x: value ? 22 : 2 }}
                    className="w-5 h-5 bg-white rounded-full shadow-sm"
                  />
                </button>
              )}

              {el.type === 'slider' && (
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur p-2 rounded-xl shadow-lg border border-slate-100">
                  <input
                    type="range"
                    min={el.min || 0}
                    max={el.max || 100}
                    value={value}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setInteractionState(prev => ({ ...prev, [el.id]: Number(e.target.value) }))}
                    className="w-32 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="text-xs font-mono font-bold w-6 text-right">{value}</span>
                </div>
              )}

              {el.type === 'hotspot' && (
                <motion.button
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    // Show result/tooltip
                    alert(el.result || 'Hotspot clicked!')
                  }}
                  className="w-8 h-8 rounded-full bg-blue-500/80 text-white flex items-center justify-center shadow-lg border-2 border-white"
                >
                  <Icons.Plus weight="bold" />
                </motion.button>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const renderContent = () => {
    switch (slide.layout) {
      case 'title':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center px-12 bg-gradient-to-br from-primary/5 to-accent/5 relative overflow-hidden">
            {slide.icon && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none scale-[12]">
                <IconComponent weight="fill" style={{ color: styleConfig.colors.accent }} />
              </div>
            )}
            <motion.div {...getAnimationProps(0)} className="mb-6">
              <IconComponent className="w-20 h-20 opacity-60" weight="duotone" style={{ color: styleConfig.colors.accent }} />
            </motion.div>
            <motion.h1
              {...getAnimationProps(1)}
              className="text-6xl font-black mb-6 tracking-tight"
              style={{ color: styleConfig.colors.primary }}
            >
              {slide.title}
            </motion.h1>
            {slide.content[0] && (
              <motion.p
                {...getAnimationProps(3)}
                className="text-2xl text-muted-foreground max-w-2xl leading-relaxed"
              >
                {slide.content[0]}
              </motion.p>
            )}
          </div>
        )

      case 'bullets':
        return (
          <div className="h-full flex flex-col px-12 py-10">
            <h2 className="text-3xl font-semibold mb-8" style={{ color: styleConfig.colors.primary }}>
              {slide.title}
            </h2>
            <ul className="space-y-4 flex-1">
              {slide.content.map((item, idx) => (
                <motion.li
                  key={idx}
                  {...getAnimationProps(idx)}
                  className="flex items-start gap-3"
                >
                  <span
                    className="w-2 h-2 rounded-full mt-2.5 flex-shrink-0"
                    style={{ backgroundColor: styleConfig.colors.accent }}
                  />
                  <span className="text-lg text-foreground">{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        )

      case 'two-column':
        const midpoint = Math.ceil(slide.content.length / 2)
        const leftContent = slide.content.slice(0, midpoint)
        const rightContent = slide.content.slice(midpoint)

        return (
          <div className="h-full flex flex-col px-12 py-10">
            <h2 className="text-3xl font-semibold mb-8" style={{ color: styleConfig.colors.primary }}>
              {slide.title}
            </h2>
            <div className="grid grid-cols-2 gap-8 flex-1">
              <div className="space-y-3">
                {leftContent.map((item, idx) => (
                  <p key={idx} className="text-base text-foreground">{item}</p>
                ))}
              </div>
              <div className="space-y-3">
                {rightContent.map((item, idx) => (
                  <p key={idx} className="text-base text-foreground">{item}</p>
                ))}
              </div>
            </div>
          </div>
        )

      case 'quote':
        return (
          <div className="h-full flex flex-col items-center justify-center px-16 text-center bg-gradient-to-br from-accent/10 to-primary/10">
            <div
              className="text-6xl font-bold mb-6 opacity-20"
              style={{ color: styleConfig.colors.accent }}
            >
              "
            </div>
            <blockquote className="text-2xl font-medium mb-4 max-w-3xl" style={{ color: styleConfig.colors.primary }}>
              {slide.content[0]}
            </blockquote>
            {slide.content[1] && (
              <cite className="text-lg text-muted-foreground not-italic">— {slide.content[1]}</cite>
            )}
          </div>
        )

      case 'image-text':
        return (
          <div className="h-full grid grid-cols-2 gap-0">
            <div className="relative bg-muted overflow-hidden">
              {slide.imageUrl ? (
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icons.Image className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center px-10 py-8 relative">
              {slide.icon && (
                <div className="absolute top-4 right-4 opacity-10">
                  <IconComponent className="w-20 h-20" weight="fill" style={{ color: styleConfig.colors.accent }} />
                </div>
              )}
              <h2 className="text-3xl font-semibold mb-6" style={{ color: styleConfig.colors.primary }}>
                {slide.title}
              </h2>
              <div className="space-y-3">
                {slide.content.map((text, idx) => (
                  <p key={idx} className="text-base text-foreground leading-relaxed">
                    {text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )

      case 'split-image':
        return (
          <div className="h-full flex flex-col">
            <div className="relative h-2/3 bg-muted overflow-hidden">
              {slide.imageUrl ? (
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icons.Image className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-10 right-10 flex items-center gap-4">
                {slide.icon && <IconComponent className="w-8 h-8 text-white opacity-80" weight="fill" />}
                <h2 className="text-4xl font-bold text-white">
                  {slide.title}
                </h2>
              </div>
            </div>
            <div className="flex-1 px-10 py-6 flex flex-col justify-center">
              <div className="space-y-2">
                {slide.content.map((text, idx) => (
                  <p key={idx} className="text-base text-foreground">
                    {text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )

      case 'full-image':
        return (
          <div className="relative h-full">
            {slide.imageUrl ? (
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Icons.Image className="w-20 h-20 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-12">
              <h2 className="text-5xl font-bold text-white mb-4">
                {slide.title}
              </h2>
              {slide.content[0] && (
                <p className="text-xl text-white/90 max-w-3xl">
                  {slide.content[0]}
                </p>
              )}
            </div>
          </div>
        )

      case 'flowchart':
        return (
          <div className="h-full flex flex-col px-12 py-10">
            <motion.h2
              {...getAnimationProps(0)}
              className="text-3xl font-semibold mb-8"
              style={{ color: styleConfig.colors.primary }}
            >
              {slide.title}
            </motion.h2>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="flex flex-wrap items-center justify-center gap-8 flex-1"
            >
              {(slide.flowchart?.nodes || []).map((node, idx) => (
                <React.Fragment key={node.id}>
                  <motion.div
                    variants={itemVariants}
                    className={`p-6 rounded-2xl border-2 shadow-xl flex items-center justify-center text-center font-bold min-w-[180px] relative overflow-hidden backdrop-blur-md ${node.type === 'decision' ? 'rotate-45 p-8 rounded-none' : ''
                      } ${node.type === 'start' || node.type === 'end' ? 'rounded-full border-dashed' : ''
                      }`}
                    style={{
                      backgroundColor: styleConfig.colors.secondary + '80',
                      borderColor: styleConfig.colors.accent,
                      color: styleConfig.colors.primary,
                      boxShadow: `0 10px 30px ${styleConfig.colors.accent}20`
                    }}
                  >
                    <div className={node.type === 'decision' ? '-rotate-45' : ''}>
                      {node.label}
                    </div>
                    {/* Subtle glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                  </motion.div>
                  {idx < (slide.flowchart?.nodes.length || 0) - 1 && (
                    <div className="w-[60px] h-[40px] relative flex items-center justify-center -mx-2 z-0">
                      <svg width="100%" height="20" className="overflow-visible">
                        <defs>
                          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill={styleConfig.colors.accent} />
                          </marker>
                        </defs>
                        <motion.line
                          x1="0" y1="10" x2="60" y2="10"
                          stroke={styleConfig.colors.accent}
                          strokeWidth="3"
                          strokeDasharray="4 4"
                          markerEnd="url(#arrowhead)"
                          initial={{ strokeDashoffset: 0 }}
                          animate={{ strokeDashoffset: -20 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        />
                      </svg>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </motion.div>
          </div>
        )

      case 'diagram':
        return (
          <div className="h-full flex flex-col px-12 py-10">
            <motion.h2
              {...getAnimationProps(0)}
              className="text-3xl font-semibold mb-8"
              style={{ color: styleConfig.colors.primary }}
            >
              {slide.title}
            </motion.h2>
            <div className="relative flex-1 flex items-center justify-center gap-12">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="flex items-center justify-center gap-12 w-full"
              >
                {(slide.shapes || []).map((shape, idx) => (
                  <motion.div key={idx} variants={itemVariants}>
                    <motion.div
                      animate={
                        shape.animation === 'pulse' ? { scale: [1, 1.05, 1] } :
                          shape.animation === 'float' ? { y: [0, -10, 0] } :
                            shape.animation === 'spin' ? { rotate: 360 } : {}
                      }
                      transition={
                        shape.animation !== 'none' ? { repeat: Infinity, duration: 3, ease: "easeInOut" } : {}
                      }
                      className={cn(
                        "flex flex-col items-center justify-center p-10 relative group border-2 transition-all",
                        shape.type === 'circle' ? 'rounded-full aspect-square' :
                          shape.type === 'star' ? 'clip-path-star' :
                            shape.type === 'hexagon' ? 'clip-path-hexagon' :
                              shape.type === 'blob' ? 'rounded-[40%_60%_70%_30%/40%_50%_60%_50%]' :
                                shape.type === 'pill' ? 'rounded-full px-12' : 'rounded-3xl',
                        shape.effect === 'glass' && "bg-white/10 backdrop-blur-xl border-white/20 shadow-xl",
                        shape.effect === 'neumorphic' && "shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff]",
                        shape.effect === 'gradient' && "bg-gradient-to-br from-primary/10 to-accent/20"
                      )}
                      style={{
                        backgroundColor: !shape.effect || shape.effect === 'none' ? (shape.color || styleConfig.colors.accent + '15') : undefined,
                        borderColor: !shape.effect || shape.effect === 'none' ? (shape.color || styleConfig.colors.accent) : undefined,
                        minWidth: '200px',
                        boxShadow: !shape.effect || shape.effect === 'none' ? `0 15px 40px ${shape.color || styleConfig.colors.accent}30` : undefined
                      }}
                    >
                      <span className="text-2xl font-black text-center" style={{ color: styleConfig.colors.primary }}>
                        {shape.label}
                      </span>
                      {shape.intensity === 'glow' && (
                        <div
                          className="absolute inset-0 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity -z-10"
                          style={{ backgroundColor: shape.color || styleConfig.colors.accent }}
                        />
                      )}
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        )

      case 'chart':
        return (
          <div className="h-full flex flex-col px-12 py-10">
            <motion.h2
              {...getAnimationProps(0)}
              className="text-3xl font-semibold mb-8"
              style={{ color: styleConfig.colors.primary }}
            >
              {slide.title}
            </motion.h2>
            <div className="flex-1 flex items-end justify-around gap-6 pb-12 pt-8 border-b-2 border-muted/20">
              {((slide.chart?.data || [])).map((item, idx) => {
                const maxVal = Math.max(1, ...(slide.chart?.data || []).map(d => d.value))
                const height = maxVal > 0 ? (item.value / maxVal) * 100 : 0
                return (
                  <div key={idx} className="flex flex-col items-center gap-4 w-full max-w-[100px] relative">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: idx * 0.1, duration: 1.2, ease: "easeOut" }}
                      className="w-full rounded-t-2xl shadow-2xl relative group overflow-hidden"
                      style={{
                        backgroundColor: styleConfig.colors.accent,
                        boxShadow: `0 10px 30px ${styleConfig.colors.accent}40`
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-lg font-black opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0" style={{ color: styleConfig.colors.primary }}>
                        {item.value}
                      </div>
                    </motion.div>
                    <span className="text-sm font-bold text-muted-foreground absolute -bottom-10 rotate-12 origin-center whitespace-nowrap">
                      {item.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )

      case 'stats-grid':
        return (
          <div className="h-full flex flex-col px-12 py-10 relative overflow-hidden">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `radial-gradient(${styleConfig.colors.accent} 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />

            <motion.h2
              {...getAnimationProps(0)}
              className="text-4xl font-black mb-12 tracking-tight relative z-10"
              style={{ color: styleConfig.colors.primary }}
            >
              {slide.title}
            </motion.h2>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-8 flex-1 items-center relative z-10"
            >
              {slide.content.map((item, idx) => {
                const parts = item.split(':')
                const value = parts[0]?.trim() || ''
                const label = parts.slice(1).join(':').trim() || ''
                return (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    className="p-12 rounded-[3rem] border-2 text-center relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 shadow-2xl"
                    style={{
                      borderColor: styleConfig.colors.accent + '20',
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: `0 30px 60px -12px ${styleConfig.colors.accent}15`
                    }}
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: styleConfig.colors.accent }} />
                    <div className="text-7xl font-black mb-4 tracking-tighter" style={{ color: styleConfig.colors.accent }}>
                      {value}
                    </div>
                    <div className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em] leading-tight max-w-[200px] mx-auto">
                      {label}
                    </div>
                    {/* Subtle Internal Glow */}
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-accent/5 rounded-full blur-3xl group-hover:scale-150 transition-transform" style={{ backgroundColor: styleConfig.colors.accent }} />
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        )

      case 'heatmap':
        return (
          <div className="h-full flex flex-col px-12 py-10">
            <h2 className="text-3xl font-semibold mb-8" style={{ color: styleConfig.colors.primary }}>{slide.title}</h2>
            <div className="flex-1 grid grid-cols-5 gap-2">
              {Array.from({ length: 25 }).map((_, i) => {
                const intensity = Math.random()
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="rounded-lg aspect-square flex items-center justify-center text-[8px] font-bold"
                    style={{
                      backgroundColor: styleConfig.colors.accent,
                      opacity: 0.1 + intensity * 0.9
                    }}
                  >
                    {Math.floor(intensity * 100)}%
                  </motion.div>
                )
              })}
            </div>
          </div>
        )

      case 'gauge':
        return (
          <div className="h-full flex flex-col items-center justify-center px-12">
            <h2 className="text-3xl font-semibold mb-12" style={{ color: styleConfig.colors.primary }}>{slide.title}</h2>
            <div className="relative w-64 h-64">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#eee" strokeWidth="10" strokeDasharray="141 282" />
                <motion.circle
                  cx="50" cy="50" r="45" fill="none"
                  stroke={styleConfig.colors.accent} strokeWidth="10"
                  strokeDasharray="141 282"
                  initial={{ strokeDashoffset: 141 }}
                  animate={{ strokeDashoffset: 141 * (1 - (slide.chart?.data?.[0]?.value || 75) / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                <span className="text-5xl font-black">{slide.chart?.data?.[0]?.value || 75}%</span>
                <span className="text-sm font-bold opacity-40 uppercase tracking-widest">{slide.chart?.data?.[0]?.label || 'Score'}</span>
              </div>
            </div>
          </div>
        )

      case 'timeline':
        return (
          <div className="h-full flex flex-col px-12 py-10">
            <h2 className="text-3xl font-semibold mb-12" style={{ color: styleConfig.colors.primary }}>{slide.title}</h2>
            <div className="relative flex-1 mt-10">
              <div className="absolute top-0 left-0 right-0 h-1 bg-muted/20" />
              <div className="flex justify-between items-start mt-[-6px]">
                {slide.content.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-4 max-w-[150px] text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.2 }}
                      className="w-3 h-3 rounded-full bg-accent ring-4 ring-accent/20"
                      style={{ backgroundColor: styleConfig.colors.accent }}
                    />
                    <motion.div {...getAnimationProps(idx + 1)}>
                      <p className="text-xs font-black uppercase tracking-widest mb-1 text-accent" style={{ color: styleConfig.colors.accent }}>Phase {idx + 1}</p>
                      <p className="text-sm font-bold text-foreground">{item}</p>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'comparison':
        return (
          <div className="h-full flex flex-col px-12 py-10">
            <h2 className="text-3xl font-semibold mb-8" style={{ color: styleConfig.colors.primary }}>{slide.title}</h2>
            <div className="grid grid-cols-2 gap-8 flex-1">
              {['Current', 'Proposed'].map((side, i) => (
                <motion.div
                  key={side}
                  {...getAnimationProps(i)}
                  className="rounded-[2rem] p-8 border-2 border-dashed flex flex-col gap-4"
                  style={{ borderColor: styleConfig.colors.accent + '30', backgroundColor: i === 1 ? styleConfig.colors.accent + '05' : 'transparent' }}
                >
                  <span className="text-xs font-black uppercase tracking-widest text-accent" style={{ color: styleConfig.colors.accent }}>{side} State</span>
                  <ul className="space-y-3">
                    {slide.content.slice(i * 3, (i + 1) * 3).map((li, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm font-medium">
                        <Icons.CheckCircle weight="fill" className="text-accent" style={{ color: styleConfig.colors.accent }} />
                        {li}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        )

      case 'feature-grid':
        return (
          <div className="h-full flex flex-col px-12 py-10">
            <h2 className="text-3xl font-semibold mb-8" style={{ color: styleConfig.colors.primary }}>{slide.title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 flex-1">
              {slide.content.map((item, idx) => (
                <motion.div
                  key={idx}
                  {...getAnimationProps(idx)}
                  className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col items-center text-center gap-3"
                >
                  <div className="p-3 bg-accent/10 rounded-xl" style={{ backgroundColor: styleConfig.colors.accent + '10' }}>
                    <Icons.Sparkle weight="fill" className="w-5 h-5 text-accent" style={{ color: styleConfig.colors.accent }} />
                  </div>
                  <p className="text-sm font-bold text-foreground">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )

      case 'before-after':
        return (
          <div className="h-full flex flex-col px-12 py-10">
            <h2 className="text-3xl font-semibold mb-8" style={{ color: styleConfig.colors.primary }}>{slide.title}</h2>
            <div className="flex-1 flex gap-8">
              <div className="flex-1 rounded-[2rem] bg-slate-100 p-8 relative overflow-hidden flex flex-col justify-center text-center border-2 border-slate-200">
                <span className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-slate-900 text-white text-[10px] font-black uppercase rounded-full">Before</span>
                <p className="text-xl font-bold text-slate-400 italic line-through">{slide.content[0] || 'Inefficient Manual Processes'}</p>
              </div>
              <div className="flex items-center">
                <Icons.ArrowRight weight="bold" className="w-8 h-8 text-accent" style={{ color: styleConfig.colors.accent }} />
              </div>
              <div className="flex-1 rounded-[2rem] p-8 relative overflow-hidden flex flex-col justify-center text-center border-2" style={{ backgroundColor: styleConfig.colors.accent + '10', borderColor: styleConfig.colors.accent }}>
                <span className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-accent text-[10px] font-black uppercase rounded-full shadow-sm" style={{ color: styleConfig.colors.accent }}>After</span>
                <p className="text-xl font-black text-foreground">{slide.content[1] || 'AI-Automated Intelligent Workflows'}</p>
              </div>
            </div>
          </div>
        )

      case 'portfolio':
        return (
          <div className="h-full flex flex-col px-12 py-10">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-accent mb-2" style={{ color: styleConfig.colors.accent }}>Showcase</p>
                <h2 className="text-4xl font-black tracking-tight" style={{ color: styleConfig.colors.primary }}>{slide.title}</h2>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-slate-200" />)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 flex-1">
              <div className="rounded-[2.5rem] bg-muted overflow-hidden relative group">
                <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-8">
                  <p className="text-white text-lg font-black">{slide.content[0] || 'Creative Vision'}</p>
                </div>
              </div>
              <div className="grid grid-rows-2 gap-4">
                <div className="rounded-[2rem] bg-slate-900 flex items-center justify-center p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-2xl rounded-full" />
                  <p className="text-center font-bold text-sm leading-relaxed">{slide.content[1] || 'Strategic Impact'}</p>
                </div>
                <div className="rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center p-8">
                  <p className="text-center font-bold text-slate-400 text-sm">{slide.content[2] || 'Future Roadmap'}</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'sankey':
        return (
          <div className="h-full flex flex-col px-12 py-10">
            <h2 className="text-3xl font-semibold mb-8" style={{ color: styleConfig.colors.primary }}>{slide.title}</h2>
            <div className="flex-1 relative flex items-center justify-center">
              <svg className="w-full h-full max-h-[300px]" viewBox="0 0 400 200">
                {/* Nodes */}
                <rect x="20" y="20" width="10" height="160" fill={styleConfig.colors.primary} fillOpacity="0.2" rx="2" />
                <rect x="370" y="20" width="10" height="30" fill={styleConfig.colors.accent} rx="2" />
                <rect x="370" y="70" width="10" height="50" fill={styleConfig.colors.accent} fillOpacity="0.6" rx="2" />
                <rect x="370" y="140" width="10" height="40" fill={styleConfig.colors.accent} fillOpacity="0.3" rx="2" />

                {/* Paths with flow animation */}
                {[
                  { d: "M30 40 C 200 40, 200 35, 370 35", width: 20, delay: 0 },
                  { d: "M30 100 C 200 100, 200 95, 370 95", width: 40, delay: 0.2 },
                  { d: "M30 160 C 200 160, 200 160, 370 160", width: 30, delay: 0.4 }
                ].map((path, i) => (
                  <motion.path
                    key={i}
                    d={path.d}
                    stroke={styleConfig.colors.accent}
                    strokeWidth={path.width}
                    fill="none"
                    strokeDasharray="10 10"
                    initial={{ strokeDashoffset: 0, opacity: 0.1 }}
                    animate={{ strokeDashoffset: -100, opacity: 0.2 }}
                    transition={{ strokeDashoffset: { repeat: Infinity, duration: 20, ease: "linear" }, opacity: { duration: 0.5 } }}
                  />
                ))}

                {/* Labels */}
                <text x="40" y="100" fontSize="10" fontWeight="bold" fill={styleConfig.colors.primary} opacity="0.5">INPUT FLOW</text>
                <text x="360" y="35" fontSize="8" fontWeight="bold" fill={styleConfig.colors.primary} textAnchor="end">CONVERSION</text>
                <text x="360" y="95" fontSize="8" fontWeight="bold" fill={styleConfig.colors.primary} textAnchor="end">RETENTION</text>
                <text x="360" y="160" fontSize="8" fontWeight="bold" fill={styleConfig.colors.primary} textAnchor="end">CHURN</text>
              </svg>
            </div>
          </div>
        )
      case 'waterfall':
        return (
          <div className="h-full flex flex-col px-12 py-10">
            <h2 className="text-3xl font-semibold mb-8" style={{ color: styleConfig.colors.primary }}>{slide.title}</h2>
            <div className="flex-1 flex items-end gap-4 relative border-b border-slate-200 pb-4">
              {/* Reference Zero Line */}
              <div className="absolute left-0 right-0 bottom-1/3 h-[1px] border-t border-dashed border-slate-300" />

              {[
                { label: 'Start', val: 100, type: 'base' },
                { label: 'Sales', val: 40, type: 'pos' },
                { label: 'Cost', val: -20, type: 'neg' },
                { label: 'Tax', val: -10, type: 'neg' },
                { label: 'Net', val: 110, type: 'total' }
              ].map((d, i) => {
                const height = Math.abs(d.val) * 1.5
                // Rough mock positioning logic
                const bottom = i === 0 ? 33 : i === 1 ? 133 : i === 2 ? 113 : i === 3 ? 93 : 0
                const color = d.type === 'total' ? styleConfig.colors.primary : d.type === 'neg' ? '#ef4444' : d.type === 'base' ? '#cbd5e1' : styleConfig.colors.accent

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end">
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: height, opacity: 1 }}
                      transition={{ delay: i * 0.2 }}
                      className="w-full rounded-md shadow-md relative group-hover:scale-105 transition-transform"
                      style={{
                        backgroundColor: color,
                        marginBottom: d.type === 'total' ? '33%' : `${bottom}px`
                      }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 font-bold text-xs opacity-0 group-hover:opacity-100">{d.val}</div>
                    </motion.div>
                    <span className="text-xs font-bold text-slate-400">{d.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )

      case 'content':
      default:
        return (
          <div className="h-full flex flex-col px-12 py-10">
            <h2 className="text-3xl font-semibold mb-6" style={{ color: styleConfig.colors.primary }}>
              {slide.title}
            </h2>
            <div className="space-y-4 flex-1">
              {slide.content.map((paragraph, idx) => (
                <p key={idx} className="text-lg text-foreground leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )
    }
  }

  return (
    <Card
      onClick={onClick}
      className={`w-full aspect-[16/9] overflow-hidden transition-all relative ${onClick ? 'cursor-pointer' : ''
        } ${isActive
          ? 'ring-4 ring-accent/50 shadow-2xl scale-[1.02]'
          : 'hover:shadow-xl hover:scale-[1.01]'
        }`}
      style={{ backgroundColor: styleConfig.colors.secondary }}
    >
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0" style={{ backgroundImage: `radial-gradient(${styleConfig.colors.accent} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      <div className="absolute top-0 left-0 w-full h-1 bg-muted/20 z-20">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: isActive ? '100%' : '0%' }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="h-full"
          style={{ backgroundColor: styleConfig.colors.accent }}
        />
      </div>
      <div className="relative z-10 h-full">
        {renderInteractiveElements()}
        {slideNumber && (
          <div className="absolute bottom-6 left-6 z-20 pointer-events-none">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
              <span className="text-2xl font-black text-white/90 drop-shadow-md font-mono">{slideNumber}</span>
            </div>
          </div>
        )}
        {renderContent()}
      </div>
    </Card>
  )
}
