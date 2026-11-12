import { Presentation, Slide, PresentationStyle, SlideLayout, ModelProvider } from './types'
import { generateImageUrl } from './imageGenerator'
import { generateContentWithGemini } from './geminiAI'
import { loadProviderSettings } from './settings'

const PROFESSIONAL_SYSTEM_PROMPT = `You are a professional presentation designer and content strategist.
Your goal is to create a high-quality, professional, and visually engaging slide presentation based on the user's topic.

CRITICAL INSTRUCTIONS:
1. CONTENT DEPTH: Each slide must have substantial, well-researched content. Avoid generic "placeholder" text. Provide actual insights, data points (where applicable), and professional phrasing.
2. STRUCTURE: The presentation should follow a logical flow: Introduction -> Problem Statement/Context -> Core Solutions/Key Points -> Detailed Breakdown -> Practical Applications -> Conclusion/Summary.
3. VISUALS: Provide highly descriptive "imagePrompt" values that describe professional, context-relevant imagery (e.g., "A high-resolution photograph of a modern office space with diverse professionals collaborating on a digital interface, symbolizing innovation and teamwork").
4. FORMATTING: Return ONLY valid JSON with the following structure:
{
  "title": "Presentation Main Title",
  "description": "Professional executive summary of the presentation",
  "slides": [
    {
      "id": "slide-id",
      "layout": "title | content | bullets | two-column | quote | image-text | split-image | full-image",
      "title": "Slide Title",
      "content": ["Key point 1", "Detailed explanation of key point 2", "Insightful conclusion for this slide"],
      "imagePrompt": "Detailed description of a professional image related to this slide's content",
      "notes": "Speaker notes providing more depth and context for this slide"
    }
  ]
}
5. LAYOUT VARIETY: Use a mix of layouts (e.g., bullets for lists, two-column for comparisons, quote for emphasis) to keep the presentation engaging.
6. LANGUAGE: Generate content in the same language as the user's topic unless specified otherwise.
`;

