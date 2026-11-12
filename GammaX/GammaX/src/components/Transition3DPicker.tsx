import { useState } from 'react'
import { TransitionEffect3D, Transition3DConfig } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Cube, 
  ArrowsClockwise,
  Door,
  Cards,
  FileText,
  Book,
  Rows,
  Tag,
  Folders,
  Stack,
  Waves,
  Spiral
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface Transition3DPickerProps {
  currentTransition?: Transition3DConfig
  onTransitionChange: (transition: Transition3DConfig) => void
  onClose?: () => void
}

const transition3DEffects: { 
  effect: TransitionEffect3D
  name: string
  description: string
  icon: React.ReactNode
  category: 'rotate' | 'flip' | 'depth' | 'creative'
}[] = [
  {
    effect: 'cube-rotate',
    name: 'Cube Rotate',
    description: '3D cube rotation between slides',
    icon: <Cube weight="fill" />,
    category: 'rotate'
  },
  {
    effect: 'flip-3d',
    name: '3D Flip',
    description: 'Card flip with depth perspective',
    icon: <ArrowsClockwise weight="fill" />,
    category: 'flip'
  },
  {
    effect: 'door-swing',
    name: 'Door Swing',
    description: 'Slides open like swinging doors',
    icon: <Door weight="fill" />,
    category: 'rotate'
  },
  {
    effect: 'carousel-3d',
    name: '3D Carousel',
    description: 'Circular carousel transition',
    icon: <Cards weight="fill" />,
    category: 'rotate'
  },
  {
    effect: 'page-curl',
    name: 'Page Curl',
    description: 'Page peeling effect with shadow',
    icon: <FileText weight="fill" />,
    category: 'creative'
  },
  {
    effect: 'book-flip',
    name: 'Book Flip',
    description: 'Book-style page turn',
    icon: <Book weight="fill" />,
    category: 'flip'
  },
  {
    effect: 'cover-flow',
    name: 'Cover Flow',
    description: 'Apple Cover Flow style transition',
    icon: <Rows weight="fill" />,
    category: 'depth'
  },
  {
    effect: 'ribbon-3d',
    name: '3D Ribbon',
    description: 'Ribbon unwrapping effect',
    icon: <Tag weight="fill" />,
    category: 'creative'
  },
  {
    effect: 'fold-3d',
    name: '3D Fold',
    description: 'Accordion fold transition',
    icon: <Folders weight="fill" />,
    category: 'depth'
  },
  {
    effect: 'cascade',
    name: 'Cascade',
    description: 'Cascading depth layers',
    icon: <Stack weight="fill" />,
    category: 'depth'
  },
  {
    effect: 'wave-3d',
    name: '3D Wave',
    description: 'Wave distortion effect',
    icon: <Waves weight="fill" />,
    category: 'creative'
  },
  {
    effect: 'spiral-3d',
    name: '3D Spiral',
    description: 'Spiral zoom transition',
    icon: <Spiral weight="fill" />,
    category: 'creative'
  }
]

