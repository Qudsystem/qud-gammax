import { Presentation } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PresentationChart, Trash, Calendar, Sparkle } from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'

interface PresentationListProps {
  presentations: Presentation[]
  onSelect: (presentation: Presentation) => void
  onDelete: (id: string) => void
  selectedId?: string
}

export function PresentationList({ presentations, onSelect, onDelete, selectedId }: PresentationListProps) {
  if (presentations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16 text-muted-foreground"
      >
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <PresentationChart className="w-10 h-10 opacity-50" />
        </div>
        <p className="text-base font-medium">No presentations yet</p>
        <p className="text-sm mt-1">Create your first presentation to get started</p>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {presentations.map((presentation, index) => (
        <motion.div
          key={presentation.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card
            className={`group p-5 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 ${
              selectedId === presentation.id
                ? 'ring-2 ring-accent border-accent bg-accent/5'
                : 'border-border hover:border-accent/50'
            }`}
            onClick={() => onSelect(presentation)}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                <Sparkle className="w-5 h-5 text-white" weight="fill" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(presentation.id)
                }}
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>

            <h3 className="font-semibold text-base text-foreground mb-2 line-clamp-2">
              {presentation.title}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {presentation.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {presentation.slides.length} slides
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">
                  {presentation.style}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDistanceToNow(presentation.updatedAt, { addSuffix: true })}</span>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
