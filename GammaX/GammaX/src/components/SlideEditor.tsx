import { useState } from 'react'
import { Slide, PresentationStyle, AnimationType, SlideLayout } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PencilSimple, Check, X, FlowArrow, Clock, Sparkle } from '@phosphor-icons/react'
import { DiagramEditor } from '@/components/DiagramEditor'
import { AnimationTimingControls } from '@/components/AnimationTimingControls'
import { DiagramTemplatesLibrary } from '@/components/DiagramTemplatesLibrary'
import { improveContentClarity, suggestVisualElements } from '@/lib/aiEnhancements'

interface SlideEditorProps {
  slide: Slide
  style: PresentationStyle
  onSave: (updatedSlide: Slide) => void
  onCancel: () => void
}

export function SlideEditor({ slide, style, onSave, onCancel }: SlideEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedSlide, setEditedSlide] = useState<Slide>(slide)
  const [showTemplates, setShowTemplates] = useState(false)
  const [isAiWorking, setIsAiWorking] = useState(false)

  const handleSave = () => {
    onSave(editedSlide)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedSlide(slide)
    setIsEditing(false)
    onCancel()
  }

  const updateContent = (index: number, value: string) => {
    const newContent = [...editedSlide.content]
    newContent[index] = value
    setEditedSlide({ ...editedSlide, content: newContent })
  }

  const addContentItem = () => {
    setEditedSlide({
      ...editedSlide,
      content: [...editedSlide.content, '']
    })
  }

  const removeContentItem = (index: number) => {
    setEditedSlide({
      ...editedSlide,
      content: editedSlide.content.filter((_, i) => i !== index)
    })
  }

  if (!isEditing) {
    return (
      <div className="relative group">
        <Button
          onClick={() => setIsEditing(true)}
          variant="outline"
          size="sm"
          className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <PencilSimple className="w-4 h-4 mr-2" />
          Edit Slide
        </Button>
      </div>
    )
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Edit Slide</h3>
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} size="sm" className="bg-primary">
            <Check className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button onClick={handleCancel} size="sm" variant="outline">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">
            <PencilSimple className="w-4 h-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="diagram" disabled={!editedSlide.diagram}>
            <FlowArrow className="w-4 h-4 mr-2" />
            Diagram
          </TabsTrigger>
          <TabsTrigger value="animation">
            <Clock className="w-4 h-4 mr-2" />
            Animation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="slide-layout">Layout</Label>
              <select
                id="slide-layout"
                className="mt-2 border rounded-md h-9 px-2 w-full bg-background"
                value={editedSlide.layout}
                onChange={(e) => setEditedSlide({ ...editedSlide, layout: e.target.value as SlideLayout })}
              >
                {[
                  'title','content','bullets','two-column','quote',
                  'image-text','full-image','split-image','flowchart','timeline','org-chart'
                ].map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button
                disabled={isAiWorking}
                onClick={async () => {
                  setIsAiWorking(true)
                  try {
                    const improved = await improveContentClarity(editedSlide.content)
                    setEditedSlide({ ...editedSlide, content: improved })
                  } finally {
                    setIsAiWorking(false)
                  }
                }}
                size="sm"
                className="bg-primary"
              >
                <Sparkle className="w-4 h-4 mr-2" weight="fill" />
                AI: Improve Clarity
              </Button>
              <Button
                disabled={isAiWorking}
                variant="outline"
                size="sm"
                onClick={async () => {
                  setIsAiWorking(true)
                  try {
                    const rec = await suggestVisualElements(editedSlide)
                    const updates: Partial<Slide> = {}
                    if (rec.shouldHaveImage && rec.imagePrompt && !editedSlide.imageUrl) {
                      updates.imagePrompt = rec.imagePrompt
                    }
                    if (rec.shouldHaveDiagram && rec.diagramType && !editedSlide.diagram) {
                      updates.diagram = { type: rec.diagramType as any, nodes: [] }
                    }
                    setEditedSlide({ ...editedSlide, ...updates })
                  } finally {
                    setIsAiWorking(false)
                  }
                }}
              >
                <Sparkle className="w-4 h-4 mr-2" weight="fill" />
                AI: Suggest Visuals
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="slide-title">Slide Title</Label>
            <Input
              id="slide-title"
              value={editedSlide.title}
              onChange={(e) => setEditedSlide({ ...editedSlide, title: e.target.value })}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Content Items</Label>
            <div className="space-y-3 mt-2">
              {editedSlide.content.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Textarea
                    value={item}
                    onChange={(e) => updateContent(index, e.target.value)}
                    className="flex-1 min-h-[80px]"
                    placeholder={`Content item ${index + 1}`}
                  />
                  <Button
                    onClick={() => removeContentItem(index)}
                    variant="outline"
                    size="icon"
                    className="flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                onClick={addContentItem}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Add Content Item
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="slide-notes">Speaker Notes (Optional)</Label>
            <Textarea
              id="slide-notes"
              value={editedSlide.notes || ''}
              onChange={(e) => setEditedSlide({ ...editedSlide, notes: e.target.value })}
              className="mt-2 min-h-[100px]"
              placeholder="Add notes for this slide..."
            />
          </div>

          <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Sparkle className="w-4 h-4 mr-2" weight="fill" />
                Add Diagram from Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Diagram Templates</DialogTitle>
              </DialogHeader>
              <DiagramTemplatesLibrary
                onSelect={(template) => {
                  setEditedSlide({
                    ...editedSlide,
                    diagram: template.data,
                    layout: template.data.type as any
                  })
                  setShowTemplates(false)
                }}
                onClose={() => setShowTemplates(false)}
              />
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="diagram" className="mt-6">
          {editedSlide.diagram ? (
            <DiagramEditor
              data={editedSlide.diagram}
              onChange={(newDiagram) => setEditedSlide({ ...editedSlide, diagram: newDiagram })}
            />
          ) : (
            <Card className="p-12 text-center">
              <FlowArrow className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold mb-2">No Diagram</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This slide doesn't have a diagram yet
              </p>
              <Button onClick={() => setShowTemplates(true)}>
                <Sparkle className="w-4 h-4 mr-2" weight="fill" />
                Add from Templates
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="animation" className="mt-6">
          <AnimationTimingControls
            currentAnimation={editedSlide.animation || 'fade-in'}
            currentDuration={editedSlide.animationDelay}
            currentDelay={0}
            currentEasing="ease-out"
            onAnimationChange={(animation: AnimationType) => 
              setEditedSlide({ ...editedSlide, animation })
            }
            onDurationChange={(duration) => 
              setEditedSlide({ ...editedSlide, animationDelay: duration })
            }
            onDelayChange={(delay) => {}}
            onEasingChange={(easing) => {}}
          />
        </TabsContent>
      </Tabs>
    </Card>
  )
}