function buildPresentationFromJson(
  data: any,
  prompt: string,
  style: PresentationStyle
): Presentation {
  const slidesArray = Array.isArray(data.slides) ? data.slides : []

  const slides: Slide[] = slidesArray.map((slide: any, index: number) => ({
    id: slide.id || `slide-${Date.now()}-${index}`,
    layout: slide.layout || 'content',
    title: slide.title || `Slide ${index + 1}`,
    content: Array.isArray(slide.content) ? slide.content : [slide.content || ''],
    notes: slide.notes || `Notes for slide ${index + 1}`,
    animation: slide.animation || 'fade',
    transitionDuration: slide.transitionDuration ?? 400,
    ...(slide.imagePrompt && { imagePrompt: slide.imagePrompt }),
  }))

  return {
    id: data.id || `pres-${Date.now()}`,
    title: data.title || 'New presentation',
    description: data.description || `Presentation about ${prompt}`,
    slides,
    style,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timeoutId: number | undefined
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Provider ${label} timed out after ${ms} ms`))
    }, ms) as unknown as number
  })

  try {
    const result = await Promise.race([promise, timeoutPromise])
    if (timeoutId !== undefined) clearTimeout(timeoutId)
    return result as T
  } catch (err) {
    if (timeoutId !== undefined) clearTimeout(timeoutId)
    throw err
  }
}

async function generateWithGemini(
  prompt: string,
  style: PresentationStyle,
  numSlides: number,
  config: { language?: string; ratio?: string; textDensity?: string } = {}
): Promise<Presentation> {
  try {
    const presentation = await generateContentWithGemini(prompt, style, numSlides);
    const slidesWithImages = await Promise.all(
      presentation.slides.map(async (slide) => {
        if (slide.imagePrompt) {
          try {
            slide.imageUrl = await generateImageUrl(slide.imagePrompt);
          } catch (error) {
            console.error('Failed to generate image for slide:', error);
          }
        }
        return slide;
      })
    );
    return { ...presentation, slides: slidesWithImages };
  } catch (error) {
    console.error('AI Presentation generation failed:', error);
    throw error;
  }
}

async function generateWithClaude(
  prompt: string,
  style: PresentationStyle,
  numSlides: number,
  config: { language?: string; ratio?: string; textDensity?: string } = {}
): Promise<Presentation> {
  const settings = loadProviderSettings()
  const apiKey = settings.claudeApiKey
  if (!apiKey) throw new Error('Claude API key not configured')

  const sysPrompt = PROFESSIONAL_SYSTEM_PROMPT;

  const userPrompt = `Topic: ${prompt}
Style: ${style}
Number of Slides: ${numSlides}
Language: ${config.language || 'auto'}
Ratio: ${config.ratio || '16:9'}
Text density: ${config.textDensity || 'medium'}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 4096,
      system: sysPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!res.ok) {
    throw new Error(`Claude API error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  const contentBlocks = data?.content || data?.messages?.[0]?.content
  let text = ''
  if (Array.isArray(contentBlocks)) {
    text = contentBlocks.map((b: any) => b.text || b.content || '').join('\n')
  } else {
    text = String(contentBlocks || '')
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Claude response did not contain JSON presentation')
  const json = JSON.parse(jsonMatch[0])

  const presentation = buildPresentationFromJson(json, prompt, style)
  const slidesWithImages = await Promise.all(
    presentation.slides.map(async (slide) => {
      if (slide.imagePrompt) {
        try {
          slide.imageUrl = await generateImageUrl(slide.imagePrompt!)
        } catch (error) {
          console.error('Failed to generate image for slide (Claude):', error)
        }
      }
      return slide
    })
  )
  return { ...presentation, slides: slidesWithImages }
}

async function generateWithDeepseek(
  prompt: string,
  style: PresentationStyle,
  numSlides: number,
  config: { language?: string; ratio?: string; textDensity?: string } = {}
): Promise<Presentation> {
  const settings = loadProviderSettings()
  const apiKey = settings.deepseekApiKey
  if (!apiKey) throw new Error('DeepSeek API key not configured')

  const sysPrompt = PROFESSIONAL_SYSTEM_PROMPT;

  const userPrompt = `Topic: ${prompt}
Style: ${style}
Number of Slides: ${numSlides}
Language: ${config.language || 'auto'}
Ratio: ${config.ratio || '16:9'}
Text density: ${config.textDensity || 'medium'}`

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: sysPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  })

  if (!res.ok) {
    throw new Error(`DeepSeek API error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  const msg = data?.choices?.[0]?.message
  let text = ''
  if (Array.isArray(msg?.content)) {
    text = msg.content.map((c: any) => c.text || c.content || '').join('\n')
  } else {
    text = msg?.content || ''
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('DeepSeek response did not contain JSON presentation')
  const json = JSON.parse(jsonMatch[0])

  const presentation = buildPresentationFromJson(json, prompt, style)
  const slidesWithImages = await Promise.all(
    presentation.slides.map(async (slide) => {
      if (slide.imagePrompt) {
        try {
          slide.imageUrl = await generateImageUrl(slide.imagePrompt!)
        } catch (error) {
          console.error('Failed to generate image for slide (DeepSeek):', error)
        }
      }
      return slide
    })
  )
  return { ...presentation, slides: slidesWithImages }
}

async function generateWithOllama(
  prompt: string,
  style: PresentationStyle,
  numSlides: number,
  config: { language?: string; ratio?: string; textDensity?: string } = {}
): Promise<Presentation> {
  const settings = loadProviderSettings()
  const baseUrl = (settings.ollamaBaseUrl || 'http://localhost:11434').replace(/\/$/, '')
  const modelName = settings.ollamaModel || 'llama3.1'

  const sysPrompt = PROFESSIONAL_SYSTEM_PROMPT;

  const userPrompt = `Topic: ${prompt}
Style: ${style}
Number of Slides: ${numSlides}
Language: ${config.language || 'auto'}
Ratio: ${config.ratio || '16:9'}
Text density: ${config.textDensity || 'medium'}`

  const res = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: modelName,
      stream: false,
      messages: [
        { role: 'system', content: sysPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  })

  if (!res.ok) {
    throw new Error(`Ollama API error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  const msg = data?.message
  const text = msg?.content || ''

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Ollama response did not contain JSON presentation')
  const json = JSON.parse(jsonMatch[0])

  const presentation = buildPresentationFromJson(json, prompt, style)
  const slidesWithImages = await Promise.all(
    presentation.slides.map(async (slide) => {
      if (slide.imagePrompt) {
        try {
          slide.imageUrl = await generateImageUrl(slide.imagePrompt!)
        } catch (error) {
          console.error('Failed to generate image for slide (Ollama):', error)
        }
      }
      return slide
    })
  )
  return { ...presentation, slides: slidesWithImages }
}

async function generateWithNvidia(
  prompt: string,
  style: PresentationStyle,
  numSlides: number,
  config: { language?: string; ratio?: string; textDensity?: string } = {}
): Promise<Presentation> {
  const settings = loadProviderSettings()
  const apiKey = settings.nvidiaApiKey
  if (!apiKey) throw new Error('NVIDIA API key not configured')

  const modelId = settings.nvidiaModel || 'meta/llama-3.1-70b-instruct'

  const sysPrompt = PROFESSIONAL_SYSTEM_PROMPT;

  const userPrompt = `Topic: ${prompt}
Style: ${style}
Number of Slides: ${numSlides}
Language: ${config.language || 'auto'}
Ratio: ${config.ratio || '16:9'}
Text density: ${config.textDensity || 'medium'}`

  const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: 'system', content: sysPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    throw new Error(`NVIDIA API error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  const msg = data?.choices?.[0]?.message
  const text = msg?.content || ''

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('NVIDIA response did not contain JSON presentation')
  const json = JSON.parse(jsonMatch[0])

  const presentation = buildPresentationFromJson(json, prompt, style)
  const slidesWithImages = await Promise.all(
    presentation.slides.map(async (slide) => {
      if (slide.imagePrompt) {
        try {
          slide.imageUrl = await generateImageUrl(slide.imagePrompt!)
        } catch (error) {
          console.error('Failed to generate image for slide (NVIDIA):', error)
        }
      }
      return slide
    })
  )
  return { ...presentation, slides: slidesWithImages }
}

async function generateRealisticMockPresentation(
  prompt: string,
  style: PresentationStyle,
  numSlides: number
): Promise<Presentation> {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 2000));

  const keywords = prompt.split(' ').filter(w => w.length > 3);
  const mainTopic = keywords.length > 0 ? keywords.join(' ') : prompt;

  const slideTemplates: { title: (topic: string) => string; layout: SlideLayout; content: (topic: string) => string[] }[] = [
    {
      title: (topic) => `The Future of ${topic}`,
      layout: 'title',
      content: (topic) => [`A comprehensive overview of what's next for ${topic}.`, `Key predictions and upcoming innovations.`]
    },
    {
      title: (topic) => `Understanding ${topic}`,
      layout: 'content',
      content: (topic) => [`${topic} is a paradigm-shifting technology with far-reaching implications.`, `This presentation will break down its core principles and applications.`]
    },
    {
      title: (topic) => `Key Features of ${topic}`,
      layout: 'bullets',
      content: (topic) => [`Scalable architecture for ${topic}`, `Intuitive user interface`, `Seamless integration with existing systems`, `Advanced security protocols for ${topic}`]
    },
    {
      title: () => 'A Word from an Expert',
      layout: 'quote',
      content: () => [`"We are at the precipice of a new era, and this technology is leading the charge."`, `Industry Analyst`]
    },
    {
      title: (topic) => `${topic} in Practice`,
      layout: 'image-text',
      content: (topic) => [`Real-world applications of ${topic} are already making a significant impact across various sectors.`]
    },
    {
      title: () => 'Pros and Cons',
      layout: 'two-column',
      content: () => [`Highly efficient and cost-effective.`, `Reduces manual labor by up to 70%.`, `Initial setup can be complex.`, `Requires specialized training for team members.`]
    },
    {
      title: (topic) => `Visualizing ${topic}`,
      layout: 'split-image',
      content: (topic) => [`A powerful visual metaphor for ${topic}'s core concept.`]
    },
    {
      title: (topic) => `The Impact of ${topic}`,
      layout: 'full-image',
      content: (topic) => [`A stunning visual that captures the essence of ${topic}'s influence.`]
    }
  ];

  const slides: Slide[] = [];
  for (let i = 0; i < numSlides; i++) {
    const template = slideTemplates[i % slideTemplates.length];
    const slideTitle = template.title(mainTopic);
    const slideContent = template.content(mainTopic);
    const needsImage = template.layout === 'title' || template.layout === 'image-text' || template.layout === 'full-image' || template.layout === 'split-image';

    const slide: Slide = {
      id: `slide-${Date.now()}-${i}`,
      layout: template.layout,
      title: slideTitle,
      content: slideContent,
      notes: `This is a slide about ${slideTitle}`,
      animation: 'fade',
      transitionDuration: 400,
      ...(needsImage && {
        imagePrompt: `A professional, high-quality image representing: ${mainTopic}, ${slideTitle}`
      })
    };
    slides.push(slide);
  }

  const slidesWithImages = await Promise.all(
    slides.map(async (slide) => {
      if (slide.imagePrompt) {
        try {
          slide.imageUrl = await generateImageUrl(slide.imagePrompt);
        } catch (error) {
          console.error('Failed to generate image for slide:', error);
        }
      }
      return slide;
    })
  );

  return {
    id: `pres-${Date.now()}`,
    title: mainTopic,
    description: `A presentation about ${prompt}`,
    slides: slidesWithImages,
    style,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export async function generatePresentation(
  prompt: string,
  style: PresentationStyle = 'minimal',
  numSlides: number = 6,
  _config: { language?: string; ratio?: string; textDensity?: string } = {}
): Promise<Presentation> {
  const settings = loadProviderSettings()
  const provider: ModelProvider = settings.provider || 'auto'
  const timeoutMs = settings.timeoutMs ?? 20000

  // مزوّد واحد محدد
  const runSingle = async (): Promise<Presentation> => {
    try {
      if (provider === 'gemini') {
        if (!(settings.geminiApiKey || (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY))) {
          // لا يوجد مفتاح Gemini، جرّب Ollama أولاً إن كان متاحاً
          if (settings.ollamaBaseUrl) {
            console.log('Gemini key missing, falling back to Ollama');
            return await withTimeout(generateWithOllama(prompt, style, numSlides, _config), timeoutMs, 'ollama')
          }
        }
        return await withTimeout(generateWithGemini(prompt, style, numSlides, _config), timeoutMs, 'gemini')
      }
      if (provider === 'claude') {
        if (!settings.claudeApiKey && settings.ollamaBaseUrl) {
          console.log('Claude key missing, falling back to Ollama');
          return await withTimeout(generateWithOllama(prompt, style, numSlides, _config), timeoutMs, 'ollama')
        }
        return await withTimeout(generateWithClaude(prompt, style, numSlides, _config), timeoutMs, 'claude')
      }
      if (provider === 'deepseek') {
        if (!settings.deepseekApiKey && settings.ollamaBaseUrl) {
          console.log('DeepSeek key missing, falling back to Ollama');
          return await withTimeout(generateWithOllama(prompt, style, numSlides, _config), timeoutMs, 'ollama')
        }
        return await withTimeout(generateWithDeepseek(prompt, style, numSlides, _config), timeoutMs, 'deepseek')
      }
      if (provider === 'ollama') return await withTimeout(generateWithOllama(prompt, style, numSlides, _config), timeoutMs, 'ollama')
      if (provider === 'nvidia') {
        if (!settings.nvidiaApiKey && settings.ollamaBaseUrl) {
          console.log('NVIDIA key missing, falling back to Ollama');
          return await withTimeout(generateWithOllama(prompt, style, numSlides, _config), timeoutMs, 'ollama')
        }
        return await withTimeout(generateWithNvidia(prompt, style, numSlides, _config), timeoutMs, 'nvidia')
      }
      throw new Error(`Unknown provider: ${provider}`)
    } catch (error) {
      console.error(`${provider} failed, falling back to Ollama if available, then mock.`, error)
      if (provider !== 'ollama' && settings.ollamaBaseUrl) {
        try {
          return await withTimeout(generateWithOllama(prompt, style, numSlides, _config), timeoutMs, 'ollama')
        } catch (ollamaError) {
          console.error('Ollama fallback also failed:', ollamaError)
        }
      }
      return generateRealisticMockPresentation(prompt, style, numSlides)
    }
  }

  if (provider !== 'auto') {
    return runSingle()
  }

  // وضع Auto: جرّب كل المزوّدات المفعلة بالتوازي، واختر أول استجابة ناجحة
  const candidates: { id: ModelProvider; fn: () => Promise<Presentation> }[] = []
  if (settings.geminiApiKey || (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY)) {
    candidates.push({ id: 'gemini', fn: () => generateWithGemini(prompt, style, numSlides, _config) })
  }
  if (settings.claudeApiKey) {
    candidates.push({ id: 'claude', fn: () => generateWithClaude(prompt, style, numSlides, _config) })
  }
  if (settings.deepseekApiKey) {
    candidates.push({ id: 'deepseek', fn: () => generateWithDeepseek(prompt, style, numSlides, _config) })
  }
  if (settings.ollamaBaseUrl) {
    candidates.push({ id: 'ollama', fn: () => generateWithOllama(prompt, style, numSlides, _config) })
  }
  if (settings.nvidiaApiKey) {
    candidates.push({ id: 'nvidia', fn: () => generateWithNvidia(prompt, style, numSlides, _config) })
  }

  if (candidates.length === 0) {
    console.warn('Auto provider: no configured providers, using mock generator.')
    return generateRealisticMockPresentation(prompt, style, numSlides)
  }

  console.log('Auto provider: trying providers:', candidates.map(c => c.id).join(', '))

  // Try providers in order of preference: Gemini -> Claude -> DeepSeek -> Ollama -> Nvidia
  // We can still use Promise.any but maybe we want to prioritize? 
  // For now, let's keep Promise.any for speed, but if all fail, we fall back to mock.
  const attempts = candidates.map(({ id, fn }) =>
    withTimeout(
      fn().then((result) => {
        console.log(`Provider ${id} succeeded in auto mode.`)
        return result
      }),
      timeoutMs,
      id
    ).catch(err => {
      console.warn(`Provider ${id} failed in auto mode:`, err.message)
      throw err // Re-throw to be caught by Promise.any
    })
  )

  try {
    // @ts-ignore
    return await Promise.any(attempts)
  } catch (error) {
    console.error('Auto provider: all providers failed, using mock generator.', error)
    return generateRealisticMockPresentation(prompt, style, numSlides)
  }
}

