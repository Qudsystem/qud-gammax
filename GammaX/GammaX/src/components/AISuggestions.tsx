import { useState, useEffect } from 'react'
import { AISuggestion, Presentation, PresentationAnalytics, ViewEvent, EngagementEvent } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { 
  Sparkle, 
  Check, 
  X, 
  TrendUp,
  TrendDown,
  Lightbulb,
  ChartBar,
  Eye,
  ChatCircle,
  ArrowsClockwise
} from '@phosphor-icons/react'

interface AISuggestionsProps {
  presentation: Presentation
  viewEvents: ViewEvent[]
  engagementEvents: EngagementEvent[]
  onApplySuggestion: (suggestion: AISuggestion) => void
  onDismissSuggestion: (suggestionId: string) => void
}

export function AISuggestions({
  presentation,
  viewEvents,
  engagementEvents,
  onApplySuggestion,
  onDismissSuggestion
}: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>(presentation.aiSuggestions || [])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const generateSuggestions = async () => {
    setIsGenerating(true)
    try {
      const analytics = presentation.analytics || {
        presentationId: presentation.id,
        totalViews: 0,
        uniqueViewers: 0,
        averageDuration: 0,
        completionRate: 0,
        slideEngagement: {},
        viewsByDay: {},
        topReferrers: [],
        deviceBreakdown: { mobile: 0, tablet: 0, desktop: 0 },
        lastUpdated: Date.now()
      }

      const presentationEngagement = engagementEvents.filter(e => e.presentationId === presentation.id)
      const presentationViews = viewEvents.filter(e => e.presentationId === presentation.id)

      const slideEngagementText = presentation.slides.map((slide, idx) => 
        `Slide ${idx + 1} (${slide.title}): ${analytics.slideEngagement[slide.id] || 0} views`
      ).join('\n')

      const promptText = `You are an expert presentation consultant analyzing viewer engagement data to provide actionable improvement suggestions.

Presentation Details:
- Title: ${presentation.title}
- Slides: ${presentation.slides.length}
- Style: ${presentation.style}

Analytics Data:
- Total Views: ${analytics.totalViews}
- Unique Viewers: ${analytics.uniqueViewers}
- Average Duration: ${Math.round(analytics.averageDuration / 1000)}s
- Completion Rate: ${Math.round(analytics.completionRate * 100)}%
- Comments: ${presentationEngagement.filter(e => e.eventType === 'comment').length}

Slide Engagement (views per slide):
${slideEngagementText}

Based on this engagement data, generate 5-8 specific, actionable suggestions to improve this presentation. Focus on:
1. Slides with low engagement (need improvement)
2. Content structure and flow (based on drop-off points)
3. Visual design improvements (if completion rate is low)
4. Engagement opportunities (if comments/interactions are low)
5. Presentation length optimization (if average duration vs. slide count suggests issues)

Return a JSON object with a "suggestions" property containing an array of suggestion objects. Each suggestion must have:
- type: "content" | "layout" | "style" | "engagement" | "structure"
- title: Brief action-oriented title (max 60 chars)
- description: Detailed explanation (max 200 chars)
- confidence: 0-100 (how confident you are in this suggestion based on data)
- targetSlideId: The slide ID this applies to (or null for presentation-wide suggestions)
- reasoning: Why this suggestion matters based on the data (max 150 chars)
- impact: "high" | "medium" | "low"

Example format:
{
  "suggestions": [
    {
      "type": "content",
      "title": "Simplify Slide 3 content",
      "description": "Slide 3 has 40% higher drop-off. Consider reducing bullet points from 7 to 3-4 key points.",
      "confidence": 85,
      "targetSlideId": "slide-123",
      "reasoning": "Drop-off rate suggests content overload - viewers spending less time here",
      "impact": "high"
    }
  ]
}`
      
      const prompt = promptText

      const result = await window.spark.llm(prompt, 'gpt-4o', true)
      const parsed = JSON.parse(result)
      
      const newSuggestions: AISuggestion[] = parsed.suggestions.map((s: any, idx: number) => ({
        id: `suggestion-${Date.now()}-${idx}`,
        presentationId: presentation.id,
        type: s.type,
        title: s.title,
        description: s.description,
        confidence: s.confidence,
        targetSlideId: s.targetSlideId === 'null' ? undefined : s.targetSlideId,
        reasoning: s.reasoning,
        impact: s.impact,
        createdAt: Date.now(),
        applied: false
      }))

      setSuggestions(newSuggestions)
      toast.success(`Generated ${newSuggestions.length} AI suggestions`)
    } catch (error) {
      console.error('Failed to generate suggestions:', error)
      toast.error('Failed to generate suggestions')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApply = (suggestion: AISuggestion) => {
    setSuggestions(prev => prev.map(s => 
      s.id === suggestion.id ? { ...s, applied: true } : s
    ))
    onApplySuggestion(suggestion)
  }

  const handleDismiss = (suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId))
    onDismissSuggestion(suggestionId)
  }

  const getImpactColor = (impact: AISuggestion['impact']) => {
    switch (impact) {
      case 'high': return 'text-destructive'
      case 'medium': return 'text-accent'
      case 'low': return 'text-muted-foreground'
    }
  }

  const getTypeIcon = (type: AISuggestion['type']) => {
    switch (type) {
      case 'content': return <Lightbulb className="w-4 h-4" />
      case 'layout': return <ChartBar className="w-4 h-4" />
      case 'style': return <Sparkle className="w-4 h-4" />
      case 'engagement': return <ChatCircle className="w-4 h-4" />
      case 'structure': return <ArrowsClockwise className="w-4 h-4" />
    }
  }

  const activeSuggestions = suggestions.filter(s => !s.applied)
  const displayedSuggestions = showAll ? activeSuggestions : activeSuggestions.slice(0, 3)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkle className="w-5 h-5 text-primary" weight="fill" />
          <h3 className="text-lg font-semibold text-foreground">AI Suggestions</h3>
          {activeSuggestions.length > 0 && (
            <Badge variant="secondary">{activeSuggestions.length}</Badge>
          )}
        </div>
        <Button
          onClick={generateSuggestions}
          disabled={isGenerating}
          size="sm"
          variant="outline"
        >
          <ArrowsClockwise className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Analyzing...' : 'Generate Suggestions'}
        </Button>
      </div>

      {isGenerating ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-4">
              <div className="space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : activeSuggestions.length === 0 ? (
        <Card className="p-8">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Sparkle className="w-8 h-8 text-primary" weight="fill" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-foreground mb-1">No Suggestions Yet</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Generate AI-powered suggestions based on viewer engagement data
              </p>
              <Button onClick={generateSuggestions}>
                <Sparkle className="w-4 h-4 mr-2" weight="fill" />
                Generate Suggestions
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3 pr-4">
              {displayedSuggestions.map((suggestion, index) => (
                <Card key={suggestion.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0">
                          {getTypeIcon(suggestion.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-sm">{suggestion.title}</CardTitle>
                            <Badge variant="outline" className="text-xs">
                              {suggestion.type}
                            </Badge>
                          </div>
                          <CardDescription className="text-xs">
                            {suggestion.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs flex-shrink-0 ${getImpactColor(suggestion.impact)}`}
                      >
                        {suggestion.impact === 'high' && <TrendUp className="w-3 h-3 mr-1" />}
                        {suggestion.impact === 'medium' && <TrendUp className="w-3 h-3 mr-1" />}
                        {suggestion.impact === 'low' && <TrendDown className="w-3 h-3 mr-1" />}
                        {suggestion.impact}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Eye className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">{suggestion.reasoning}</p>
                    </div>

                    {suggestion.targetSlideId && (
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Target:</span>{' '}
                        {presentation.slides.find(s => s.id === suggestion.targetSlideId)?.title || 'Specific slide'}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                          style={{ width: `${suggestion.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {suggestion.confidence}%
                      </span>
                    </div>

                    <Separator />

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApply(suggestion)}
                        className="flex-1"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Mark as Applied
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDismiss(suggestion.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {activeSuggestions.length > 3 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="w-full"
            >
              {showAll ? 'Show Less' : `Show ${activeSuggestions.length - 3} More`}
            </Button>
          )}
        </>
      )}
    </div>
  )
}
