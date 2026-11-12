import React, { useState } from 'react'
import { PresentationStyle, AnimationType } from '@/lib/types'
import { allStyleConfigs, styleCategories } from '@/lib/allStyles'
import { animationConfigs } from '@/lib/animations'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Palette, Play, MagnifyingGlass } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface StyleAnimationPickerProps {
  currentStyle: PresentationStyle
  currentAnimation?: AnimationType
  onStyleChange: (style: PresentationStyle) => void
  onAnimationChange?: (animation: AnimationType) => void
}

export function StyleAnimationPicker({
  currentStyle,
  currentAnimation,
  onStyleChange,
  onAnimationChange
}: StyleAnimationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof styleCategories>('classic')

  const filteredStyles = Object.entries(allStyleConfigs).filter(([key, config]) => {
    const matchesSearch = key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         config.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         config.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const stylesByCategory = Object.entries(styleCategories).reduce((acc, [category, styles]) => {
    acc[category as keyof typeof styleCategories] = styles
      .map(styleKey => ({
        key: styleKey,
        config: allStyleConfigs[styleKey as PresentationStyle]
      }))
      .filter(({ config }) => config !== undefined)
    return acc
  }, {} as Record<keyof typeof styleCategories, Array<{ key: string, config: any }>>)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Palette className="w-4 h-4 mr-2" />
          Style & Animation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Customize Style & Animation</DialogTitle>
          <DialogDescription>
            Choose from 50 styles and 50 animations to make your presentation unique
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="styles" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="styles">
              <Palette className="w-4 h-4 mr-2" />
              Styles (50)
            </TabsTrigger>
            <TabsTrigger value="animations">
              <Play className="w-4 h-4 mr-2" />
              Animations (50)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="styles" className="space-y-4">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {!searchQuery && (
              <div className="flex gap-2 flex-wrap">
                {Object.keys(styleCategories).map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category as keyof typeof styleCategories)}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                  </Button>
                ))}
              </div>
            )}

            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-3 gap-3">
                {(searchQuery
                  ? filteredStyles
                  : stylesByCategory[selectedCategory]?.map(({ key, config }) => [key, config]) || []
                ).map((item) => {
                  const [styleKey, config] = item as [string, any]
                  return (
                  <button
                    key={styleKey}
                    onClick={() => onStyleChange(styleKey as PresentationStyle)}
                    className={cn(
                      "relative p-4 rounded-lg border-2 transition-all text-left group hover:shadow-lg hover:bg-primary/5 hover:border-primary/40",
                      currentStyle === styleKey
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border'
                    )}
                  >
                    <div
                      className="w-full h-16 rounded mb-3 transition-transform group-hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, ${config.colors.primary} 0%, ${config.colors.accent} 100%)`
                      }}
                    />
                    <div className="font-semibold text-sm text-foreground mb-1">
                      {config.name}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {config.description}
                    </div>
                    {config.effects && (
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {config.effects.gradient && <Badge variant="secondary" className="text-[10px] px-1 py-0">Gradient</Badge>}
                        {config.effects.blur && <Badge variant="secondary" className="text-[10px] px-1 py-0">Blur</Badge>}
                        {config.effects.shadow && <Badge variant="secondary" className="text-[10px] px-1 py-0">Shadow</Badge>}
                        {config.effects.texture && <Badge variant="secondary" className="text-[10px] px-1 py-0">Texture</Badge>}
                      </div>
                    )}
                  </button>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="animations" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select an animation effect for slide transitions
            </p>

            <ScrollArea className="h-[450px] pr-4">
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(animationConfigs).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => onAnimationChange?.(key as AnimationType)}
                    className={cn(
                      "relative p-3 rounded-lg border-2 transition-all text-left group hover:bg-primary/5 hover:border-primary/40",
                      currentAnimation === key
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border hover:shadow-md'
                    )}
                  >
                    <div className="flex items-center justify-center h-12 mb-2">
                      <div className={cn("w-8 h-8 bg-primary/20 rounded", config.css)} />
                    </div>
                    <div className="text-xs font-semibold text-center text-foreground">
                      {config.name}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
