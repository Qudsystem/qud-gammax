import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Collaborator } from '@/lib/types'

interface CollaboratorSimulatorProps {
  onUpdateCursors: (cursors: Collaborator[]) => void
  currentSlideId: string
}

export function CollaboratorSimulator({ onUpdateCursors, currentSlideId }: CollaboratorSimulatorProps) {
  const [isSimulating, setIsSimulating] = useState(false)
  const [demoCollaborators] = useState<Collaborator[]>([
    {
      id: 'demo-1',
      login: 'Alex_Dev',
      avatarUrl: '',
      lastSeen: Date.now(),
      currentSlide: currentSlideId,
      color: '#EF4444',
      cursor: { x: 10, y: 10, slideId: currentSlideId }
    },
    {
      id: 'demo-2',
      login: 'Taylor_PM',
      avatarUrl: '',
      lastSeen: Date.now(),
      currentSlide: currentSlideId,
      color: '#F59E0B',
      cursor: { x: 50, y: 50, slideId: currentSlideId }
    },
    {
      id: 'demo-3',
      login: 'Jordan_Designer',
      avatarUrl: '',
      lastSeen: Date.now(),
      currentSlide: currentSlideId,
      color: '#3B82F6',
      cursor: { x: 75, y: 25, slideId: currentSlideId }
    }
  ])

  useEffect(() => {
    if (!isSimulating) {
      onUpdateCursors([])
      return
    }

    const interval = setInterval(() => {
      const updated = demoCollaborators.map(user => ({
        ...user,
        cursor: {
          x: Math.random() * 100,
          y: Math.random() * 100,
          slideId: currentSlideId
        }
      }))
      onUpdateCursors(updated)
    }, 2000)

    return () => clearInterval(interval)
  }, [isSimulating, currentSlideId, demoCollaborators, onUpdateCursors])

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Collaborator Simulator</h3>
        <Button
          size="sm"
          variant={isSimulating ? "destructive" : "default"}
          onClick={() => setIsSimulating(!isSimulating)}
        >
          {isSimulating ? 'Stop' : 'Start'}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Simulate {demoCollaborators.length} demo collaborators with animated cursors
      </p>
      {isSimulating && (
        <div className="mt-3 flex gap-2 flex-wrap">
          {demoCollaborators.map((c) => (
            <div key={c.id} className="flex items-center gap-1.5 text-xs">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="text-muted-foreground">{c.login}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
