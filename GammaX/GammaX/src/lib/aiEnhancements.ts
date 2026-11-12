import { Presentation, Slide, SlideLayout } from './types'

declare const spark: {
  llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string
  llm: (prompt: string, model?: string, jsonMode?: boolean) => Promise<string>
}

export interface AIRestructureSuggestion {
  type: 'merge' | 'split' | 'reorder' | 'change-layout'
  slideIds: string[]
  newLayout?: SlideLayout
  reason: string
  confidence: number
}

export interface AIContentExpansion {
  slideId: string
  expandedContent: string[]
  additionalSlides?: Slide[]
  sources?: string[]
}

export async function analyzeSlideStructure(presentation: Presentation): Promise<AIRestructureSuggestion[]> {
  try {
    const prompt = spark.llmPrompt`You are a presentation expert analyzing slide structure. 
    
Presentation: "${presentation.title}"
Total slides: ${presentation.slides.length}

Slides overview:
${presentation.slides.map((s, i) => `${i + 1}. ${s.title} (${s.layout}) - ${s.content.length} bullet points`).join('\n')}

Analyze this presentation structure and suggest improvements. Consider:
1. Slides that are too content-heavy and should be split
2. Slides with similar topics that could be merged
3. Better ordering for logical flow
4. Layout changes for better visual communication

Return suggestions as JSON array with format:
{
  "suggestions": [
    {
      "type": "split | merge | reorder | change-layout",
      "slideIds": ["slide-id-1"],
      "newLayout": "layout-name (if applicable)",
      "reason": "Clear explanation why this improves the presentation",
      "confidence": 0.0-1.0
    }
  ]
}

Focus on actionable, high-impact suggestions. Limit to 5 most important suggestions.`

    const response = await spark.llm(prompt, 'gpt-4o', true)
    const result = JSON.parse(response)
    
    return result.suggestions.map((s: any) => ({
      ...s,
      confidence: Math.round(s.confidence * 100) / 100
    }))
  } catch (error) {
    console.error('Error analyzing slide structure:', error)
    return []
  }
}

export async function expandSlideContent(slide: Slide, context: string = ''): Promise<AIContentExpansion> {
  try {
    const prompt = spark.llmPrompt`You are a presentation content expert. Expand and enhance the following slide content with more detail, examples, and supporting information.

Slide Title: "${slide.title}"
Layout: ${slide.layout}
Current Content:
${slide.content.join('\n')}

${context ? `Additional Context: ${context}` : ''}

Provide:
1. Expanded bullet points with more depth (maintain bullet point format)
2. Specific examples and data points where applicable
3. Compelling phrasing that engages the audience
4. If content is extensive, suggest splitting into additional slides

Return as JSON:
{
  "expandedContent": ["enhanced bullet point 1", "enhanced bullet point 2", ...],
  "additionalSlides": [
    {
      "title": "New Slide Title",
      "content": ["bullet 1", "bullet 2"],
      "layout": "bullets",
      "notes": "Speaker notes"
    }
  ],
  "sources": ["relevant source 1", "relevant source 2"]
}

Keep expandedContent array to 4-6 items max. Only suggest additionalSlides if original content warrants splitting.`

    const response = await spark.llm(prompt, 'gpt-4o', true)
    const result = JSON.parse(response)

    return {
      slideId: slide.id,
      expandedContent: result.expandedContent || slide.content,
      additionalSlides: result.additionalSlides?.map((s: any) => ({
        id: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        layout: s.layout as SlideLayout || 'bullets',
        title: s.title,
        content: s.content,
        notes: s.notes,
        animation: slide.animation
      })),
      sources: result.sources
    }
  } catch (error) {
    console.error('Error expanding slide content:', error)
    return {
      slideId: slide.id,
      expandedContent: slide.content
    }
  }
}

export async function generateSpeakerNotes(slide: Slide): Promise<string> {
  try {
    const prompt = spark.llmPrompt`Generate detailed speaker notes for this presentation slide. The notes should help a presenter deliver the content confidently and naturally.

Slide Title: "${slide.title}"
Content:
${slide.content.join('\n')}

${slide.diagram ? `This slide includes a ${slide.diagram.type} diagram.` : ''}
${slide.imageUrl ? 'This slide includes a visual image.' : ''}

Create comprehensive speaker notes that include:
1. Opening statement to introduce the slide
2. Key points to emphasize for each bullet
3. Smooth transitions between points
4. Compelling examples or analogies to use
5. Strong closing statement that bridges to next slide

Keep notes conversational and natural. Aim for 150-200 words that take about 60-90 seconds to deliver.`

    const response = await spark.llm(prompt, 'gpt-4o', false)
    return response.trim()
  } catch (error) {
    console.error('Error generating speaker notes:', error)
    return 'No notes available for this slide.'
  }
}

export async function optimizeSlideTitle(slide: Slide): Promise<string[]> {
  try {
    const prompt = spark.llmPrompt`Suggest 3 alternative titles for this slide that are more engaging, concise, and impactful.

Current Title: "${slide.title}"
Slide Content:
${slide.content.join('\n')}

Return 3 alternative titles as JSON array. Each should be:
- Clear and descriptive
- Engaging and memorable
- Under 60 characters
- Action-oriented when appropriate

Format: { "titles": ["Alternative 1", "Alternative 2", "Alternative 3"] }`

    const response = await spark.llm(prompt, 'gpt-4o', true)
    const result = JSON.parse(response)
    return result.titles || []
  } catch (error) {
    console.error('Error optimizing slide title:', error)
    return []
  }
}

