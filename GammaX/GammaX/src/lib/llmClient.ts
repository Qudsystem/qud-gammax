// LLM Client that handles GitHub Spark, OpenAI API, and Ollama

export async function callLLM(prompt: string, model: string = 'gpt-4o', streaming: boolean = false): Promise<string> {
  // Try GitHub Spark first
  if (window.spark && typeof window.spark.llm === 'function') {
    try {
      console.log('🔗 Using GitHub Spark API...')
      const response = await window.spark.llm(prompt, model, streaming)
      
      // Validate response
      if (!response || typeof response !== 'string') {
        throw new Error('Invalid response from Spark: expected string')
      }
      
      console.log('✅ Spark API returned valid response')
      return response
    } catch (sparkError) {
      console.warn('⚠️ GitHub Spark failed, falling back to Ollama/OpenAI:', sparkError)
    }
  }

  // Try Ollama Local first (free, no API key needed)
  try {
    console.log('🔍 Trying Ollama Local API...')
    return await callOllamaAPI(prompt, model, 'http://localhost:11434')
  } catch (localError) {
    console.warn('⚠️ Ollama Local model not found, trying with llama2:', localError)
    // Fallback to llama2 if the requested model isn't available
    try {
      return await callOllamaAPI(prompt, 'llama2', 'http://localhost:11434')
    } catch (fallbackError) {
      console.warn('⚠️ Ollama Local completely failed:', fallbackError)
    }
  }

  // Try Ollama Cloud/Custom endpoint (if configured)
  const ollamaKey = import.meta.env.VITE_OLLAMA_API_KEY
  const ollamaEndpoint = import.meta.env.VITE_OLLAMA_ENDPOINT
  
  if (ollamaKey && ollamaEndpoint) {
    try {
      console.log('🔗 Using Ollama Cloud/Custom endpoint:', ollamaEndpoint)
      return await callOllamaAPI(prompt, model, ollamaEndpoint, ollamaKey)
    } catch (cloudError) {
      console.warn('⚠️ Ollama Cloud/Custom endpoint failed:', cloudError)
    }
  }

  // Fallback to OpenAI API
  console.log('🔄 Falling back to OpenAI API...')
  return await callOpenAIAPI(prompt, model)
}

// Unified Ollama API (supports both local and cloud)
async function callOllamaAPI(
  prompt: string,
  model: string,
  endpoint: string,
  apiKey?: string
): Promise<string> {
  try {
    console.log(`🔄 Using Ollama API (${endpoint}) with model: ${model}`)
    
    // Map models to Ollama Cloud equivalents
    const modelMap: Record<string, string> = {
      // Standard OpenAI models mapping to Ollama Cloud
      'gpt-4o': 'gpt-oss:120b-cloud',
      'gpt-4o-mini': 'qwen3-coder:480b-cloud',
      'gpt-3.5-turbo': 'ollama/neural-chat',
      
      // Ollama Cloud models (available from the list)
      'gpt-oss:120b-cloud': 'gpt-oss:120b-cloud',
      'gpt-oss:20b-cloud': 'gpt-oss:20b-cloud',
      'deepseek-v3:1.671b-cloud': 'deepseek-v3:1.671b-cloud',
      'qwen3-coder:480b-cloud': 'qwen3-coder:480b-cloud',
      'qwen3-vl:235b-cloud': 'qwen3-vl:235b-cloud',
      'minimax-m2:cloud': 'minimax-m2:cloud',
      'olm-4.6:cloud': 'olm-4.6:cloud',
      'kimi-k2.5:cloud': 'kimi-k2.5:cloud',
      
      // Fallback for local Ollama
      'neural-chat': 'neural-chat',
      'mistral': 'mistral',
      'llama2': 'llama2'
    }
    
    const ollamaModel = modelMap[model] || 'gpt-oss:120b-cloud'
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`
    }
    
    const response = await fetch(`${endpoint}/api/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: ollamaModel,
        prompt: prompt,
        stream: false,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ Ollama API response error:', error)
      throw new Error(`Ollama API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    const content = data.response || data.text

    // Validate response content
    if (!content || typeof content !== 'string') {
      throw new Error('No valid response content from Ollama API')
    }

    if (content.trim().length === 0) {
      throw new Error('Empty response from Ollama API')
    }

    console.log('✅ Ollama API returned valid response')
    return content
  } catch (error) {
    console.error(`❌ Ollama API call failed (${endpoint}):`, error)
    throw error
  }
}

async function callOpenAIAPI(prompt: string, model: string): Promise<string> {
  const apiKey = import.meta.env.VITE_API_KEY
  
  if (!apiKey || apiKey === 'REDACTED_BY_QUDSYSTEM_SECRET_GUARD') {
    throw new Error('No valid API key configured. Please configure Ollama or OpenAI API in .env.local')
  }

  try {
    console.log('🔗 Using OpenAI API with model:', model)
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant providing JSON responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      const errorMessage = errorData.error?.message || response.statusText
      console.error('❌ OpenAI API error response:', errorMessage)
      throw new Error(`OpenAI API error: ${errorMessage}`)
    }

    const data = await response.json()
    
    // Validate response structure
    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      throw new Error('Invalid response structure from OpenAI API: missing choices')
    }
    
    const content = data.choices[0]?.message?.content

    if (!content || typeof content !== 'string') {
      throw new Error('No valid response content from OpenAI API')
    }

    if (content.trim().length === 0) {
      throw new Error('Empty response from OpenAI API')
    }

    console.log('✅ OpenAI API returned valid response')
    return content
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ OpenAI API call failed:', errorMsg)
    throw error
  }
}
