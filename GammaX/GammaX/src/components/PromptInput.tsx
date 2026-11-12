import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkle, Lightning, Palette } from '@phosphor-icons/react'
import { PresentationStyle } from '@/lib/types'
import { allStyleConfigs, styleCategories } from '@/lib/allStyles'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PromptInputProps {
  onGenerate: (prompt: string, style: PresentationStyle, slideCount?: number) => void
  isGenerating: boolean
}

const examplePrompts = [
  "Create a presentation about climate change solutions for 2024",
  "Marketing strategy for launching a new AI-powered SaaS product",
  "Introduction to quantum computing for business executives",
  "Quarterly business review with growth metrics and future plans",
  "Product design principles for building user-friendly apps",
  "The future of remote work and digital collaboration"
]

export function PromptInput({ onGenerate, isGenerating }: PromptInputProps) {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState<PresentationStyle>('minimal')
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof styleCategories>('classic')
  const [slideCount, setSlideCount] = useState<number>(8)

  const handleSubmit = () => {
    if (prompt.trim()) {
      onGenerate(prompt, style, slideCount)
    }
  }

  const handleExampleClick = (example: string) => {
    setPrompt(example)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && prompt.trim()) {
      handleSubmit()
    }
  }

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-8 max-w-5xl mx-auto shadow-lg border-2 border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label htmlFor="prompt-input" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Lightning className="w-4 h-4 text-primary" weight="fill" />
                Describe your presentation
              </label>
              <Badge variant="secondary" className="text-xs">
                {prompt.length}/1000
              </Badge>
            </div>
            <Textarea
              id="prompt-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, 1000))}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Create a presentation about sustainable energy solutions with flowcharts, data visualizations and case studies..."
              className="min-h-[140px] text-base resize-none bg-background/50 border-2 focus:border-primary transition-colors"
              disabled={isGenerating}
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Press <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded border">⌘</kbd> + <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded border">Enter</kbd> to generate
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-foreground flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" weight="fill" />
                Presentation Style
              </label>
              <Badge variant="secondary" className="text-xs">
                50 styles available
              </Badge>
            </div>

            <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as keyof typeof styleCategories)}>
              <TabsList className="grid w-full grid-cols-5 h-auto">
                {Object.keys(styleCategories).map((category) => (
                  <TabsTrigger key={category} value={category} className="text-xs py-2">
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(styleCategories).map(([category]) => (
                <TabsContent key={category} value={category}>
                  <ScrollArea className="h-[200px]">
                    <div className="grid grid-cols-6 gap-2 pr-4">
                      {stylesByCategory[category as keyof typeof styleCategories]?.map(({ key, config }) => (
                        <button
                          key={key}
                          onClick={() => setStyle(key as PresentationStyle)}
                          disabled={isGenerating}
                          className={cn(
                            "relative p-2 rounded-lg border-2 transition-all group",
                            style === key
                              ? 'border-primary bg-primary/5 shadow-md'
                              : 'border-border hover:border-primary/50 hover:bg-accent/5'
                          )}
                        >
                          <div
                            className="w-full h-12 rounded mb-1.5 transition-transform group-hover:scale-105"
                            style={{
                              background: `linear-gradient(135deg, ${config.colors.primary} 0%, ${config.colors.accent} 100%)`
                            }}
                          />
                          <div className="text-[10px] font-semibold text-center text-foreground line-clamp-1">
                            {config.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2 flex items-center justify-between">
                <span>Slides Count</span>
                <span className="text-xs text-muted-foreground">Select between 5 and 100</span>
              </label>
              <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-xl border border-border/50">
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={1}
                  value={slideCount}
                  onChange={(e) => setSlideCount(parseInt(e.target.value))}
                  disabled={isGenerating}
                  className="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
                <Badge variant="default" className="text-sm w-16 h-8 justify-center bg-primary font-bold shadow-sm">
                  {slideCount}
                </Badge>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isGenerating}
            className="w-full h-14 text-base font-semibold bg-gradient-to-r from-primary via-accent to-primary hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl disabled:opacity-50"
            style={{ backgroundSize: '200% 100%' }}
            size="lg"
          >
            <Sparkle className="w-5 h-5 mr-2" weight="fill" />
            {isGenerating ? 'Generating...' : 'Generate Presentation with AI'}
          </Button>

          <div className="pt-6 border-t border-border">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Try an example
              </p>
              <Badge variant="outline" className="text-[10px]">
                {examplePrompts.length} ideas
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {examplePrompts.map((example, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleExampleClick(example)}
                  disabled={isGenerating}
                  className="text-left text-sm px-4 py-3 rounded-lg bg-secondary/30 hover:bg-primary/5 text-secondary-foreground transition-all disabled:opacity-50 border border-border/50 hover:border-primary/40 hover:shadow-md group"
                >
                  <span className="line-clamp-2 group-hover:text-primary transition-colors">{example}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