export async function suggestVisualElements(slide: Slide): Promise<{
  shouldHaveImage: boolean
  imagePrompt?: string
  shouldHaveDiagram: boolean
  diagramType?: string
  reasoning: string
}> {
  try {
    const prompt = spark.llmPrompt`Analyze this slide and recommend visual elements to enhance understanding and engagement.

Slide Title: "${slide.title}"
Layout: ${slide.layout}
Content:
${slide.content.join('\n')}

Current visuals:
- Has image: ${slide.imageUrl ? 'Yes' : 'No'}
- Has diagram: ${slide.diagram ? `Yes (${slide.diagram.type})` : 'No'}

Recommend:
1. Should this slide have an image? If yes, provide a detailed image generation prompt
2. Should this slide have a diagram? If yes, what type (flowchart, timeline, org-chart, etc.)
3. Reasoning for your recommendations

Return as JSON:
{
  "shouldHaveImage": boolean,
  "imagePrompt": "detailed prompt for AI image generation",
  "shouldHaveDiagram": boolean,
  "diagramType": "diagram type if applicable",
  "reasoning": "explanation of recommendations"
}`

    const response = await spark.llm(prompt, 'gpt-4o', true)
    return JSON.parse(response)
  } catch (error) {
    console.error('Error suggesting visual elements:', error)
    return {
      shouldHaveImage: false,
      shouldHaveDiagram: false,
      reasoning: 'Unable to analyze visual needs'
    }
  }
}

export async function improveContentClarity(content: string[]): Promise<string[]> {
  try {
    const prompt = spark.llmPrompt`Improve the clarity, conciseness, and impact of these bullet points while preserving their core message.

Current bullet points:
${content.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Return improved versions that are:
- More concise (remove unnecessary words)
- More impactful (use strong action verbs)
- Parallel in structure
- Easy to scan and understand
- Maintain professional tone

Return as JSON array: { "improved": ["point 1", "point 2", ...] }`

    const response = await spark.llm(prompt, 'gpt-4o', true)
    const result = JSON.parse(response)
    return result.improved || content
  } catch (error) {
    console.error('Error improving content clarity:', error)
    return content
  }
}

export async function generateSlideTransitions(slides: Slide[]): Promise<Record<string, string>> {
  try {
    const prompt = spark.llmPrompt`Generate smooth transition phrases to connect these presentation slides.

Slides:
${slides.map((s, i) => `${i + 1}. ${s.title}`).join('\n')}

For each slide (except the first), provide a brief transition phrase (10-20 words) that:
- Connects the previous slide's topic to the current one
- Maintains narrative flow
- Sounds natural when spoken

Return as JSON object with slide IDs as keys:
{
  "slideTransitions": {
    "slide-id-2": "transition from slide 1 to 2",
    "slide-id-3": "transition from slide 2 to 3",
    ...
  }
}`

    const response = await spark.llm(prompt, 'gpt-4o', true)
    const result = JSON.parse(response)
    return result.slideTransitions || {}
  } catch (error) {
    console.error('Error generating slide transitions:', error)
    return {}
  }
}

export async function analyzeAudienceLevel(presentation: Presentation): Promise<{
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  suggestions: string[]
  complexity: number
}> {
  try {
    const prompt = spark.llmPrompt`Analyze this presentation's content complexity and target audience level.

Presentation: "${presentation.title}"
Description: ${presentation.description}

Sample slides:
${presentation.slides.slice(0, 3).map(s => `- ${s.title}: ${s.content[0] || ''}`).join('\n')}

Determine:
1. Intended audience level (beginner/intermediate/advanced/expert)
2. Current complexity score (0-100)
3. Suggestions to better match the intended audience

Return as JSON:
{
  "level": "beginner | intermediate | advanced | expert",
  "complexity": 0-100,
  "suggestions": ["suggestion 1", "suggestion 2", ...]
}`

    const response = await spark.llm(prompt, 'gpt-4o', true)
    const result = JSON.parse(response)
    
    return {
      level: result.level || 'intermediate',
      complexity: result.complexity || 50,
      suggestions: result.suggestions || []
    }
  } catch (error) {
    console.error('Error analyzing audience level:', error)
    return {
      level: 'intermediate',
      complexity: 50,
      suggestions: []
    }
  }
}

export async function generateExecutiveSummary(presentation: Presentation): Promise<string> {
  try {
    const prompt = spark.llmPrompt`Create a compelling executive summary for this presentation.

Title: "${presentation.title}"
Description: ${presentation.description}

Key slides:
${presentation.slides.map(s => `- ${s.title}`).join('\n')}

Generate a 3-4 sentence executive summary that:
1. Captures the core message
2. Highlights key takeaways
3. Explains the value/impact
4. Is compelling and professional

Return as plain text, not JSON.`

    const response = await spark.llm(prompt, 'gpt-4o', false)
    return response.trim()
  } catch (error) {
    console.error('Error generating executive summary:', error)
    return 'Executive summary not available.'
  }
}
