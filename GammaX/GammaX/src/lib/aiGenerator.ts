import { Presentation, Slide, PresentationStyle } from './types'
import { generateImageUrl } from './imageGenerator'
import { callLLM } from './llmClient'

// Helper function to extract JSON from LLM response
function extractAndValidateJSON(response: string): any {
  try {
    // Try direct parsing first
    return JSON.parse(response)
  } catch (e) {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1])
    }

    // Try to extract JSON object from response
    const jsonObjectMatch = response.match(/\{[\s\S]*\}/)
    if (jsonObjectMatch) {
      return JSON.parse(jsonObjectMatch[0])
    }

    throw new Error('No valid JSON found in response')
  }
}

// Helper function to validate presentation structure
function validatePresentationData(data: any): void {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid response: expected JSON object')
  }

  if (!data.title || typeof data.title !== 'string') {
    throw new Error('Invalid response: missing or invalid "title" field')
  }

  if (!data.slides || !Array.isArray(data.slides) || data.slides.length === 0) {
    throw new Error('Invalid response: "slides" must be non-empty array')
  }

  // Validate each slide
  data.slides.forEach((slide: any, index: number) => {
    if (!slide.title) {
      throw new Error(`Invalid response: slide ${index} missing "title" field`)
    }

    if (!slide.layout) {
      slide.layout = 'content' // Provide default layout
    }

    if (!Array.isArray(slide.content)) {
      if (typeof slide.content === 'string') {
        slide.content = [slide.content]
      } else {
        throw new Error(`Invalid response: slide ${index} has invalid "content" field`)
      }
    }
  })
}

