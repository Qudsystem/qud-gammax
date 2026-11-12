import { useState } from 'react'
import { PresentationVersion, Presentation } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ClockCounterClockwise, 
  CheckCircle, 
  ArrowCounterClockwise,
  FloppyDisk,
  Warning
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface VersionHistoryProps {
  presentation: Presentation
  versions: PresentationVersion[]
  onRestore: (version: PresentationVersion) => void
  onCreateVersion: (changeDescription: string) => void
}

export function VersionHistory({ 
  presentation, 
  versions, 
  onRestore, 
  onCreateVersion 
}: VersionHistoryProps) {
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<PresentationVersion | null>(null)
  const [changeDescription, setChangeDescription] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  const sortedVersions = [...versions].sort((a, b) => b.createdAt - a.createdAt)

  const handleRestoreClick = (version: PresentationVersion) => {
    setSelectedVersion(version)
    setShowRestoreDialog(true)
  }

  const handleRestore = () => {
    if (selectedVersion) {
      onRestore(selectedVersion)
      setShowRestoreDialog(false)
      toast.success(`Restored version ${selectedVersion.version}`)
    }
  }

  const handleSaveVersion = () => {
    if (changeDescription.trim()) {
      onCreateVersion(changeDescription)
      setChangeDescription('')
      setShowSaveDialog(false)
      toast.success('Version saved successfully')
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClockCounterClockwise className="w-5 h-5 text-primary" weight="fill" />
            <h3 className="text-lg font-semibold text-foreground">Version History</h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            {versions.length} versions
          </Badge>
        </div>
        
        <Button 
          onClick={() => setShowSaveDialog(true)}
          className="w-full bg-gradient-to-r from-primary to-accent"
          size="sm"
        >
          <FloppyDisk className="w-4 h-4 mr-2" weight="fill" />
          Save Current Version
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-3">
          <AnimatePresence>
            {sortedVersions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <ClockCounterClockwise className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground mb-2">No version history yet</p>
                <p className="text-xs text-muted-foreground">
                  Save versions to track changes and restore previous states
                </p>
              </motion.div>
            ) : (
              sortedVersions.map((version, index) => {
                const isCurrentVersion = presentation.currentVersion === version.version
                
                return (
                  <motion.div
                    key={version.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isCurrentVersion
                          ? 'border-accent bg-accent/10'
                          : 'border-border hover:border-accent/50 hover:bg-accent/5'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-foreground">
                              Version {version.version}
                            </span>
                            {isCurrentVersion && (
                              <Badge variant="default" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" weight="fill" />
                                Current
                              </Badge>
                            )}
                            {version.isAutoSave && (
                              <Badge variant="outline" className="text-xs">
                                Auto-save
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(version.createdAt)} • {version.createdByName}
                          </p>
                        </div>
                        
                        {!isCurrentVersion && (
                          <Button
                            onClick={() => handleRestoreClick(version)}
                            variant="outline"
                            size="sm"
                            className="shrink-0"
                          >
                            <ArrowCounterClockwise className="w-3 h-3 mr-1.5" />
                            Restore
                          </Button>
                        )}
                      </div>

                      {version.changeDescription && (
                        <p className="text-sm text-foreground mt-2 line-clamp-2">
                          {version.changeDescription}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span>{version.slides.length} slides</span>
                        <Separator orientation="vertical" className="h-3" />
                        <span className="capitalize">{version.style} style</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Warning className="w-5 h-5 text-destructive" weight="fill" />
              Restore Version {selectedVersion?.version}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will replace your current presentation with version {selectedVersion?.version}.
              {' '}Your current changes will be lost unless you save them as a new version first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestore}
              className="bg-destructive hover:bg-destructive/90"
            >
              <ArrowCounterClockwise className="w-4 h-4 mr-2" />
              Restore Version
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save New Version</AlertDialogTitle>
            <AlertDialogDescription>
              Create a restore point with a description of your changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="change-description" className="text-sm font-medium mb-2">
              What changed? (optional)
            </Label>
            <Input
              id="change-description"
              value={changeDescription}
              onChange={(e) => setChangeDescription(e.target.value)}
              placeholder="e.g., Updated color scheme and added new diagrams"
              className="mt-2"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {changeDescription.length}/200 characters
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSaveVersion}
              className="bg-gradient-to-r from-primary to-accent"
            >
              <FloppyDisk className="w-4 h-4 mr-2" weight="fill" />
              Save Version
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
