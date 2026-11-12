import { Slide, PresentationStyle } from '@/lib/types'
import { allStyleConfigs } from '@/lib/allStyles'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Image as ImageIcon } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { SmartShape } from './SmartShape'
import { ChartComponent } from './ChartComponent'
import { cn } from '@/lib/utils'

interface SlidePreviewProps {
  slide: Slide
  style: PresentationStyle
  isActive?: boolean
  onClick?: () => void
}

export function SlidePreview({ slide, style, isActive, onClick }: SlidePreviewProps) {
  const styleConfig = allStyleConfigs[style] || allStyleConfigs.minimal

  const animationClass = slide.animation ? `animate-${slide.animation}` : ''
  const animationStyle = slide.animationDelay ? { animationDelay: `${slide.animationDelay}ms` } : {}

  const renderContent = () => {
    if (slide.diagram) {
      if (['pie', 'bar', 'line'].includes(slide.diagram.type)) {
        return (
          <div className="h-full flex flex-col px-4 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6" style={{ color: styleConfig.colors.primary }}>
              {slide.title}
            </h2>
            <ChartComponent data={slide.diagram} className="flex-1" />
          </div>
        )
      }

      return (
        <div className="h-full flex flex-col px-4 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6" style={{ color: styleConfig.colors.primary }}>
            {slide.title}
          </h2>
          <SmartShape data={slide.diagram} className="flex-1" />
        </div>
      )
    }

    switch (slide.layout) {
      case 'title':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 md:px-10 bg-gradient-to-br from-primary/5 to-accent/5">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4"
              style={{ color: styleConfig.colors.primary }}
            >
              {slide.title}
            </motion.h1>
            {slide.content[0] && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl lg:text-2xl max-w-2xl"
                style={{ color: styleConfig.colors.text, opacity: 0.88 }}
              >
                {slide.content[0]}
              </motion.p>
            )}
          </div>
        )

      case 'bullets':
        return (
          <div className="h-full flex flex-col px-4 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10 overflow-hidden">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6 shrink-0" style={{ color: styleConfig.colors.primary }}>
              {slide.title}
            </h2>
            <ScrollArea className="flex-1">
              <ul className="space-y-3 md:space-y-4 pb-4">
                {slide.content.map((item, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <span
                      className="w-2 h-2 rounded-full mt-2.5 flex-shrink-0"
                      style={{ backgroundColor: styleConfig.colors.accent }}
                    />
                    <span className="text-base md:text-lg lg:text-xl leading-snug" style={{ color: styleConfig.colors.text }}>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        )

      case 'two-column':
        const midpoint = Math.ceil(slide.content.length / 2)
        const leftContent = slide.content.slice(0, midpoint)
        const rightContent = slide.content.slice(midpoint)

        return (
          <div className="h-full flex flex-col px-4 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10 overflow-hidden">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6 shrink-0" style={{ color: styleConfig.colors.primary }}>
              {slide.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-3 pb-4">
                  {leftContent.map((item, idx) => (
                    <p key={idx} className="text-sm md:text-base lg:text-lg leading-relaxed" style={{ color: styleConfig.colors.text }}>{item}</p>
                  ))}
                </div>
              </ScrollArea>
              <ScrollArea className="h-full">
                <div className="space-y-3 pb-4">
                  {rightContent.map((item, idx) => (
                    <p key={idx} className="text-sm md:text-base lg:text-lg leading-relaxed" style={{ color: styleConfig.colors.text }}>{item}</p>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )

      case 'quote':
        return (
          <div className="h-full flex flex-col items-center justify-center px-4 md:px-12 text-center bg-gradient-to-br from-accent/10 to-primary/10">
            <div
              className="text-4xl md:text-6xl font-bold mb-4 md:mb-6 opacity-20"
              style={{ color: styleConfig.colors.accent }}
            >
              "
            </div>
            <blockquote className="text-xl md:text-2xl font-medium mb-3 md:mb-4 max-w-3xl" style={{ color: styleConfig.colors.primary }}>
              {slide.content[0]}
            </blockquote>
            {slide.content[1] && (
              <cite className="text-sm md:text-lg not-italic" style={{ color: styleConfig.colors.text, opacity: 0.85 }}>— {slide.content[1]}</cite>
            )}
          </div>
        )

      case 'image-text':
        return (
          <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="relative bg-muted overflow-hidden">
              {slide.imageUrl ? (
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center px-4 md:px-8 lg:px-10 py-6 md:py-8">
              <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6" style={{ color: styleConfig.colors.primary }}>
                {slide.title}
              </h2>
              <div className="space-y-3">
                {slide.content.map((text, idx) => (
                  <p key={idx} className="text-sm md:text-base leading-relaxed" style={{ color: styleConfig.colors.text }}>
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
                  <ImageIcon className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <h2 className="absolute bottom-4 md:bottom-6 left-4 md:left-10 right-4 md:right-10 text-2xl md:text-4xl font-bold text-white">
                {slide.title}
              </h2>
            </div>
            <div className="flex-1 px-4 md:px-8 lg:px-10 py-4 md:py-6 flex flex-col justify-center">
              <div className="space-y-2">
                {slide.content.map((text, idx) => (
                  <p key={idx} className="text-sm md:text-base" style={{ color: styleConfig.colors.text }}>
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
                <ImageIcon className="w-20 h-20 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-10 lg:p-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4">
                {slide.title}
              </h2>
              {slide.content[0] && (
                <p className="text-base md:text-lg lg:text-xl text-white/90 max-w-3xl">
                  {slide.content[0]}
                </p>
              )}
            </div>
          </div>
        )

      case 'content':
      default:
        return (
          <div className="h-full flex flex-col px-4 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10 overflow-hidden">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6 shrink-0" style={{ color: styleConfig.colors.primary }}>
              {slide.title}
            </h2>
            <ScrollArea className="flex-1">
              <div className="space-y-4 pb-6">
                {slide.content.map((paragraph, idx) => (
                  <p key={idx} className="text-base md:text-lg lg:text-xl leading-relaxed" style={{ color: styleConfig.colors.text }}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </ScrollArea>
          </div>
        )
    }
  }

  return (
    <Card
      data-slide-export="true"
      onClick={onClick}
      className={cn(
        "w-full aspect-[16/9] overflow-hidden transition-all",
        onClick && 'cursor-pointer',
        isActive
          ? 'ring-2 ring-accent shadow-lg scale-[1.02]'
          : 'hover:shadow-md hover:scale-[1.01]',
        animationClass
      )}
      style={{
        backgroundColor: slide.backgroundColor || styleConfig.colors.background,
        ...animationStyle
      }}
    >
      <div style={{ color: styleConfig.colors.text }}>
        {renderContent()}
      </div>
    </Card>
  )
}
