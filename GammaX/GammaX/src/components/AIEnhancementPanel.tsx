import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import {
  Sparkle,
  ArrowsClockwise,
  TextAlignLeft,
  Image as ImageIcon,
  ChartLine,
  FileText,
  Brain,
  Target,
  ListChecks,
  Lightbulb
} from '@phosphor-icons/react'
import { Presentation, Slide } from '@/lib/types'
import {
  analyzeSlideStructure,
  expandSlideContent,
  generateSpeakerNotes,
  optimizeSlideTitle,
  suggestVisualElements,
  improveContentClarity,
  analyzeAudienceLevel,
  generateExecutiveSummary,
  AIRestructureSuggestion
} from '@/lib/aiEnhancements'

interface AIEnhancementPanelProps {
  presentation: Presentation
  currentSlideIndex: number
  onApplyEnhancement: (type: string, data: any) => void
  onClose: () => void
}

export function AIEnhancementPanel({
  presentation,
  currentSlideIndex,
  onApplyEnhancement,
  onClose
}: AIEnhancementPanelProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('structure')
  const [restructureSuggestions, setRestructureSuggestions] = useState<AIRestructureSuggestion[]>([])
  const [expandedContent, setExpandedContent] = useState<string[]>([])
  const [speakerNotes, setSpeakerNotes] = useState('')
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([])
  const [visualSuggestions, setVisualSuggestions] = useState<any>(null)
  const [clarityImprovements, setClarityImprovements] = useState<string[]>([])
  const [audienceAnalysis, setAudienceAnalysis] = useState<any>(null)
  const [execSummary, setExecSummary] = useState('')
  const [progress, setProgress] = useState(0)

  const currentSlide = presentation.slides[currentSlideIndex]

  const handleAnalyzeStructure = async () => {
    setLoading(true)
    setProgress(0)
    try {
      const interval = setInterval(() => {
        setProgress(p => Math.min(p + 10, 90))
      }, 200)

      const suggestions = await analyzeSlideStructure(presentation)
      clearInterval(interval)
      setProgress(100)
      setRestructureSuggestions(suggestions)
      toast.success(`Found ${suggestions.length} structural improvements`)
    } catch (error) {
      toast.error('Failed to analyze structure')
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  const handleExpandContent = async () => {
    setLoading(true)
    setProgress(0)
    try {
      const interval = setInterval(() => {
        setProgress(p => Math.min(p + 15, 90))
      }, 300)

      const expansion = await expandSlideContent(currentSlide, presentation.description)
      clearInterval(interval)
      setProgress(100)
      setExpandedContent(expansion.expandedContent)
      toast.success('Content expanded successfully')
    } catch (error) {
      toast.error('Failed to expand content')
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  const handleGenerateNotes = async () => {
    setLoading(true)
    setProgress(0)
    try {
      const interval = setInterval(() => {
        setProgress(p => Math.min(p + 12, 90))
      }, 250)

      const notes = await generateSpeakerNotes(currentSlide)
      clearInterval(interval)
      setProgress(100)
      setSpeakerNotes(notes)
      toast.success('Speaker notes generated')
    } catch (error) {
      toast.error('Failed to generate notes')
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  const handleOptimizeTitle = async () => {
    setLoading(true)
    setProgress(0)
    try {
      const interval = setInterval(() => {
        setProgress(p => Math.min(p + 20, 90))
      }, 200)

      const titles = await optimizeSlideTitle(currentSlide)
      clearInterval(interval)
      setProgress(100)
      setTitleSuggestions(titles)
      toast.success('Title alternatives generated')
    } catch (error) {
      toast.error('Failed to optimize title')
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  const handleSuggestVisuals = async () => {
    setLoading(true)
    setProgress(0)
    try {
      const interval = setInterval(() => {
        setProgress(p => Math.min(p + 15, 90))
      }, 300)

      const suggestions = await suggestVisualElements(currentSlide)
      clearInterval(interval)
      setProgress(100)
      setVisualSuggestions(suggestions)
      toast.success('Visual recommendations generated')
    } catch (error) {
      toast.error('Failed to suggest visuals')
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  const handleImproveClarity = async () => {
    setLoading(true)
    setProgress(0)
    try {
      const interval = setInterval(() => {
        setProgress(p => Math.min(p + 18, 90))
      }, 250)

      const improved = await improveContentClarity(currentSlide.content)
      clearInterval(interval)
      setProgress(100)
      setClarityImprovements(improved)
      toast.success('Content clarity improved')
    } catch (error) {
      toast.error('Failed to improve clarity')
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  const handleAnalyzeAudience = async () => {
    setLoading(true)
    setProgress(0)
    try {
      const interval = setInterval(() => {
        setProgress(p => Math.min(p + 10, 90))
      }, 300)

      const analysis = await analyzeAudienceLevel(presentation)
      clearInterval(interval)
      setProgress(100)
      setAudienceAnalysis(analysis)
      toast.success('Audience analysis complete')
    } catch (error) {
      toast.error('Failed to analyze audience')
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  const handleGenerateExecSummary = async () => {
    setLoading(true)
    setProgress(0)
    try {
      const interval = setInterval(() => {
        setProgress(p => Math.min(p + 12, 90))
      }, 300)

      const summary = await generateExecutiveSummary(presentation)
      clearInterval(interval)
      setProgress(100)
      setExecSummary(summary)
      toast.success('Executive summary generated')
    } catch (error) {
      toast.error('Failed to generate summary')
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Brain weight="fill" className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Enhancement Suite</h2>
              <p className="text-sm text-muted-foreground">Intelligent content optimization powered by AI</p>
            </div>
          </div>
        </div>
        
        {loading && (
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">Processing... {progress}%</p>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-6 pt-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="structure" className="text-xs">
              <ArrowsClockwise className="w-4 h-4 mr-1" />
              Structure
            </TabsTrigger>
            <TabsTrigger value="content" className="text-xs">
              <TextAlignLeft className="w-4 h-4 mr-1" />
              Content
            </TabsTrigger>
            <TabsTrigger value="visuals" className="text-xs">
              <ImageIcon className="w-4 h-4 mr-1" />
              Visuals
            </TabsTrigger>
            <TabsTrigger value="analysis" className="text-xs">
              <ChartLine className="w-4 h-4 mr-1" />
              Analysis
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6">
            <TabsContent value="structure" className="mt-0 space-y-4">
              <Card className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ArrowsClockwise weight="fill" className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Slide Structure Analysis</h3>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleAnalyzeStructure}
                    disabled={loading}
                  >
                    <Sparkle className="w-4 h-4 mr-2" weight="fill" />
                    Analyze
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Get AI recommendations for improving your presentation structure, flow, and organization.
                </p>

                <AnimatePresence>
                  {restructureSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 mt-4"
                    >
                      {restructureSuggestions.map((suggestion, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="p-3 bg-accent/5 border-accent/20">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <Badge variant="secondary" className="text-xs">
                                {suggestion.type}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-xs"
                              >
                                {Math.round(suggestion.confidence * 100)}% confidence
                              </Badge>
                            </div>
                            <p className="text-sm font-medium mb-2">{suggestion.reason}</p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() => {
                                onApplyEnhancement('restructure', suggestion)
                                toast.success('Suggestion applied')
                              }}
                            >
                              Apply Suggestion
                            </Button>
                          </Card>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="mt-0 space-y-4">
              <Card className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TextAlignLeft weight="fill" className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Expand Content</h3>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleExpandContent}
                    disabled={loading}
                  >
                    <Sparkle className="w-4 h-4 mr-2" weight="fill" />
                    Expand
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Add depth and detail to slide "{currentSlide.title}"
                </p>

                {expandedContent.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase">Expanded Version:</h4>
                    <div className="space-y-2">
                      {expandedContent.map((item, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-muted/30 rounded">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5" />
                          <p className="text-sm flex-1">{item}</p>
                        </div>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={() => {
                        onApplyEnhancement('expand-content', { slideId: currentSlide.id, content: expandedContent })
                        toast.success('Content applied')
                      }}
                    >
                      Apply to Slide
                    </Button>
                  </div>
                )}
              </Card>

              <Card className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ListChecks weight="fill" className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Improve Clarity</h3>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleImproveClarity}
                    disabled={loading}
                  >
                    <Sparkle className="w-4 h-4 mr-2" weight="fill" />
                    Improve
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Make content more concise and impactful
                </p>

                {clarityImprovements.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Before:</h4>
                        <div className="space-y-1">
                          {currentSlide.content.map((item, i) => (
                            <p key={i} className="text-xs text-muted-foreground">• {item}</p>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-primary uppercase mb-2">After:</h4>
                        <div className="space-y-1">
                          {clarityImprovements.map((item, i) => (
                            <p key={i} className="text-xs font-medium">• {item}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={() => {
                        onApplyEnhancement('improve-clarity', { slideId: currentSlide.id, content: clarityImprovements })
                        toast.success('Improvements applied')
                      }}
                    >
                      Apply Improvements
                    </Button>
                  </div>
                )}
              </Card>

              <Card className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText weight="fill" className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Generate Speaker Notes</h3>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleGenerateNotes}
                    disabled={loading}
                  >
                    <Sparkle className="w-4 h-4 mr-2" weight="fill" />
                    Generate
                  </Button>
                </div>

                {speakerNotes && (
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm leading-relaxed">{speakerNotes}</p>
                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={() => {
                        onApplyEnhancement('speaker-notes', { slideId: currentSlide.id, notes: speakerNotes })
                        toast.success('Notes applied')
                      }}
                    >
                      Apply to Slide
                    </Button>
                  </div>
                )}
              </Card>

              <Card className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb weight="fill" className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Optimize Title</h3>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleOptimizeTitle}
                    disabled={loading}
                  >
                    <Sparkle className="w-4 h-4 mr-2" weight="fill" />
                    Suggest
                  </Button>
                </div>

                {titleSuggestions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs text-muted-foreground mb-2">Current: "{currentSlide.title}"</p>
                    {titleSuggestions.map((title, index) => (
                      <div
                        key={index}
                        className="p-2 bg-muted/30 rounded-lg flex items-center justify-between group hover:bg-accent/10 transition-colors"
                      >
                        <p className="text-sm font-medium flex-1">{title}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            onApplyEnhancement('optimize-title', { slideId: currentSlide.id, title })
                            toast.success('Title applied')
                          }}
                        >
                          Use This
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="visuals" className="mt-0 space-y-4">
              <Card className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon weight="fill" className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Visual Recommendations</h3>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleSuggestVisuals}
                    disabled={loading}
                  >
                    <Sparkle className="w-4 h-4 mr-2" weight="fill" />
                    Analyze
                  </Button>
                </div>

                {visualSuggestions && (
                  <div className="mt-4 space-y-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm mb-3">{visualSuggestions.reasoning}</p>
                      
                      {visualSuggestions.shouldHaveImage && (
                        <div className="mb-3">
                          <Badge variant="default" className="mb-2">Image Recommended</Badge>
                          <p className="text-xs text-muted-foreground">{visualSuggestions.imagePrompt}</p>
                          <Button
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              onApplyEnhancement('add-image', {
                                slideId: currentSlide.id,
                                prompt: visualSuggestions.imagePrompt
                              })
                              toast.success('Generating image...')
                            }}
                          >
                            Generate Image
                          </Button>
                        </div>
                      )}

                      {visualSuggestions.shouldHaveDiagram && (
                        <div>
                          <Badge variant="default" className="mb-2">Diagram Recommended</Badge>
                          <p className="text-xs text-muted-foreground">Type: {visualSuggestions.diagramType}</p>
                          <Button
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              onApplyEnhancement('add-diagram', {
                                slideId: currentSlide.id,
                                diagramType: visualSuggestions.diagramType
                              })
                              toast.success('Diagram template added')
                            }}
                          >
                            Add Diagram
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="mt-0 space-y-4">
              <Card className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target weight="fill" className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Audience Analysis</h3>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleAnalyzeAudience}
                    disabled={loading}
                  >
                    <Sparkle className="w-4 h-4 mr-2" weight="fill" />
                    Analyze
                  </Button>
                </div>

                {audienceAnalysis && (
                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase mb-1">Audience Level</p>
                        <Badge variant="default" className="text-sm">{audienceAnalysis.level}</Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase mb-1">Complexity Score</p>
                        <div className="flex items-center gap-2">
                          <Progress value={audienceAnalysis.complexity} className="h-2" />
                          <span className="text-sm font-semibold">{audienceAnalysis.complexity}</span>
                        </div>
                      </div>
                    </div>

                    {audienceAnalysis.suggestions.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Suggestions:</h4>
                        <div className="space-y-2">
                          {audienceAnalysis.suggestions.map((suggestion: string, i: number) => (
                            <div key={i} className="flex items-start gap-2 p-2 bg-muted/30 rounded text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                              <p className="flex-1">{suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>

              <Card className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText weight="fill" className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Executive Summary</h3>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleGenerateExecSummary}
                    disabled={loading}
                  >
                    <Sparkle className="w-4 h-4 mr-2" weight="fill" />
                    Generate
                  </Button>
                </div>

                {execSummary && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border-2 border-primary/20">
                    <p className="text-sm leading-relaxed font-medium">{execSummary}</p>
                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={() => {
                        navigator.clipboard.writeText(execSummary)
                        toast.success('Summary copied to clipboard')
                      }}
                    >
                      Copy Summary
                    </Button>
                  </div>
                )}
              </Card>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
