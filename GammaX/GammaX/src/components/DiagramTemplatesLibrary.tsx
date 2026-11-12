import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SmartShape } from '@/components/SmartShape'
import { DiagramData, DiagramType } from '@/lib/types'
import { MagnifyingGlass, Sparkle } from '@phosphor-icons/react'

interface DiagramTemplate {
  id: string
  name: string
  description: string
  category: 'business' | 'tech' | 'education' | 'marketing' | 'project' | 'analysis'
  industry: string
  data: DiagramData
  tags: string[]
}

interface DiagramTemplatesLibraryProps {
  onSelect: (template: DiagramTemplate) => void
  onClose?: () => void
}

export function DiagramTemplatesLibrary({ onSelect, onClose }: DiagramTemplatesLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const templates: DiagramTemplate[] = [
    {
      id: 'business-process',
      name: 'Business Process Flow',
      description: 'Standard business workflow with decision points',
      category: 'business',
      industry: 'General Business',
      tags: ['workflow', 'process', 'operations'],
      data: {
        type: 'flowchart',
        nodes: [
          { id: '1', label: 'Customer Request', type: 'start', position: { x: 400, y: 80 } },
          { id: '2', label: 'Review Request', type: 'process', position: { x: 400, y: 180 } },
          { id: '3', label: 'Approved?', type: 'decision', position: { x: 400, y: 300 } },
          { id: '4', label: 'Process Order', type: 'process', position: { x: 250, y: 420 } },
          { id: '5', label: 'Request Changes', type: 'process', position: { x: 550, y: 420 } },
          { id: '6', label: 'Complete', type: 'end', position: { x: 250, y: 540 } }
        ],
        edges: [
          { id: 'e1', from: '1', to: '2' },
          { id: 'e2', from: '2', to: '3' },
          { id: 'e3', from: '3', to: '4', label: 'Yes' },
          { id: 'e4', from: '3', to: '5', label: 'No' },
          { id: 'e5', from: '4', to: '6' }
        ]
      }
    },
    {
      id: 'saas-architecture',
      name: 'SaaS Architecture',
      description: 'Modern cloud application architecture',
      category: 'tech',
      industry: 'Software',
      tags: ['cloud', 'architecture', 'microservices'],
      data: {
        type: 'network',
        nodes: [
          { id: '1', label: 'Load Balancer', position: { x: 400, y: 100 }, size: 'lg' },
          { id: '2', label: 'API Gateway', position: { x: 400, y: 220 }, size: 'md' },
          { id: '3', label: 'Auth Service', position: { x: 250, y: 350 }, size: 'sm' },
          { id: '4', label: 'User Service', position: { x: 400, y: 350 }, size: 'sm' },
          { id: '5', label: 'Payment Service', position: { x: 550, y: 350 }, size: 'sm' },
          { id: '6', label: 'Database', position: { x: 400, y: 480 }, size: 'md' }
        ],
        edges: [
          { id: 'e1', from: '1', to: '2' },
          { id: 'e2', from: '2', to: '3' },
          { id: 'e3', from: '2', to: '4' },
          { id: 'e4', from: '2', to: '5' },
          { id: 'e5', from: '3', to: '6', type: 'dashed' },
          { id: 'e6', from: '4', to: '6', type: 'dashed' },
          { id: 'e7', from: '5', to: '6', type: 'dashed' }
        ]
      }
    },
    {
      id: 'swot-startup',
      name: 'Startup SWOT Analysis',
      description: 'Strategic analysis for new ventures',
      category: 'business',
      industry: 'Startup',
      tags: ['strategy', 'planning', 'analysis'],
      data: {
        type: 'swot',
        nodes: [
          { id: 's1', label: 'Strong technical team' },
          { id: 's2', label: 'Innovative product' },
          { id: 's3', label: 'Early market entry' },
          { id: 'w1', label: 'Limited funding' },
          { id: 'w2', label: 'Small customer base' },
          { id: 'w3', label: 'Brand awareness' },
          { id: 'o1', label: 'Growing market' },
          { id: 'o2', label: 'AI technology trends' },
          { id: 'o3', label: 'Partnership opportunities' },
          { id: 't1', label: 'Established competitors' },
          { id: 't2', label: 'Economic uncertainty' },
          { id: 't3', label: 'Regulatory changes' }
        ]
      }
    },
    {
      id: 'marketing-funnel',
      name: 'Marketing Funnel',
      description: 'Customer acquisition funnel with metrics',
      category: 'marketing',
      industry: 'Marketing',
      tags: ['conversion', 'sales', 'customer journey'],
      data: {
        type: 'funnel',
        nodes: [
          { id: '1', label: 'Awareness (10,000)' },
          { id: '2', label: 'Interest (5,000)' },
          { id: '3', label: 'Consideration (2,000)' },
          { id: '4', label: 'Intent (500)' },
          { id: '5', label: 'Purchase (200)' }
        ]
      }
    },
    {
      id: 'org-chart-tech',
      name: 'Tech Company Org Chart',
      description: 'Organizational structure for tech companies',
      category: 'business',
      industry: 'Technology',
      tags: ['organization', 'hierarchy', 'team'],
      data: {
        type: 'org-chart',
        nodes: [
          { id: '1', label: 'CEO', position: { x: 400, y: 80 } },
          { id: '2', label: 'CTO', position: { x: 200, y: 200 } },
          { id: '3', label: 'CPO', position: { x: 400, y: 200 } },
          { id: '4', label: 'CMO', position: { x: 600, y: 200 } },
          { id: '5', label: 'Engineering', position: { x: 120, y: 320 } },
          { id: '6', label: 'DevOps', position: { x: 280, y: 320 } },
          { id: '7', label: 'Product', position: { x: 400, y: 320 } },
          { id: '8', label: 'Marketing', position: { x: 600, y: 320 } }
        ],
        edges: [
          { id: 'e1', from: '1', to: '2' },
          { id: 'e2', from: '1', to: '3' },
          { id: 'e3', from: '1', to: '4' },
          { id: 'e4', from: '2', to: '5' },
          { id: 'e5', from: '2', to: '6' },
          { id: 'e6', from: '3', to: '7' },
          { id: 'e7', from: '4', to: '8' }
        ]
      }
    },
    {
      id: 'project-gantt',
      name: 'Software Project Timeline',
      description: 'Gantt chart for software development',
      category: 'project',
      industry: 'Software',
      tags: ['timeline', 'planning', 'milestones'],
      data: {
        type: 'gantt',
        nodes: [
          { id: '1', label: 'Requirements (Week 1-2)' },
          { id: '2', label: 'Design (Week 2-4)' },
          { id: '3', label: 'Development (Week 4-10)' },
          { id: '4', label: 'Testing (Week 10-12)' },
          { id: '5', label: 'Deployment (Week 12-13)' },
          { id: '6', label: 'Launch (Week 13)' }
        ]
      }
    },
    {
      id: 'decision-matrix',
      name: 'Decision Matrix',
      description: 'Prioritization matrix for decisions',
      category: 'analysis',
      industry: 'General Business',
      tags: ['prioritization', 'decision-making', 'strategy'],
      data: {
        type: 'matrix',
        nodes: [
          { id: '1', label: 'Quick Wins (High Impact, Low Effort)' },
          { id: '2', label: 'Strategic (High Impact, High Effort)' },
          { id: '3', label: 'Fill Ins (Low Impact, Low Effort)' },
          { id: '4', label: 'Time Wasters (Low Impact, High Effort)' }
        ]
      }
    },
    {
      id: 'customer-journey',
      name: 'Customer Journey Map',
      description: 'End-to-end customer experience',
      category: 'marketing',
      industry: 'Retail',
      tags: ['customer', 'experience', 'journey'],
      data: {
        type: 'timeline',
        nodes: [
          { id: '1', label: 'Awareness' },
          { id: '2', label: 'Research' },
          { id: '3', label: 'Purchase' },
          { id: '4', label: 'Onboarding' },
          { id: '5', label: 'Engagement' },
          { id: '6', label: 'Advocacy' }
        ]
      }
    },
    {
      id: 'network-topology',
      name: 'Network Topology',
      description: 'IT network infrastructure diagram',
      category: 'tech',
      industry: 'IT',
      tags: ['network', 'infrastructure', 'topology'],
      data: {
        type: 'network',
        nodes: [
          { id: '1', label: 'Router', position: { x: 400, y: 150 }, size: 'lg' },
          { id: '2', label: 'Switch A', position: { x: 250, y: 300 }, size: 'md' },
          { id: '3', label: 'Switch B', position: { x: 550, y: 300 }, size: 'md' },
          { id: '4', label: 'PC 1', position: { x: 150, y: 450 }, size: 'sm' },
          { id: '5', label: 'PC 2', position: { x: 350, y: 450 }, size: 'sm' },
          { id: '6', label: 'Server', position: { x: 550, y: 450 }, size: 'sm' }
        ],
        edges: [
          { id: 'e1', from: '1', to: '2' },
          { id: 'e2', from: '1', to: '3' },
          { id: 'e3', from: '2', to: '4' },
          { id: 'e4', from: '2', to: '5' },
          { id: 'e5', from: '3', to: '6' }
        ]
      }
    },
    {
      id: 'learning-path',
      name: 'Learning Pathway',
      description: 'Educational curriculum structure',
      category: 'education',
      industry: 'Education',
      tags: ['curriculum', 'learning', 'courses'],
      data: {
        type: 'tree',
        nodes: [
          { id: '1', label: 'Web Development', position: { x: 400, y: 100 } },
          { id: '2', label: 'Frontend', position: { x: 250, y: 250 } },
          { id: '3', label: 'Backend', position: { x: 550, y: 250 } },
          { id: '4', label: 'HTML/CSS', position: { x: 150, y: 400 } },
          { id: '5', label: 'JavaScript', position: { x: 300, y: 400 } },
          { id: '6', label: 'React', position: { x: 200, y: 550 } },
          { id: '7', label: 'Node.js', position: { x: 450, y: 400 } },
          { id: '8', label: 'Databases', position: { x: 650, y: 400 } }
        ],
        edges: [
          { id: 'e1', from: '1', to: '2' },
          { id: 'e2', from: '1', to: '3' },
          { id: 'e3', from: '2', to: '4' },
          { id: 'e4', from: '2', to: '5' },
          { id: 'e5', from: '5', to: '6' },
          { id: 'e6', from: '3', to: '7' },
          { id: 'e7', from: '3', to: '8' }
        ]
      }
    },
    {
      id: 'product-roadmap',
      name: 'Product Roadmap',
      description: 'Quarterly product development roadmap',
      category: 'project',
      industry: 'Product Management',
      tags: ['roadmap', 'planning', 'product'],
      data: {
        type: 'timeline',
        nodes: [
          { id: '1', label: 'Q1: MVP Launch' },
          { id: '2', label: 'Q2: Mobile App' },
          { id: '3', label: 'Q3: Analytics Dashboard' },
          { id: '4', label: 'Q4: API Platform' }
        ]
      }
    },
    {
      id: 'value-chain',
      name: 'Value Chain Analysis',
      description: 'Business value creation process',
      category: 'analysis',
      industry: 'Strategy',
      tags: ['value', 'process', 'operations'],
      data: {
        type: 'process',
        nodes: [
          { id: '1', label: 'Inbound Logistics' },
          { id: '2', label: 'Operations' },
          { id: '3', label: 'Outbound Logistics' },
          { id: '4', label: 'Marketing & Sales' },
          { id: '5', label: 'Service' }
        ]
      }
    },
    {
      id: 'agile-sprint',
      name: 'Agile Sprint Cycle',
      description: 'Scrum sprint workflow',
      category: 'project',
      industry: 'Software',
      tags: ['agile', 'scrum', 'sprint'],
      data: {
        type: 'cycle',
        nodes: [
          { id: '1', label: 'Sprint Planning' },
          { id: '2', label: 'Daily Standup' },
          { id: '3', label: 'Development' },
          { id: '4', label: 'Sprint Review' },
          { id: '5', label: 'Retrospective' }
        ]
      }
    },
    {
      id: 'data-pipeline',
      name: 'Data Pipeline',
      description: 'ETL data processing workflow',
      category: 'tech',
      industry: 'Data Engineering',
      tags: ['data', 'pipeline', 'etl'],
      data: {
        type: 'flowchart',
        nodes: [
          { id: '1', label: 'Data Sources', type: 'start', position: { x: 400, y: 80 } },
          { id: '2', label: 'Extract', type: 'process', position: { x: 400, y: 180 } },
          { id: '3', label: 'Transform', type: 'process', position: { x: 400, y: 280 } },
          { id: '4', label: 'Load', type: 'process', position: { x: 400, y: 380 } },
          { id: '5', label: 'Data Warehouse', type: 'end', position: { x: 400, y: 480 } }
        ],
        edges: [
          { id: 'e1', from: '1', to: '2' },
          { id: 'e2', from: '2', to: '3' },
          { id: 'e3', from: '3', to: '4' },
          { id: 'e4', from: '4', to: '5' }
        ]
      }
    },
    {
      id: 'sales-pyramid',
      name: 'Sales Hierarchy',
      description: 'Sales team structure and targets',
      category: 'business',
      industry: 'Sales',
      tags: ['sales', 'hierarchy', 'targets'],
      data: {
        type: 'pyramid',
        nodes: [
          { id: '1', label: 'Enterprise ($10M+)' },
          { id: '2', label: 'Mid-Market ($1M-10M)' },
          { id: '3', label: 'SMB ($100K-1M)' },
          { id: '4', label: 'Self-Service (<$100K)' }
        ]
      }
    },
    {
      id: 'content-strategy',
      name: 'Content Strategy Map',
      description: 'Content marketing ecosystem',
      category: 'marketing',
      industry: 'Content Marketing',
      tags: ['content', 'marketing', 'strategy'],
      data: {
        type: 'mindmap',
        nodes: [
          { id: '1', label: 'Content Hub', position: { x: 400, y: 300 } },
          { id: '2', label: 'Blog Posts', position: { x: 250, y: 200 } },
          { id: '3', label: 'Videos', position: { x: 550, y: 200 } },
          { id: '4', label: 'Social Media', position: { x: 250, y: 400 } },
          { id: '5', label: 'Email', position: { x: 550, y: 400 } },
          { id: '6', label: 'Podcasts', position: { x: 400, y: 480 } }
        ],
        edges: [
          { id: 'e1', from: '1', to: '2' },
          { id: 'e2', from: '1', to: '3' },
          { id: 'e3', from: '1', to: '4' },
          { id: 'e4', from: '1', to: '5' },
          { id: 'e5', from: '1', to: '6' }
        ]
      }
    }
  ]

  const categories = [
    { value: 'all', label: 'All Templates', count: templates.length },
    { value: 'business', label: 'Business', count: templates.filter(t => t.category === 'business').length },
    { value: 'tech', label: 'Technology', count: templates.filter(t => t.category === 'tech').length },
    { value: 'marketing', label: 'Marketing', count: templates.filter(t => t.category === 'marketing').length },
    { value: 'project', label: 'Project', count: templates.filter(t => t.category === 'project').length },
    { value: 'education', label: 'Education', count: templates.filter(t => t.category === 'education').length },
    { value: 'analysis', label: 'Analysis', count: templates.filter(t => t.category === 'analysis').length }
  ]

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      template.industry.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkle className="w-6 h-6 text-accent" weight="fill" />
            <h2 className="text-2xl font-bold">Diagram Templates</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Industry-specific diagram templates ready to customize
          </p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search templates by name, industry, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {categories.map(cat => (
            <TabsTrigger key={cat.value} value={cat.value} className="gap-2">
              {cat.label}
              <Badge variant="secondary" className="text-xs">
                {cat.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredTemplates.length === 0 ? (
            <Card className="p-12 text-center">
              <MagnifyingGlass className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold text-lg mb-2">No templates found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or select a different category
              </p>
            </Card>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pr-4">
                {filteredTemplates.map(template => (
                  <Card
                    key={template.id}
                    className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => onSelect(template)}
                  >
                    <div className="bg-muted/30 h-48 flex items-center justify-center p-4 group-hover:bg-muted/50 transition-colors">
                      <SmartShape data={template.data} className="scale-75" />
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold mb-1 group-hover:text-accent transition-colors">
                          {template.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {template.industry}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {template.data.nodes.length} nodes
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