export async function generatePresentation(
  prompt: string,
  style: PresentationStyle = 'minimal',
  slideCount?: number
): Promise<Presentation> {
  const apiKey = import.meta.env.VITE_API_KEY
  if (!apiKey && !window.spark) {
    return createFallbackPresentation(prompt, style, slideCount)
  }

  const slidesTarget = slideCount && slideCount > 0 ? slideCount : undefined
  const countDirective = slidesTarget
    ? `Create exactly ${slidesTarget} slides with clear structure and variety.`
    : `Create 6-10 slides with clear structure and variety.`
  const systemPrompt = `You are an expert presentation designer. Generate a professional presentation based on the user's request. ${countDirective}

Return ONLY a JSON object with this exact structure:
{
  "title": "Presentation title",
  "description": "Brief description",
  "slides": [
    {
      "id": "unique-id",
      "layout": "title|content|two-column|bullets|quote|image-text|full-image|split-image",
      "title": "Slide title",
      "content": ["Content line 1", "Content line 2"],
      "notes": "Optional speaker notes",
      "needsImage": true/false,
      "imagePrompt": "Description for AI image generation (if needsImage is true)"
    }
  ]
}

Guidelines:
- First slide MUST use "title" layout with presentation title and subtitle
- Include at least 2-3 slides with images (layouts: image-text, full-image, or split-image)
- Use "bullets" layout for lists (3-5 bullet points)
- Use "content" layout for paragraphs (2-3 short paragraphs)
- Use "two-column" for comparisons or paired content
- Use "quote" for impactful statements or key takeaways
- Use "image-text" when an image would enhance understanding (set needsImage: true)
- Use "full-image" for title slides or visual impact (set needsImage: true)
- Use "split-image" for content with strong visual component (set needsImage: true)
- Keep content concise and scannable
- Each content item should be 1-2 sentences max
- When needsImage is true, provide a clear, descriptive imagePrompt
- Make it visually balanced across slides

User request: ${prompt}`

  try {
    console.log('🚀 Starting presentation generation...')
    console.log('📡 Calling LLM with gpt-oss:120b-cloud...')

    const response = await callLLM(systemPrompt, 'gpt-oss:120b-cloud', true)
    console.log('✅ Received response from LLM:', response.substring(0, 200) + '...')

    // Extract and validate JSON from response
    console.log('🔍 Extracting JSON from response...')
    const data = extractAndValidateJSON(response)

    // Validate the structure
    console.log('✔️ Validating presentation structure...')
    validatePresentationData(data)

    const slidesWithImages = await Promise.all(
      data.slides.map(async (slide: any, index: number) => {
        try {
          const slideData: Slide = {
            id: slide.id || `slide-${index}`,
            layout: slide.layout || 'content',
            title: slide.title,
            content: Array.isArray(slide.content) ? slide.content : [slide.content],
            notes: slide.notes
          }

          if (slide.needsImage && slide.imagePrompt) {
            try {
              console.log(`🖼️ Generating image for slide ${index}...`)
              slideData.imageUrl = await generateImageUrl(slide.imagePrompt)
              slideData.imagePrompt = slide.imagePrompt
              console.log(`✅ Image generated for slide ${index}`)
            } catch (imageError) {
              console.warn(`⚠️ Failed to generate image for slide ${index}:`, imageError)
              // Continue without image - don't fail the whole presentation
            }
          }

          return slideData
        } catch (slideError) {
          console.error(`❌ Error processing slide ${index}:`, slideError)
          // Return a basic slide structure as fallback
          return {
            id: `slide-${index}`,
            layout: 'content' as const,
            title: `Error Slide ${index}`,
            content: ['Unable to process this slide'],
            notes: undefined
          }
        }
      })
    )

    const presentation: Presentation = {
      id: `pres-${Date.now()}`,
      title: data.title || 'Untitled Presentation',
      description: data.description || 'Generated presentation',
      slides: slidesWithImages,
      style,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    console.log('✨ Presentation generated successfully:', presentation.title)
    if (slidesTarget && data.slides.length !== slidesTarget) {
      if (data.slides.length > slidesTarget) {
        presentation.slides = presentation.slides.slice(0, slidesTarget)
      } else {
        // Pad with simple content slides
        const pad = slidesTarget - data.slides.length
        for (let i = 0; i < pad; i++) {
          presentation.slides.push({
            id: `slide-pad-${i}`,
            layout: 'content',
            title: `Additional Slide ${i + 1}`,
            content: ['Add your content here']
          })
        }
      }
    }
    return presentation
  } catch (error) {
    console.error('❌ Detailed error in generatePresentation:', error)
    return createFallbackPresentation(prompt, style, slideCount)
  }
}

function createFallbackPresentation(prompt: string, style: PresentationStyle, slideCount?: number): Presentation {
  const baseId = `pres-${Date.now()}`
  const total = Math.max(5, Math.min(slideCount || 8, 100))
  const slides: Slide[] = []
  slides.push({
    id: `${baseId}-slide-0`,
    layout: 'title',
    title: deriveTitleFromPrompt(prompt),
    content: ['AI presentation generated locally', 'No external AI services used'],
    animation: 'fade-in'
  })
  const layouts: Array<Slide['layout']> = ['content', 'bullets', 'image-text', 'two-column', 'quote', 'split-image', 'full-image']
  for (let i = 1; i < total; i++) {
    const layout = layouts[(i - 1) % layouts.length]
    const common: Slide = {
      id: `${baseId}-slide-${i}`,
      layout,
      title: layout === 'quote' ? `Key Takeaway ${i}` : layout === 'two-column' ? `Comparison ${i}` : layout === 'bullets' ? `Key Points ${i}` : `Slide ${i + 1}`,
      content: layout === 'bullets'
        ? [`Point one for ${prompt}`, `Detail about ${prompt}`, `Conclusion on this point`]
        : [`Deep dive into ${prompt} part ${i}`, `Explaining the core concepts of ${prompt}`],
      animation: ['fade-in', 'slide-up', 'slide-right', 'slide-left', 'reveal', 'zoom-in'][i % 6] as any
    }
    if (['image-text', 'full-image', 'split-image'].includes(layout)) {
      common.imageUrl = generateImageUrlFallback(`${prompt} ${style} ${i}`)
    }
    if (i % 5 === 0) {
      // Inject a simple chart diagram every few slides
      common.diagram = {
        type: (i % 15 === 0 ? 'line' : i % 10 === 0 ? 'bar' : 'pie') as any,
        nodes: [
          { id: 'a', label: 'Metric A' },
          { id: 'b', label: 'Metric B' },
          { id: 'c', label: 'Metric C' }
        ]
      }
    }
    slides.push(common)
  }

  return {
    id: baseId,
    title: deriveTitleFromPrompt(prompt),
    description: `Professional presentation about: ${truncate(prompt, 80)}`,
    slides,
    style,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
}

function deriveTitleFromPrompt(prompt: string): string {
  const cleaned = prompt.trim().replace(/\s+/g, ' ')
  if (cleaned.length === 0) return 'Untitled Presentation'
  const firstSentence = cleaned.split(/[.!?]/)[0].slice(0, 80).trim()
  return capitalize(firstSentence)
}

function summarizePrompt(prompt: string): string {
  const cleaned = prompt.trim().replace(/\s+/g, ' ')
  return cleaned.length > 120 ? `${cleaned.slice(0, 117)}...` : cleaned
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 3)}...` : text
}

function capitalize(text: string): string {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function generateImageUrlFallback(topic: string): string {
  try {
    return getSafeImageUrl(topic)
  } catch {
    return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(topic)}`
  }
}

function getSafeImageUrl(topic: string): string {
  const clean = topic.replace(/[^a-zA-Z0-9\\s,.-]/g, ' ').trim().slice(0, 200)
  const promptEncoded = encodeURIComponent(clean)
  const seed = Math.floor(Math.random() * 1000000)
  return `https://image.pollinations.ai/prompt/${promptEncoded}?width=1920&height=1080&seed=${seed}&nologo=true`
}
