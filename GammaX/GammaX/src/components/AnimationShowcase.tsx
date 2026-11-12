import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AnimationType } from '@/lib/types'
import { animationConfigs } from '@/lib/animations'
import { Play } from '@phosphor-icons/react'

interface AnimationShowcaseProps {
  onSelect?: (animation: AnimationType) => void
}

export function AnimationShowcase({ onSelect }: AnimationShowcaseProps) {
  const [playingAnimation, setPlayingAnimation] = useState<AnimationType | null>(null)

  const animationCategories: Record<string, AnimationType[]> = {
    'Basic Transitions': ['fade-in', 'slide-up', 'slide-down', 'slide-left', 'slide-right', 'zoom-in', 'zoom-out', 'blur-in', 'reveal'],
    'Rotational': ['rotate-in', 'rotate-360', 'flip', 'flip-x', 'flip-y', 'roll-in', 'roll-out', 'swing'],
    'Bouncy & Elastic': ['bounce', 'bounce-left', 'bounce-right', 'elastic', 'rubber-band', 'jello', 'tada'],
    'Attention Grabbers': ['pulse', 'shake', 'wave', 'glow', 'flash', 'wobble', 'heart-beat'],
    'Advanced Slides': ['slide-rotate', 'slide-fade-up', 'slide-fade-down', 'slide-fade-left', 'slide-fade-right', 'light-speed-in'],
    'Zoom Variants': ['zoom-in-down', 'zoom-in-up', 'zoom-out-down', 'zoom-out-up'],
    '3D Perspective': ['perspective-left', 'perspective-right', 'perspective-down', 'perspective-up', 'fold-down', 'unfold-up'],
    'Special Effects': ['typewriter', 'puff-in', 'puff-out', 'vanish', 'scale-up', 'scale-down']
  }

  const handlePlay = (animation: AnimationType) => {
    setPlayingAnimation(animation)
    setTimeout(() => setPlayingAnimation(null), 2000)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">50 Professional Animations</h2>
        <p className="text-muted-foreground">Smooth, engaging transitions to bring your presentations to life</p>
      </div>

      {Object.entries(animationCategories).map(([category, animations]) => (
        <div key={category}>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-accent rounded-full" />
            {category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {animations.map((animation) => {
              const config = animationConfigs[animation]
              const isPlaying = playingAnimation === animation

              return (
                <Card
                  key={animation}
                  className="p-4 hover:shadow-lg transition-all cursor-pointer group relative"
                  onClick={() => onSelect?.(animation)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm">{config.name}</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePlay(animation)
                      }}
                    >
                      <Play className="w-4 h-4" weight="fill" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">{config.description}</p>
                  
                  <div className="bg-muted/30 rounded-lg h-24 flex items-center justify-center overflow-hidden">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-lg ${
                        isPlaying ? config.css : ''
                      }`}
                    />
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{config.duration}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {animation}
                    </Badge>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
