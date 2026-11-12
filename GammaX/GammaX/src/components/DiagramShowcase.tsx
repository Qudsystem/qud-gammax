import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SmartShape } from '@/components/SmartShape'
import { DiagramData, DiagramType } from '@/lib/types'

interface DiagramShowcaseProps {
  onSelect?: (type: DiagramType) => void
}

export function DiagramShowcase({ onSelect }: DiagramShowcaseProps) {
  const diagramExamples: { type: DiagramType; label: string; category: string; data: DiagramData }[] = [
    {
      type: 'flowchart',
      label: 'Flowchart',
      category: 'Flow & Process',
      data: {
        type: 'flowchart',
        nodes: [
          { id: '1', label: 'Start', type: 'start', position: { x: 400, y: 80 } },
          { id: '2', label: 'Process', type: 'process', position: { x: 400, y: 180 } },
          { id: '3', label: 'Decision?', type: 'decision', position: { x: 400, y: 300 } },
          { id: '4', label: 'End', type: 'end', position: { x: 400, y: 450 } }
        ],
        edges: [
          { id: 'e1', from: '1', to: '2' },
          { id: 'e2', from: '2', to: '3' },
          { id: 'e3', from: '3', to: '4', label: 'Yes' }
        ]
      }
    },
    {
      type: 'network',
      label: 'Network Diagram',
      category: 'Relational',
      data: {
        type: 'network',
        nodes: [
          { id: '1', label: 'Hub', position: { x: 400, y: 300 }, size: 'lg' },
          { id: '2', label: 'Node A', position: { x: 250, y: 200 } },
          { id: '3', label: 'Node B', position: { x: 550, y: 200 } },
          { id: '4', label: 'Node C', position: { x: 250, y: 400 } },
          { id: '5', label: 'Node D', position: { x: 550, y: 400 } }
        ],
        edges: [
          { id: 'e1', from: '1', to: '2' },
          { id: 'e2', from: '1', to: '3' },
          { id: 'e3', from: '1', to: '4' },
          { id: 'e4', from: '1', to: '5' }
        ]
      }
    },
    {
      type: 'matrix',
      label: 'Matrix (2x2)',
      category: 'Analytical',
      data: {
        type: 'matrix',
        nodes: [
          { id: '1', label: 'Quick Wins' },
          { id: '2', label: 'Strategic' },
          { id: '3', label: 'Fill Ins' },
          { id: '4', label: 'Hard Slog' }
        ]
      }
    },
    {
      type: 'swot',
      label: 'SWOT Analysis',
      category: 'Analytical',
      data: {
        type: 'swot',
        nodes: [
          { id: '1', label: 'Strong team' },
          { id: '2', label: 'Innovation' },
          { id: '3', label: 'Market gap' },
          { id: '4', label: 'Limited budget' },
          { id: '5', label: 'New market' },
          { id: '6', label: 'AI trends' },
          { id: '7', label: 'Competition' },
          { id: '8', label: 'Regulation' }
        ]
      }
    },
    {
      type: 'org-chart',
      label: 'Org Chart',
      category: 'Hierarchical',
      data: {
        type: 'org-chart',
        nodes: [
          { id: '1', label: 'CEO', position: { x: 400, y: 80 } },
          { id: '2', label: 'CTO', position: { x: 250, y: 200 } },
          { id: '3', label: 'CFO', position: { x: 550, y: 200 } },
          { id: '4', label: 'Dev Team', position: { x: 250, y: 350 } }
        ],
        edges: [
          { id: 'e1', from: '1', to: '2' },
          { id: 'e2', from: '1', to: '3' },
          { id: 'e3', from: '2', to: '4' }
        ]
      }
    },
    {
      type: 'timeline',
      label: 'Timeline',
      category: 'Temporal',
      data: {
        type: 'timeline',
        nodes: [
          { id: '1', label: 'Q1' },
          { id: '2', label: 'Q2' },
          { id: '3', label: 'Q3' },
          { id: '4', label: 'Q4' }
        ]
      }
    },
    {
      type: 'gantt',
      label: 'Gantt Chart',
      category: 'Temporal',
      data: {
        type: 'gantt',
        nodes: [
          { id: '1', label: 'Planning' },
          { id: '2', label: 'Development' },
          { id: '3', label: 'Testing' },
          { id: '4', label: 'Launch' }
        ]
      }
    },
    {
      type: 'funnel',
      label: 'Funnel',
      category: 'Cyclic',
      data: {
        type: 'funnel',
        nodes: [
          { id: '1', label: 'Awareness' },
          { id: '2', label: 'Interest' },
          { id: '3', label: 'Decision' },
          { id: '4', label: 'Action' }
        ]
      }
    },
    {
      type: 'pyramid',
      label: 'Pyramid',
      category: 'Hierarchical',
      data: {
        type: 'pyramid',
        nodes: [
          { id: '1', label: 'Vision' },
          { id: '2', label: 'Strategy' },
          { id: '3', label: 'Tactics' },
          { id: '4', label: 'Operations' }
        ]
      }
    },
    {
      type: 'cycle',
      label: 'Cycle',
      category: 'Cyclic',
      data: {
        type: 'cycle',
        nodes: [
          { id: '1', label: 'Plan' },
          { id: '2', label: 'Do' },
          { id: '3', label: 'Check' },
          { id: '4', label: 'Act' }
        ]
      }
    },
    {
      type: 'mindmap',
      label: 'Mindmap',
      category: 'Relational',
      data: {
        type: 'mindmap',
        nodes: [
          { id: '1', label: 'Core Idea', position: { x: 400, y: 300 } },
          { id: '2', label: 'Branch A', position: { x: 250, y: 200 } },
          { id: '3', label: 'Branch B', position: { x: 550, y: 200 } },
          { id: '4', label: 'Branch C', position: { x: 250, y: 400 } }
        ],
        edges: [
          { id: 'e1', from: '1', to: '2' },
          { id: 'e2', from: '1', to: '3' },
          { id: 'e3', from: '1', to: '4' }
        ]
      }
    },
    {
      type: 'venn',
      label: 'Venn Diagram',
      category: 'Analytical',
      data: {
        type: 'venn',
        nodes: [
          { id: '1', label: 'Set A' },
          { id: '2', label: 'Set B' },
          { id: '3', label: 'Set C' }
        ]
      }
    },
    {
      type: 'tree',
      label: 'Tree Structure',
      category: 'Hierarchical',
      data: {
        type: 'tree',
        nodes: [
          { id: '1', label: 'Root', position: { x: 400, y: 100 } },
          { id: '2', label: 'Child 1', position: { x: 250, y: 250 } },
          { id: '3', label: 'Child 2', position: { x: 550, y: 250 } },
          { id: '4', label: 'Leaf A', position: { x: 200, y: 400 } },
          { id: '5', label: 'Leaf B', position: { x: 300, y: 400 } }
        ],
        edges: [
          { id: 'e1', from: '1', to: '2' },
          { id: 'e2', from: '1', to: '3' },
          { id: 'e3', from: '2', to: '4' },
          { id: 'e4', from: '2', to: '5' }
        ]
      }
    }
  ]

  const categories = Array.from(new Set(diagramExamples.map(d => d.category)))

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">13+ Smart Diagram Types</h2>
        <p className="text-muted-foreground">Professional diagrams automatically generated from your content</p>
      </div>

      {categories.map((category) => (
        <div key={category}>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full" />
            {category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diagramExamples
              .filter(d => d.category === category)
              .map((diagram) => (
                <Card
                  key={diagram.type}
                  className="p-4 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => onSelect?.(diagram.type)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{diagram.label}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {diagram.type}
                    </Badge>
                  </div>
                  <div className="bg-muted/30 rounded-lg overflow-hidden h-48 flex items-center justify-center group-hover:bg-muted/50 transition-colors">
                    <SmartShape data={diagram.data} className="scale-75" />
                  </div>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
