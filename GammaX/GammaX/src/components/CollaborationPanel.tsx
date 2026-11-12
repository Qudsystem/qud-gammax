import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ShareSettings, Collaborator, Presentation } from '@/lib/types'
import { UserPlus, Link as LinkIcon, Eye, PencilSimple, Copy, Check, Users } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface CollaborationPanelProps {
  presentation: Presentation
  onUpdate: (updates: Partial<Presentation>) => void
}

const COLLABORATOR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
]

export function CollaborationPanel({ presentation, onUpdate }: CollaborationPanelProps) {
  const [user] = useState(() => window.spark.user())
  const [shareSettings, setShareSettings] = useState<ShareSettings>(
    presentation.shareSettings || {
      isShared: false,
      accessType: 'view',
      allowComments: false,
    }
  )
  const [shareId, setShareId] = useState<string>(presentation.shareSettings?.shareId || '')
  const [copied, setCopied] = useState(false)
  const [collaborators, setCollaborators] = useState<Collaborator[]>(presentation.collaborators || [])
  const [activeCollaborators, setActiveCollaborators] = useState<Collaborator[]>([])

  const [sharedPresentations, setSharedPresentations] = useKV<Record<string, Presentation>>('shared-presentations', {})

  useEffect(() => {
    user.then(userData => {
      if (!userData) return

      const updatePresence = () => {
        if (shareSettings.isShared && shareId) {
          const now = Date.now()
          const updatedCollaborators = collaborators.filter(c => now - c.lastSeen < 300000)
          
          const existingIndex = updatedCollaborators.findIndex(c => c.id === userData.id.toString())
          if (existingIndex >= 0) {
            updatedCollaborators[existingIndex] = {
              ...updatedCollaborators[existingIndex],
              lastSeen: now,
            }
          } else {
            updatedCollaborators.push({
              id: userData.id.toString(),
              login: userData.login,
              avatarUrl: userData.avatarUrl,
              lastSeen: now,
              color: COLLABORATOR_COLORS[updatedCollaborators.length % COLLABORATOR_COLORS.length],
            })
          }

          setCollaborators(updatedCollaborators)
          setActiveCollaborators(updatedCollaborators.filter(c => now - c.lastSeen < 60000))
          
          onUpdate({ collaborators: updatedCollaborators })
        }
      }

      updatePresence()
      const interval = setInterval(updatePresence, 30000)
      return () => clearInterval(interval)
    })
  }, [shareSettings.isShared, shareId])

  const generateShareId = () => {
    return `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  const enableSharing = async () => {
    const newShareId = generateShareId()
    const newSettings: ShareSettings = {
      ...shareSettings,
      isShared: true,
      shareId: newShareId,
    }

    setShareSettings(newSettings)
    setShareId(newShareId)
    onUpdate({ shareSettings: newSettings })

    setSharedPresentations((current) => ({
      ...current,
      [newShareId]: {
        ...presentation,
        shareSettings: newSettings,
      }
    }))

    toast.success('Sharing enabled')
  }

  const disableSharing = () => {
    const newSettings: ShareSettings = {
      ...shareSettings,
      isShared: false,
      shareId: undefined,
    }

    setShareSettings(newSettings)
    onUpdate({ shareSettings: newSettings })

    if (shareId) {
      setSharedPresentations((current) => {
        const updated = { ...current }
        delete updated[shareId]
        return updated
      })
    }

    setCollaborators([])
    setActiveCollaborators([])
    toast.success('Sharing disabled')
  }

  const updateAccessType = (accessType: 'view' | 'edit') => {
    const newSettings = { ...shareSettings, accessType }
    setShareSettings(newSettings)
    onUpdate({ shareSettings: newSettings })

    if (shareId) {
      setSharedPresentations((current) => ({
        ...current,
        [shareId]: {
          ...presentation,
          shareSettings: newSettings,
        }
      }))
    }

    toast.success(`Access changed to ${accessType}`)
  }

  const toggleComments = (allowComments: boolean) => {
    const newSettings = { ...shareSettings, allowComments }
    setShareSettings(newSettings)
    onUpdate({ shareSettings: newSettings })

    if (shareId) {
      setSharedPresentations((current) => ({
        ...current,
        [shareId]: {
          ...presentation,
          shareSettings: newSettings,
        }
      }))
    }
  }

  const copyShareLink = () => {
    const shareLink = `${window.location.origin}?share=${shareId}`
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Link copied to clipboard')
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" weight="bold" />
            Collaboration & Sharing
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Share and collaborate in real-time
          </p>
        </div>
        {activeCollaborators.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {activeCollaborators.length} active
          </Badge>
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="enable-sharing" className="text-sm font-medium">
              Enable Sharing
            </Label>
            <p className="text-xs text-muted-foreground">
              Allow others to view or edit this presentation
            </p>
          </div>
          <Switch
            id="enable-sharing"
            checked={shareSettings.isShared}
            onCheckedChange={(checked) => checked ? enableSharing() : disableSharing()}
          />
        </div>

        {shareSettings.isShared && shareId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="share-link" className="text-sm font-medium">
                Share Link
              </Label>
              <div className="flex gap-2">
                <Input
                  id="share-link"
                  value={`${window.location.origin}?share=${shareId}`}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button onClick={copyShareLink} variant="outline" size="sm">
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="access-type" className="text-sm font-medium">
                Access Type
              </Label>
              <Select
                value={shareSettings.accessType}
                onValueChange={(value: 'view' | 'edit') => updateAccessType(value)}
              >
                <SelectTrigger id="access-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span>View Only</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="edit">
                    <div className="flex items-center gap-2">
                      <PencilSimple className="w-4 h-4" />
                      <span>Can Edit</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="allow-comments" className="text-sm font-medium">
                  Allow Comments
                </Label>
                <p className="text-xs text-muted-foreground">
                  Let viewers leave comments on slides
                </p>
              </div>
              <Switch
                id="allow-comments"
                checked={shareSettings.allowComments}
                onCheckedChange={toggleComments}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Active Collaborators ({activeCollaborators.length})
              </Label>
              {activeCollaborators.length > 0 ? (
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {activeCollaborators.map((collaborator) => (
                      <motion.div
                        key={collaborator.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/5 transition-colors"
                      >
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={collaborator.avatarUrl} alt={collaborator.login} />
                            <AvatarFallback style={{ backgroundColor: collaborator.color }}>
                              {getInitials(collaborator.login)}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-green-500"
                            title="Active now"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">
                            {collaborator.login}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Active now
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{ borderColor: collaborator.color, color: collaborator.color }}
                        >
                          {collaborator.currentSlide !== undefined
                            ? `Slide ${collaborator.currentSlide + 1}`
                            : 'Viewing'}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <UserPlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No active collaborators yet</p>
                  <p className="text-xs mt-1">Share the link to invite others</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t border-border">
        <p>• Enable sharing to generate a unique share link</p>
        <p>• Choose between view-only or full edit access</p>
        <p>• See who's viewing or editing in real-time</p>
        <p>• Collaborator presence updates every 30 seconds</p>
      </div>
    </Card>
  )
}
