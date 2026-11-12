import { useState, useMemo } from 'react'
import { MarketplaceTemplate, PresentationStyle } from '@/lib/types'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MagnifyingGlass, 
  Star, 
  DownloadSimple, 
  Sparkle,
  Crown,
  User,
  X,
  Check
} from '@phosphor-icons/react'

interface TemplateMarketplaceProps {
  templates: MarketplaceTemplate[]
  onSelectTemplate: (template: MarketplaceTemplate) => void
  onClose: () => void
}

export function TemplateMarketplace({
  templates,
  onSelectTemplate,
  onClose
}: TemplateMarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [previewTemplate, setPreviewTemplate] = useState<MarketplaceTemplate | null>(null)

  const categories = useMemo(() => {
    const cats = new Set(templates.map(t => t.category))
    return ['all', ...Array.from(cats)]
  }, [templates])

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [templates, searchQuery, selectedCategory])

  const sortedTemplates = useMemo(() => {
    return [...filteredTemplates].sort((a, b) => {
      if (a.isPremium && !b.isPremium) return -1
      if (!a.isPremium && b.isPremium) return 1
      return b.rating - a.rating
    })
  }, [filteredTemplates])

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkle className="w-6 h-6 text-white" weight="fill" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Template Marketplace</h2>
              <p className="text-sm text-muted-foreground">
                {templates.length} professional templates ready to use
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates, tags, or keywords..."
              className="pl-10"
            />
          </div>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mt-4">
          <TabsList className="w-full justify-start overflow-x-auto">
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="capitalize">
                {cat === 'all' ? 'All' : cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1 p-6">
        <AnimatePresence mode="popLayout">
          {sortedTemplates.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <MagnifyingGlass className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No templates found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group">
                    <div 
                      className="relative h-48 bg-gradient-to-br from-muted to-muted/50 rounded-t-lg overflow-hidden"
                      onClick={() => setPreviewTemplate(template)}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-6xl font-bold text-muted-foreground/20">
                          {template.name[0]}
                        </div>
                      </div>
                      {template.isPremium && (
                        <Badge className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-orange-500 border-0">
                          <Crown className="w-3 h-3 mr-1" weight="fill" />
                          Premium
                        </Badge>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" size="sm">
                          Preview
                        </Button>
                      </div>
                    </div>

                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CardTitle className="text-base line-clamp-1">{template.name}</CardTitle>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="w-4 h-4" weight="fill" />
                          <span className="text-xs font-semibold">{template.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <CardDescription className="text-xs line-clamp-2">
                        {template.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1 pb-3">
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {template.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0.5">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <DownloadSimple className="w-3 h-3" />
                          <span>{template.downloads.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{template.author}</span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-0">
                      <Button 
                        className="w-full bg-gradient-to-r from-primary to-accent"
                        onClick={() => onSelectTemplate(template)}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Use Template
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </ScrollArea>

      <Dialog open={previewTemplate !== null} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {previewTemplate && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl flex items-center gap-2">
                      {previewTemplate.name}
                      {previewTemplate.isPremium && (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 border-0">
                          <Crown className="w-3 h-3 mr-1" weight="fill" />
                          Premium
                        </Badge>
                      )}
                    </DialogTitle>
                    <DialogDescription className="mt-2">
                      {previewTemplate.description}
                    </DialogDescription>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-500">
                    <Star className="w-5 h-5" weight="fill" />
                    <span className="text-lg font-bold">{previewTemplate.rating.toFixed(1)}</span>
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="max-h-[50vh] mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <div className="text-xs text-muted-foreground mb-1">Slides</div>
                      <div className="text-2xl font-bold text-foreground">
                        {previewTemplate.slideCount}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <div className="text-xs text-muted-foreground mb-1">Downloads</div>
                      <div className="text-2xl font-bold text-foreground">
                        {previewTemplate.downloads.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {previewTemplate.tags.map(tag => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Style</h4>
                    <Badge variant="outline" className="capitalize">
                      {previewTemplate.style}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Author</h4>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{previewTemplate.author}</span>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="flex items-center gap-3 mt-6">
                <Button 
                  className="flex-1 bg-gradient-to-r from-primary to-accent"
                  onClick={() => {
                    onSelectTemplate(previewTemplate)
                    setPreviewTemplate(null)
                  }}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Use This Template
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setPreviewTemplate(null)}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
