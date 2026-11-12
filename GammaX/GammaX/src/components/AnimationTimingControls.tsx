import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AnimationType } from '@/lib/types'
import { animationConfigs } from '@/lib/animations'
import { Clock, Play, SlidersHorizontal } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface AnimationTimingControlsProps {
  currentAnimation: AnimationType
  currentDuration?: number
  currentDelay?: number
  currentEasing?: string
  onAnimationChange: (animation: AnimationType) => void
  onDurationChange: (duration: number) => void
  onDelayChange: (delay: number) => void
  onEasingChange: (easing: string) => void
}

export function AnimationTimingControls({
  currentAnimation,
  currentDuration,
  currentDelay = 0,
  currentEasing,
  onAnimationChange,
  onDurationChange,
  onDelayChange,
  onEasingChange
}: AnimationTimingControlsProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)

  const config = animationConfigs[currentAnimation]
  const duration = currentDuration || parseFloat(config.duration) * 1000
  const easing = currentEasing || config.easing

  const easingOptions = [
    { value: 'linear', label: 'Linear' },
    { value: 'ease', label: 'Ease' },
    { value: 'ease-in', label: 'Ease In' },
    { value: 'ease-out', label: 'Ease Out' },
    { value: 'ease-in-out', label: 'Ease In Out' },
    { value: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', label: 'Bounce' },
    { value: 'cubic-bezier(0.34, 1.56, 0.64, 1)', label: 'Elastic' },
    { value: 'steps(4, end)', label: 'Steps (4)' },
    { value: 'steps(10, end)', label: 'Steps (10)' }
  ]

  const handlePreview = () => {
    setShowPreview(false)
    setTimeout(() => {
      setShowPreview(true)
      setPreviewKey(prev => prev + 1)
    }, 50)
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-accent" />
            <h3 className="font-semibold">Animation Timing</h3>
          </div>
          <Button size="sm" variant="outline" onClick={handlePreview}>
            <Play className="w-4 h-4 mr-2" weight="fill" />
            Preview
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Fine-tune animation duration, delay, and easing
        </p>
      </div>

      <Card className="p-6 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Duration</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={duration}
                onChange={(e) => onDurationChange(parseInt(e.target.value) || 300)}
                className="w-20 h-8 text-xs"
                min={0}
                max={5000}
                step={100}
              />
              <span className="text-xs text-muted-foreground">ms</span>
            </div>
          </div>
          <Slider
            value={[duration]}
            onValueChange={([value]) => onDurationChange(value)}
            min={100}
            max={5000}
            step={100}
            className="mb-1"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>100ms</span>
            <span className="text-accent font-medium">{duration}ms</span>
            <span>5s</span>
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Delay</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={currentDelay}
                onChange={(e) => onDelayChange(parseInt(e.target.value) || 0)}
                className="w-20 h-8 text-xs"
                min={0}
                max={3000}
                step={100}
              />
              <span className="text-xs text-muted-foreground">ms</span>
            </div>
          </div>
          <Slider
            value={[currentDelay]}
            onValueChange={([value]) => onDelayChange(value)}
            min={0}
            max={3000}
            step={100}
            className="mb-1"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0ms</span>
            <span className="text-accent font-medium">{currentDelay}ms</span>
            <span>3s</span>
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-sm font-medium mb-2 block">Easing Function</Label>
          <Select value={easing} onValueChange={onEasingChange}>
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
          <p className="text-xs text-muted-foreground mt-2">
            Controls the acceleration curve of the animation
          </p>
        </div>

        <Separator />

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium">Total Time</Label>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <Badge variant="secondary" className="text-xs font-mono">
                {((duration + currentDelay) / 1000).toFixed(2)}s
              </Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Combined duration and delay time
          </p>
        </div>
      </Card>

      {showPreview && (
        <Card className="p-8 bg-muted/30">
          <div className="flex items-center justify-center min-h-[200px]">
            <motion.div
              key={previewKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: duration / 1000,
                delay: currentDelay / 1000
              }}
              className="w-full max-w-md"
            >
              <Card className={`p-6 ${config.css}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Play className="w-6 h-6 text-primary" weight="fill" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{config.name}</h4>
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-muted rounded-full w-full" />
                  <div className="h-2 bg-muted rounded-full w-3/4" />
                  <div className="h-2 bg-muted rounded-full w-1/2" />
                </div>
              </Card>
            </motion.div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Animation: {config.name} • Duration: {duration}ms • Delay: {currentDelay}ms
          </p>
        </Card>
      )}

      <Card className="p-4 bg-accent/5 border-accent/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Clock className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h4 className="font-medium text-sm mb-1">Timing Tips</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Use 150-300ms for quick interactions</li>
              <li>• Use 300-600ms for page transitions</li>
              <li>• Use 600-1000ms for attention-grabbing effects</li>
              <li>• Add delays (100-200ms) for staggered animations</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
