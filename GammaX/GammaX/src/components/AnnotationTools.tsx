import { useState, useRef, useEffect } from 'react'
import { Annotation } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { 
  PencilSimple, 
  ArrowRight, 
  Circle, 
  Rectangle, 
  Minus,
  Highlighter,
  TextT,
  Eraser,
  Palette,
  X
} from '@phosphor-icons/react'

type AnnotationTool = 'arrow' | 'circle' | 'rectangle' | 'line' | 'freehand' | 'text' | 'highlight' | 'eraser'

interface AnnotationToolsProps {
  slideId: string
  annotations: Annotation[]
  onAddAnnotation: (annotation: Annotation) => void
  onDeleteAnnotation: (annotationId: string) => void
  canvasWidth: number
  canvasHeight: number
  currentUser: string
}

const ANNOTATION_COLORS = [
  { name: 'Red', value: 'oklch(0.63 0.26 25)' },
  { name: 'Orange', value: 'oklch(0.70 0.20 50)' },
  { name: 'Yellow', value: 'oklch(0.85 0.18 90)' },
  { name: 'Green', value: 'oklch(0.65 0.20 150)' },
  { name: 'Blue', value: 'oklch(0.55 0.22 250)' },
  { name: 'Purple', value: 'oklch(0.60 0.24 300)' },
  { name: 'Pink', value: 'oklch(0.70 0.22 340)' },
  { name: 'White', value: 'oklch(0.95 0 0)' },
  { name: 'Black', value: 'oklch(0.20 0 0)' }
]

