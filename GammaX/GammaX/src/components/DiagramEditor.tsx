import { useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { SmartShape } from '@/components/SmartShape'
import { DiagramData, DiagramNode, DiagramEdge } from '@/lib/types'
import { Plus, Trash, ArrowsLeftRight, Palette } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface DiagramEditorProps {
  data: DiagramData
  onChange: (data: DiagramData) => void
  onClose?: () => void
}

export function DiagramEditor({ data, onChange, onClose }: DiagramEditorProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)

  const selectedNode = selectedNodeId ? data.nodes.find(n => n.id === selectedNodeId) : null
  const selectedEdge = selectedEdgeId ? data.edges?.find(e => e.id === selectedEdgeId) : null

  const handleAddNode = useCallback(() => {
    const newNode: DiagramNode = {
      id: `node-${Date.now()}`,
      label: 'New Node',
      type: 'process',
      position: { x: 400, y: 300 },
      size: 'md'
    }
    
    onChange({
      ...data,
      nodes: [...data.nodes, newNode]
    })
    
    setSelectedNodeId(newNode.id)
    toast.success('Node added')
  }, [data, onChange])

  const handleDeleteNode = useCallback((nodeId: string) => {
    onChange({
      ...data,
      nodes: data.nodes.filter(n => n.id !== nodeId),
      edges: data.edges?.filter(e => e.from !== nodeId && e.to !== nodeId)
    })
    
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null)
    }
    toast.success('Node deleted')
  }, [data, onChange, selectedNodeId])

  const handleUpdateNode = useCallback((nodeId: string, updates: Partial<DiagramNode>) => {
    onChange({
      ...data,
      nodes: data.nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n)
    })
  }, [data, onChange])

  const handleAddEdge = useCallback(() => {
    if (data.nodes.length < 2) {
      toast.error('Add at least 2 nodes first')
      return
    }

    const newEdge: DiagramEdge = {
      id: `edge-${Date.now()}`,
      from: data.nodes[0].id,
      to: data.nodes[1].id,
      type: 'solid'
    }
    
    onChange({
      ...data,
      edges: [...(data.edges || []), newEdge]
    })
    
    setSelectedEdgeId(newEdge.id)
    toast.success('Connection added')
  }, [data, onChange])

  const handleDeleteEdge = useCallback((edgeId: string) => {
    onChange({
      ...data,
      edges: data.edges?.filter(e => e.id !== edgeId)
    })
    
    if (selectedEdgeId === edgeId) {
      setSelectedEdgeId(null)
    }
    toast.success('Connection deleted')
  }, [data, onChange, selectedEdgeId])

  const handleUpdateEdge = useCallback((edgeId: string, updates: Partial<DiagramEdge>) => {
    onChange({
      ...data,
      edges: data.edges?.map(e => e.id === edgeId ? { ...e, ...updates } : e)
    })
  }, [data, onChange])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_280px] gap-6 h-[600px]">
      <Card className="p-4 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">Nodes ({data.nodes.length})</h3>
          <Button size="sm" onClick={handleAddNode}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {data.nodes.map((node) => (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedNodeId === node.id
                    ? 'border-accent bg-accent/10'
                    : 'border-border hover:border-accent/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm truncate">{node.label}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteNode(node.id)
                    }}
                  >
                    <Trash className="w-3 h-3" />
                  </Button>
                </div>
                <Badge variant="outline" className="text-xs">
                  {node.type || 'custom'}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>

        {data.edges && (
          <>
            <Separator className="my-4" />
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Connections ({data.edges.length})</h3>
              <Button size="sm" variant="outline" onClick={handleAddEdge}>
                <ArrowsLeftRight className="w-4 h-4" />
              </Button>
            </div>
            
            <ScrollArea className="max-h-32">
              <div className="space-y-2">
                {data.edges.map((edge) => (
                  <div
                    key={edge.id}
                    onClick={() => setSelectedEdgeId(edge.id)}
                    className={`p-2 rounded border cursor-pointer text-xs ${
                      selectedEdgeId === edge.id
                        ? 'border-accent bg-accent/10'
                        : 'border-border hover:border-accent/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">
                        {data.nodes.find(n => n.id === edge.from)?.label} → {data.nodes.find(n => n.id === edge.to)?.label}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteEdge(edge.id)
                        }}
                      >
                        <Trash className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </Card>

      <Card className="p-6 flex items-center justify-center bg-muted/20">
        <div className="w-full h-full flex items-center justify-center">
          <SmartShape data={data} className="max-w-full max-h-full" />
        </div>
      </Card>

      <Card className="p-4 overflow-hidden">
        <ScrollArea className="h-full">
          {selectedNode && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Edit Node</h3>
                <Palette className="w-4 h-4 text-muted-foreground" />
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Label</Label>
                  <Input
                    value={selectedNode.label}
                    onChange={(e) => handleUpdateNode(selectedNode.id, { label: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={selectedNode.type || 'custom'}
                    onValueChange={(value) => handleUpdateNode(selectedNode.id, { type: value as any })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="start">Start</SelectItem>
                      <SelectItem value="end">End</SelectItem>
                      <SelectItem value="process">Process</SelectItem>
                      <SelectItem value="decision">Decision</SelectItem>
                      <SelectItem value="data">Data</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Size</Label>
                  <Select
                    value={selectedNode.size || 'md'}
                    onValueChange={(value) => handleUpdateNode(selectedNode.id, { size: value as any })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">Small</SelectItem>
                      <SelectItem value="md">Medium</SelectItem>
                      <SelectItem value="lg">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedNode.position && (
                  <>
                    <div>
                      <Label className="text-xs">X Position</Label>
                      <Input
                        type="number"
                        value={selectedNode.position.x}
                        onChange={(e) => handleUpdateNode(selectedNode.id, {
                          position: { ...selectedNode.position!, x: parseInt(e.target.value) || 0 }
                        })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Y Position</Label>
                      <Input
                        type="number"
                        value={selectedNode.position.y}
                        onChange={(e) => handleUpdateNode(selectedNode.id, {
                          position: { ...selectedNode.position!, y: parseInt(e.target.value) || 0 }
                        })}
                        className="mt-1"
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label className="text-xs">Color</Label>
                  <Input
                    type="text"
                    value={selectedNode.color || ''}
                    onChange={(e) => handleUpdateNode(selectedNode.id, { color: e.target.value })}
                    placeholder="e.g., #FF5733 or oklch(...)"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedEdge && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Edit Connection</h3>
                <ArrowsLeftRight className="w-4 h-4 text-muted-foreground" />
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs">From</Label>
                  <Select
                    value={selectedEdge.from}
                    onValueChange={(value) => handleUpdateEdge(selectedEdge.id, { from: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {data.nodes.map(node => (
                        <SelectItem key={node.id} value={node.id}>
                          {node.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">To</Label>
                  <Select
                    value={selectedEdge.to}
                    onValueChange={(value) => handleUpdateEdge(selectedEdge.id, { to: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {data.nodes.map(node => (
                        <SelectItem key={node.id} value={node.id}>
                          {node.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Label</Label>
                  <Input
                    value={selectedEdge.label || ''}
                    onChange={(e) => handleUpdateEdge(selectedEdge.id, { label: e.target.value })}
                    placeholder="Optional label"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs">Line Type</Label>
                  <Select
                    value={selectedEdge.type || 'solid'}
                    onValueChange={(value) => handleUpdateEdge(selectedEdge.id, { type: value as any })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="dashed">Dashed</SelectItem>
                      <SelectItem value="dotted">Dotted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Color</Label>
                  <Input
                    type="text"
                    value={selectedEdge.color || ''}
                    onChange={(e) => handleUpdateEdge(selectedEdge.id, { color: e.target.value })}
                    placeholder="e.g., #FF5733"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {!selectedNode && !selectedEdge && (
            <div className="h-full flex items-center justify-center text-center p-4">
              <div className="text-muted-foreground text-sm">
                <Palette className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Select a node or connection to edit its properties</p>
              </div>
            </div>
          )}
        </ScrollArea>

        {onClose && (
          <>
            <Separator className="my-4" />
            <Button onClick={onClose} className="w-full">
              Done Editing
            </Button>
          </>
        )}
      </Card>
    </div>
  )
}