const easingOptions = [
  { value: 'linear', label: 'Linear' },
  { value: 'ease', label: 'Ease' },
  { value: 'ease-in', label: 'Ease In' },
  { value: 'ease-out', label: 'Ease Out' },
  { value: 'ease-in-out', label: 'Ease In-Out' },
  { value: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', label: 'Bounce' },
]

export function Transition3DPicker({ 
  currentTransition, 
  onTransitionChange,
  onClose 
}: Transition3DPickerProps) {
  const [selectedEffect, setSelectedEffect] = useState<TransitionEffect3D>(
    currentTransition?.effect || 'cube-rotate'
  )
  const [duration, setDuration] = useState(currentTransition?.duration || 1000)
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | 'down'>(
    currentTransition?.direction || 'left'
  )
  const [parallaxIntensity, setParallaxIntensity] = useState(
    currentTransition?.parallaxIntensity || 50
  )
  const [perspective, setPerspective] = useState(
    currentTransition?.perspective || 1000
  )
  const [easing, setEasing] = useState(currentTransition?.easing || 'ease-in-out')
  const [activeCategory, setActiveCategory] = useState<'rotate' | 'flip' | 'depth' | 'creative'>('rotate')

  const handleApply = () => {
    const config: Transition3DConfig = {
      effect: selectedEffect,
      duration,
      direction,
      parallaxIntensity,
      perspective,
      easing
    }
    onTransitionChange(config)
    onClose?.()
  }

  const categoryEffects = transition3DEffects.filter(e => e.category === activeCategory)

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          3D Slide Transitions
        </h3>
        <p className="text-sm text-muted-foreground">
          Add stunning 3D effects with parallax scrolling
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <div>
            <Label className="text-sm font-semibold mb-3 block">Transition Effect</Label>
            <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as any)}>
              <TabsList className="grid grid-cols-4 w-full mb-4">
                <TabsTrigger value="rotate">Rotate</TabsTrigger>
                <TabsTrigger value="flip">Flip</TabsTrigger>
                <TabsTrigger value="depth">Depth</TabsTrigger>
                <TabsTrigger value="creative">Creative</TabsTrigger>
              </TabsList>

              <TabsContent value={activeCategory}>
                <div className="grid grid-cols-2 gap-3">
                  {categoryEffects.map((transition) => {
                    const isSelected = selectedEffect === transition.effect
                    
                    return (
                      <motion.button
                        key={transition.effect}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedEffect(transition.effect)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          isSelected
                            ? 'border-accent bg-accent/10'
                            : 'border-border hover:border-accent/50 hover:bg-accent/5'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
                          }`}>
                            {transition.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-foreground mb-1">
                              {transition.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {transition.description}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 flex items-center justify-between">
                Duration
                <Badge variant="secondary" className="text-xs">
                  {duration}ms
                </Badge>
              </Label>
              <Slider
                value={[duration]}
                onValueChange={([value]) => setDuration(value)}
                min={300}
                max={3000}
                step={100}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Fast (300ms)</span>
                <span>Slow (3000ms)</span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Direction</Label>
              <div className="grid grid-cols-4 gap-2">
                {(['left', 'right', 'up', 'down'] as const).map((dir) => (
                  <Button
                    key={dir}
                    variant={direction === dir ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDirection(dir)}
                    className="capitalize"
                  >
                    {dir}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 flex items-center justify-between">
                Parallax Intensity
                <Badge variant="secondary" className="text-xs">
                  {parallaxIntensity}%
                </Badge>
              </Label>
              <Slider
                value={[parallaxIntensity]}
                onValueChange={([value]) => setParallaxIntensity(value)}
                min={0}
                max={100}
                step={5}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Subtle</span>
                <span>Dramatic</span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 flex items-center justify-between">
                Perspective Depth
                <Badge variant="secondary" className="text-xs">
                  {perspective}px
                </Badge>
              </Label>
              <Slider
                value={[perspective]}
                onValueChange={([value]) => setPerspective(value)}
                min={500}
                max={2000}
                step={100}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Shallow</span>
                <span>Deep</span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Easing Function</Label>
              <Select value={easing} onValueChange={setEasing}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {easingOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <h4 className="text-sm font-semibold text-foreground mb-2">Preview Tips</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Use arrow keys to navigate slides in presentation mode</li>
              <li>• Longer durations work better for complex 3D effects</li>
              <li>• Higher parallax creates more dramatic depth</li>
              <li>• Perspective affects the 3D viewing angle</li>
            </ul>
          </div>
        </div>
      </ScrollArea>

      <div className="p-6 border-t border-border flex gap-3">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleApply}
          className="flex-1 bg-gradient-to-r from-primary to-accent"
        >
          Apply Transition
        </Button>
      </div>
    </div>
  )
}