export function AnnotationTools({
  slideId,
  annotations,
  onAddAnnotation,
  onDeleteAnnotation,
  canvasWidth,
  canvasHeight,
  currentUser
}: AnnotationToolsProps) {
  const [activeTool, setActiveTool] = useState<AnnotationTool | null>(null)
  const [currentColor, setCurrentColor] = useState(ANNOTATION_COLORS[0].value)
  const [strokeWidth, setStrokeWidth] = useState(3)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([])
  const [tempAnnotation, setTempAnnotation] = useState<Partial<Annotation> | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      annotations.filter(a => a.slideId === slideId).forEach(annotation => {
        ctx.strokeStyle = annotation.color
        ctx.fillStyle = annotation.color
        ctx.lineWidth = annotation.strokeWidth || 3
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        switch (annotation.type) {
          case 'arrow':
            if (annotation.endPosition) {
              drawArrow(ctx, annotation.position, annotation.endPosition)
            }
            break
          case 'line':
            if (annotation.endPosition) {
              ctx.beginPath()
              ctx.moveTo(annotation.position.x, annotation.position.y)
              ctx.lineTo(annotation.endPosition.x, annotation.endPosition.y)
              ctx.stroke()
            }
            break
          case 'circle':
            if (annotation.size) {
              ctx.beginPath()
              const radius = Math.min(annotation.size.width, annotation.size.height) / 2
              ctx.arc(
                annotation.position.x + radius,
                annotation.position.y + radius,
                radius,
                0,
                2 * Math.PI
              )
              ctx.stroke()
            }
            break
          case 'rectangle':
          case 'highlight':
            if (annotation.size) {
              if (annotation.type === 'highlight') {
                ctx.globalAlpha = 0.3
                ctx.fillRect(
                  annotation.position.x,
                  annotation.position.y,
                  annotation.size.width,
                  annotation.size.height
                )
                ctx.globalAlpha = 1
              } else {
                ctx.strokeRect(
                  annotation.position.x,
                  annotation.position.y,
                  annotation.size.width,
                  annotation.size.height
                )
              }
            }
            break
          case 'freehand':
            if (annotation.points && annotation.points.length > 1) {
              ctx.beginPath()
              ctx.moveTo(annotation.points[0].x, annotation.points[0].y)
              for (let i = 1; i < annotation.points.length; i++) {
                ctx.lineTo(annotation.points[i].x, annotation.points[i].y)
              }
              ctx.stroke()
            }
            break
          case 'text':
            if (annotation.content) {
              ctx.font = '16px Inter, sans-serif'
              ctx.fillStyle = annotation.color
              ctx.fillText(annotation.content, annotation.position.x, annotation.position.y)
            }
            break
        }
      })

      if (tempAnnotation && isDrawing) {
        ctx.strokeStyle = currentColor
        ctx.fillStyle = currentColor
        ctx.lineWidth = strokeWidth
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        if (tempAnnotation.type === 'arrow' && tempAnnotation.position && tempAnnotation.endPosition) {
          drawArrow(ctx, tempAnnotation.position, tempAnnotation.endPosition)
        } else if (tempAnnotation.type === 'line' && tempAnnotation.position && tempAnnotation.endPosition) {
          ctx.beginPath()
          ctx.moveTo(tempAnnotation.position.x, tempAnnotation.position.y)
          ctx.lineTo(tempAnnotation.endPosition.x, tempAnnotation.endPosition.y)
          ctx.stroke()
        } else if ((tempAnnotation.type === 'circle' || tempAnnotation.type === 'rectangle' || tempAnnotation.type === 'highlight') && tempAnnotation.size && tempAnnotation.position) {
          if (tempAnnotation.type === 'circle') {
            ctx.beginPath()
            const radius = Math.min(tempAnnotation.size.width, tempAnnotation.size.height) / 2
            ctx.arc(
              tempAnnotation.position.x + radius,
              tempAnnotation.position.y + radius,
              radius,
              0,
              2 * Math.PI
            )
            ctx.stroke()
          } else {
            if (tempAnnotation.type === 'highlight') {
              ctx.globalAlpha = 0.3
              ctx.fillRect(
                tempAnnotation.position.x,
                tempAnnotation.position.y,
                tempAnnotation.size.width,
                tempAnnotation.size.height
              )
              ctx.globalAlpha = 1
            } else {
              ctx.strokeRect(
                tempAnnotation.position.x,
                tempAnnotation.position.y,
                tempAnnotation.size.width,
                tempAnnotation.size.height
              )
            }
          }
        } else if (tempAnnotation.type === 'freehand' && tempAnnotation.points && tempAnnotation.points.length > 1) {
          ctx.beginPath()
          ctx.moveTo(tempAnnotation.points[0].x, tempAnnotation.points[0].y)
          for (let i = 1; i < tempAnnotation.points.length; i++) {
            ctx.lineTo(tempAnnotation.points[i].x, tempAnnotation.points[i].y)
          }
          ctx.stroke()
        }
      }
    }
  }, [annotations, slideId, tempAnnotation, isDrawing, currentColor, strokeWidth])

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    from: { x: number; y: number },
    to: { x: number; y: number }
  ) => {
    const headLength = 15
    const angle = Math.atan2(to.y - from.y, to.x - from.x)

    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(to.x, to.y)
    ctx.lineTo(
      to.x - headLength * Math.cos(angle - Math.PI / 6),
      to.y - headLength * Math.sin(angle - Math.PI / 6)
    )
    ctx.moveTo(to.x, to.y)
    ctx.lineTo(
      to.x - headLength * Math.cos(angle + Math.PI / 6),
      to.y - headLength * Math.sin(angle + Math.PI / 6)
    )
    ctx.stroke()
  }

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeTool || activeTool === 'eraser') return

    const point = getCanvasPoint(e)
    setIsDrawing(true)
    setStartPoint(point)

    if (activeTool === 'freehand') {
      setCurrentPoints([point])
      setTempAnnotation({
        type: 'freehand',
        points: [point]
      })
    } else if (activeTool === 'text') {
      const text = prompt('Enter text:')
      if (text) {
        const newAnnotation: Annotation = {
          id: `annotation-${Date.now()}`,
          slideId,
          type: 'text',
          position: point,
          color: currentColor,
          content: text,
          createdBy: currentUser,
          createdAt: Date.now()
        }
        onAddAnnotation(newAnnotation)
      }
      setActiveTool(null)
    } else {
      setTempAnnotation({
        type: activeTool,
        position: point
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint || !activeTool) return

    const point = getCanvasPoint(e)

    if (activeTool === 'freehand') {
      const newPoints = [...currentPoints, point]
      setCurrentPoints(newPoints)
      setTempAnnotation({
        type: 'freehand',
        points: newPoints
      })
    } else if (activeTool === 'arrow' || activeTool === 'line') {
      setTempAnnotation({
        type: activeTool,
        position: startPoint,
        endPosition: point
      })
    } else if (activeTool === 'circle' || activeTool === 'rectangle' || activeTool === 'highlight') {
      const width = point.x - startPoint.x
      const height = point.y - startPoint.y
      setTempAnnotation({
        type: activeTool,
        position: startPoint,
        size: { width: Math.abs(width), height: Math.abs(height) }
      })
    }
  }

  const handleMouseUp = () => {
    if (!isDrawing || !tempAnnotation || !activeTool) return

    const newAnnotation: Annotation = {
      id: `annotation-${Date.now()}`,
      slideId,
      type: tempAnnotation.type as Annotation['type'],
      position: tempAnnotation.position!,
      endPosition: tempAnnotation.endPosition,
      size: tempAnnotation.size,
      points: tempAnnotation.points,
      color: currentColor,
      strokeWidth,
      createdBy: currentUser,
      createdAt: Date.now()
    }

    onAddAnnotation(newAnnotation)

    setIsDrawing(false)
    setStartPoint(null)
    setCurrentPoints([])
    setTempAnnotation(null)
  }

  const handleClearAll = () => {
    if (confirm('Clear all annotations on this slide?')) {
      annotations
        .filter(a => a.slideId === slideId)
        .forEach(a => onDeleteAnnotation(a.id))
    }
  }

  const handleEraserClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'eraser') return

    const point = getCanvasPoint(e)
    const clickRadius = 20

    const clickedAnnotation = annotations
      .filter(a => a.slideId === slideId)
      .find(a => {
        const dx = a.position.x - point.x
        const dy = a.position.y - point.y
        return Math.sqrt(dx * dx + dy * dy) < clickRadius
      })

    if (clickedAnnotation) {
      onDeleteAnnotation(clickedAnnotation.id)
    }
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground">Annotation Tools</h4>
          {activeTool && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTool(null)}
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeTool === 'freehand' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool('freehand')}
          >
            <PencilSimple className="w-4 h-4" />
          </Button>
          <Button
            variant={activeTool === 'arrow' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool('arrow')}
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            variant={activeTool === 'line' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool('line')}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button
            variant={activeTool === 'circle' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool('circle')}
          >
            <Circle className="w-4 h-4" />
          </Button>
          <Button
            variant={activeTool === 'rectangle' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool('rectangle')}
          >
            <Rectangle className="w-4 h-4" />
          </Button>
          <Button
            variant={activeTool === 'highlight' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool('highlight')}
          >
            <Highlighter className="w-4 h-4" />
          </Button>
          <Button
            variant={activeTool === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool('text')}
          >
            <TextT className="w-4 h-4" />
          </Button>
          <Button
            variant={activeTool === 'eraser' ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => setActiveTool('eraser')}
          >
            <Eraser className="w-4 h-4" />
          </Button>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Color</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <div 
                    className="w-4 h-4 rounded border border-border"
                    style={{ backgroundColor: currentColor }}
                  />
                  <Palette className="w-3 h-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="grid grid-cols-3 gap-2">
                  {ANNOTATION_COLORS.map(color => (
                    <button
                      key={color.name}
                      onClick={() => setCurrentColor(color.value)}
                      className="w-full aspect-square rounded border-2 transition-all hover:scale-110"
                      style={{ 
                        backgroundColor: color.value,
                        borderColor: currentColor === color.value ? 'oklch(0.50 0.22 280)' : 'transparent'
                      }}
                      title={color.name}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Stroke Width</span>
              <span className="text-xs text-muted-foreground">{strokeWidth}px</span>
            </div>
            <Slider
              value={[strokeWidth]}
              onValueChange={(value) => setStrokeWidth(value[0])}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        <Separator />

        <Button
          variant="destructive"
          size="sm"
          onClick={handleClearAll}
          className="w-full"
          disabled={annotations.filter(a => a.slideId === slideId).length === 0}
        >
          Clear All Annotations
        </Button>

        <div ref={containerRef} className="relative">
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="absolute inset-0 w-full h-full pointer-events-auto cursor-crosshair"
            style={{ 
              cursor: activeTool ? 'crosshair' : 'default',
              pointerEvents: activeTool ? 'auto' : 'none'
            }}
            onMouseDown={(e) => {
              handleMouseDown(e)
              if (activeTool === 'eraser') {
                handleEraserClick(e)
              }
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
      </div>
    </Card>
  )
}
