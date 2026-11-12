# Available LLM Models

## Ollama Cloud Models (from screenshot)

These are the free models available on Ollama Cloud:

### Code & Programming
- **gpt-oss:120b-cloud** - Large general-purpose model
- **gpt-oss:20b-cloud** - Medium general-purpose model
- **qwen3-coder:480b-cloud** - Specialized for code generation
- **olm-4.6:cloud** - Open Language Model

### Vision & Multimodal
- **qwen3-vl:235b-cloud** - Vision Language model (text + images)
- **deepseek-v3:1.671b-cloud** - DeepSeek model

### Other Models
- **minimax-m2:cloud** - MiniMax model
- **kimi-k2.5:cloud** - Kimi model

## How to Use

### Option 1: Ollama Local (Free, No API Key)
1. Install Ollama from https://ollama.ai
2. Run: `ollama pull neural-chat` (or any model you like)
3. The app will automatically use localhost:11434

### Option 2: Ollama Cloud (Need API Key)
Add to `.env.local`:
```
VITE_OLLAMA_API_KEY=your-ollama-cloud-api-key
VITE_OLLAMA_ENDPOINT=https://api.ollama.cloud
```

Then use any of the cloud models above.

### Option 3: OpenAI API (Fallback)
Add to `.env.local`:
```
VITE_API_KEY=sk-your-openai-key
```

## Model Selection in Code

In `src/lib/aiGenerator.ts`, you can change the model:
```typescript
const response = await callLLM(systemPrompt, 'gpt-oss:120b-cloud', true)
```

Or use environment variable:
```
VITE_DEFAULT_MODEL=qwen3-coder:480b-cloud
```

## Performance Notes

- **gpt-oss:120b-cloud**: Best quality, slower
- **gpt-oss:20b-cloud**: Good balance
- **qwen3-coder:480b-cloud**: Best for coding tasks
- **qwen3-vl:235b-cloud**: For tasks requiring image understanding
