import { callLLM } from './llmClient'

export async function generateImageUrl(prompt: string): Promise<string> {
  try {
    // Validate input
    if (!prompt || prompt.trim().length === 0) {
      console.warn('⚠️ Empty image prompt, using placeholder')
      return getPlaceholderImage(prompt)
    }

    const apiKey = import.meta.env.VITE_API_KEY
    const stabilityKey = import.meta.env.VITE_STABILITY_API_KEY
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY
    const replicateKey = import.meta.env.VITE_REPLICATE_API_TOKEN

    console.log('🖼️ Generating image for prompt:', prompt.substring(0, 50) + '...')
    
    try {
      const enhancedPrompt = await callLLM(
        `Generate a simple, professional image description for a presentation slide about: ${prompt}. Focus on clean, modern visuals. Keep it under 100 words.`,
        'qwen3-coder:480b-cloud'
      )
      
      if (!enhancedPrompt || enhancedPrompt.trim().length === 0) {
        throw new Error('Empty enhanced prompt from LLM')
      }
      
      const cleanPrompt = enhancedPrompt.replace(/[^a-zA-Z0-9\s,.-]/g, ' ').trim()
      
      if (cleanPrompt.length === 0) {
        throw new Error('Clean prompt is empty')
      }

      // Provider priority: Stability -> OpenAI -> Replicate -> Pollinations
      if (stabilityKey) {
        const resp = await fetch('https://api.stability.ai/v2beta/stable-image/generate/ultra', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${stabilityKey}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt: `${cleanPrompt}. Minimal, presentation-friendly, 16:9 aspect`,
            output_format: 'webp',
            aspect_ratio: '16:9'
          })
        })
        if (resp.ok) {
          const data = await resp.json()
          const b64 = data?.image?.base64 || data?.images?.[0]?.base64
          if (b64) {
            return `data:image/webp;base64,${b64}`
          }
        }
      }

      if (openaiKey) {
        const resp = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-image-1',
            prompt: `${cleanPrompt}. Minimal, presentation-friendly, 16:9 aspect`,
            size: '1792x1024'
          })
        })
        if (resp.ok) {
          const data = await resp.json()
          const url = data?.data?.[0]?.url
          if (url) return url
          const b64 = data?.data?.[0]?.b64_json
          if (b64) return `data:image/png;base64,${b64}`
        }
      }

      if (replicateKey) {
        const resp = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-1-schnell/predictions', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${replicateKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            input: {
              prompt: `${cleanPrompt}. Minimal, presentation-friendly`,
              aspect_ratio: '16:9'
            }
          })
        })
        if (resp.ok) {
          const data = await resp.json()
          const url = data?.output?.[0]
          if (url) return url
        }
      }

      // Pollinations fallback
      const urlPrompt = encodeURIComponent(cleanPrompt.slice(0, 200))
      const seed = Math.floor(Math.random() * 1000000)
      const imageUrl = `https://image.pollinations.ai/prompt/${urlPrompt}?width=1920&height=1080&seed=${seed}&nologo=true`
      if (imageUrl && imageUrl.startsWith('https://')) {
        console.log('✅ Image URL generated via fallback')
        return imageUrl
      }
      throw new Error('Invalid image URL generated')
    } catch (llmError) {
      console.warn('⚠️ Failed to enhance prompt with LLM, using original:', llmError)
      // Fallback to using the original prompt
      const cleanPrompt = prompt.replace(/[^a-zA-Z0-9\s,.-]/g, ' ').trim().slice(0, 200)
      const urlPrompt = encodeURIComponent(cleanPrompt)
      const seed = Math.floor(Math.random() * 1000000)
      return `https://image.pollinations.ai/prompt/${urlPrompt}?width=1920&height=1080&seed=${seed}&nologo=true`
    }
  } catch (error) {
    console.error('❌ Failed to generate image, using placeholder:', error)
    return getPlaceholderImage(prompt)
  }
}

export function getPlaceholderImage(topic: string, width: number = 1920, height: number = 1080): string {
  const colors = [
    '6366f1,8b5cf6',
    '8b5cf6,d946ef',
    '3b82f6,06b6d4',
    'f59e0b,ef4444',
    '10b981,06b6d4'
  ]
  
  const color = colors[Math.floor(Math.random() * colors.length)]
  const seed = Math.abs(topic.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0))
  
  const placeholderUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundColor=${color}&width=${width}&height=${height}`
  console.log('🎨 Using placeholder image:', placeholderUrl)
  
  return placeholderUrl
}
