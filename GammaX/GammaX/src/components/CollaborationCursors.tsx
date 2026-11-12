import { motion, AnimatePresence } from 'framer-motion'
import { Collaborator } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'

interface CollaborationCursorsProps {
  collaborators: Collaborator[]
  currentSlideId: string
}

export function CollaborationCursors({ collaborators, currentSlideId }: CollaborationCursorsProps) {
  const [activeCursors, setActiveCursors] = useState<Collaborator[]>([])
  
  useEffect(() => {
    const now = Date.now()
    const activeCollaborators = collaborators.filter(
      c => c.cursor?.slideId === currentSlideId && 
           c.cursor.x !== undefined && 
           (now - c.lastSeen) < 3000
    )
    
    setActiveCursors(activeCollaborators.slice(0, 10))
  }, [collaborators, currentSlideId])

  const overflowCount = collaborators.filter(
    c => c.cursor?.slideId === currentSlideId && 
         c.cursor.x !== undefined &&
         (Date.now() - c.lastSeen) < 3000
  ).length - 10

  return (
    <>
      <AnimatePresence mode="popLayout">
        {activeCursors.map((collaborator) => {
          if (!collaborator.cursor) return null
          
          return (
            <motion.div
              key={collaborator.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: `${collaborator.cursor.x}%`,
                y: `${collaborator.cursor.y}%`,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ 
                duration: 0.2,
                x: { type: 'spring', stiffness: 300, damping: 30 },
                y: { type: 'spring', stiffness: 300, damping: 30 }
              }}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                pointerEvents: 'none',
                zIndex: 9999,
                willChange: 'transform',
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                }}
              >
                <path
                  d="M3 3L3 17L9 11L13 17L15 16L11 10L17 10L3 3Z"
                  fill={collaborator.color}
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                  position: 'absolute',
                  top: 22,
                  left: 10,
                  backgroundColor: collaborator.color,
                  color: 'white',
                  padding: '3px 7px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                  maxWidth: '120px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {collaborator.login}
              </motion.div>
            </motion.div>
          )
        })}
      </AnimatePresence>
      
      {overflowCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-4 right-4 z-[10000]"
        >
          <Badge variant="secondary" className="text-xs px-3 py-1.5 shadow-lg">
            +{overflowCount} more {overflowCount === 1 ? 'cursor' : 'cursors'}
          </Badge>
        </motion.div>
      )}
    </>
  )
}
