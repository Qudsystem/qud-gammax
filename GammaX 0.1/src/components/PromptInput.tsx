import { useRef, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkle, Lightning, Microphone } from '@phosphor-icons/react'
import { PresentationStyle } from '@/lib/types'
import { motion } from 'framer-motion'
import { loadProviderSettings } from '@/lib/settings'

interface PromptInputProps {
    onGenerate: (prompt: string, style: PresentationStyle, numSlides: number) => void
    isGenerating: boolean
}

const examplePrompts = [
    "Create a presentation about climate change solutions for 2024",
    "Marketing strategy for launching a new AI-powered SaaS product",
    "Introduction to quantum computing for business executives",
    "Quarterly business review with growth metrics and future plans",
    "Product design principles for building user-friendly apps",
    "The future of remote work and digital collaboration"
]

const styleDescriptions = {
    minimal: { emoji: '✨', label: 'Minimal', desc: 'Clean & simple' },
    bold: { emoji: '🎨', label: 'Bold', desc: 'High contrast' },
    professional: { emoji: '💼', label: 'Professional', desc: 'Corporate' },
    creative: { emoji: '🎭', label: 'Creative', desc: 'Playful' },
    modern: { emoji: '🏢', label: 'Modern', desc: 'Sleek' },
    glass: { emoji: '🔮', label: 'Glass', desc: 'Frosted' },
    dark: { emoji: '🌙', label: 'Dark', desc: 'High impact' },
    neon: { emoji: '🚀', label: 'Neon', desc: 'Cyberpunk' },
    eco: { emoji: '🌱', label: 'Eco', desc: 'Natural' },
    corporate: { emoji: '🏛️', label: 'Corporate', desc: 'Formal' },
    playful: { emoji: '🎈', label: 'Playful', desc: 'Energetic' },
    brutal: { emoji: '🏗️', label: 'Brutal', desc: 'Bold' },
    retro: { emoji: '📻', label: 'Retro', desc: 'Vintage' },
    tech: { emoji: '💻', label: 'Tech', desc: 'Analytical' },
    gradient: { emoji: '🌈', label: 'Gradient', desc: 'Vibrant' },
    minimalist: { emoji: '🔳', label: 'Minimalist', desc: 'Essential' },
    elegant: { emoji: '🕯️', label: 'Elegant', desc: 'Graceful' },
    dynamic: { emoji: '⚡', label: 'Dynamic', desc: 'Active' },
    clean: { emoji: '🛁', label: 'Clean', desc: 'Light' },
    impact: { emoji: '💥', label: 'Impact', desc: 'Strong' }
}

export function PromptInput({ onGenerate, isGenerating }: PromptInputProps) {
    const [prompt, setPrompt] = useState('')
    const [style, setStyle] = useState<PresentationStyle>('minimal')
    const [numSlides, setNumSlides] = useState(6)
    const [isListening, setIsListening] = useState(false)
    const [isEnhancing, setIsEnhancing] = useState(false)
    const recognitionRef = useRef<any>(null)

    const handleSubmit = () => {
        if (prompt.trim()) {
            onGenerate(prompt, style, numSlides)
        }
    }

    const handleExampleClick = (example: string) => {
        setPrompt(example)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && prompt.trim()) {
            handleSubmit()
        }
    }

    const toggleVoice = () => {
        const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SR) {
            alert('Voice input not supported in this browser.')
            return
        }
        if (isListening) {
            recognitionRef.current?.stop?.()
            setIsListening(false)
            return
        }
        const rec = new SR()
        recognitionRef.current = rec
        rec.continuous = true
        rec.interimResults = true
        rec.lang = (navigator.language || 'ar-EG')
        rec.onresult = (e: any) => {
            let text = ''
            for (let i = e.resultIndex; i < e.results.length; i++) {
                text += e.results[i][0].transcript
            }
            setPrompt((p) => (p ? p + ' ' + text : text))
        }
        rec.onend = () => setIsListening(false)
        setIsListening(true)
        rec.start()
    }

    const enhancePrompt = async () => {
        if (!prompt.trim()) return
        try {
            setIsEnhancing(true)
            const settings = loadProviderSettings()
            const base = (settings.ollamaBaseUrl || 'http://localhost:11434').replace(/\/$/, '')
            if (settings.ollamaBaseUrl) {
                const sys =
                    'Rewrite and expand the user prompt into a concise, detailed presentation brief including objective, audience, scope, deliverables, and 6-10 keywords. Return a single improved line only.'
                const res = await fetch(`${base}/api/chat`, {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                        model: settings.ollamaModel || 'llama3.1',
                        stream: false,
                        messages: [
                            { role: 'system', content: sys },
                            { role: 'user', content: prompt },
                        ],
                    }),
                })
                if (res.ok) {
                    const data = await res.json()
                    const text = data?.message?.content?.trim()
                    if (text) setPrompt(text)
                }
            } else {
                const seed = prompt.trim()
                const improved = `Create a professional presentation brief about "${seed}", specifying target audience, clear objective, 6–10 keywords, expected sections, and visual tone.`
                setPrompt(improved)
            }
        } finally {
            setIsEnhancing(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="p-8 max-w-4xl mx-auto shadow-lg border-2 border-border/50 bg-card/80 backdrop-blur-sm">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label htmlFor="prompt-input" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Lightning className="w-4 h-4 text-primary" weight="fill" />
                                Describe your presentation
                            </label>
                            <Badge variant="secondary" className="text-xs">
                                {prompt.length}/1000
                            </Badge>
                        </div>
                        <Textarea
                            id="prompt-input"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value.slice(0, 1000))}
                            onKeyDown={handleKeyDown}
                            placeholder="e.g., Create a presentation about sustainable energy solutions with data visualizations and case studies..."
                            className="min-h-[140px] text-base resize-none bg-background/50 border-2 focus:border-primary transition-colors"
                            disabled={isGenerating}
                        />
                        <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                                Press <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded border">⌘</kbd> + <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded border">Enter</kbd> to generate
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant={isListening ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={toggleVoice}
                                    className="h-8 px-3"
                                >
                                    <Microphone className="w-4 h-4 mr-1.5" />
                                    {isListening ? 'Listening...' : 'Voice'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={isEnhancing || !prompt.trim()}
                                    onClick={enhancePrompt}
                                    className="h-8 px-3"
                                >
                                    <Sparkle className="w-4 h-4 mr-1.5" />
                                    {isEnhancing ? 'Enhancing...' : 'Enhance'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-semibold text-foreground">
                                Presentation Style
                            </label>
                            <Badge variant="outline" className="text-[10px]">
                                20 Styles Available
                            </Badge>
                        </div>
                        <div className="max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {(Object.keys(styleDescriptions) as PresentationStyle[]).map((styleOption) => {
                                    const info = styleDescriptions[styleOption]
                                    return (
                                        <button
                                            key={styleOption}
                                            onClick={() => setStyle(styleOption)}
                                            disabled={isGenerating}
                                            className={`p-3 rounded-lg border-2 transition-all text-left ${style === styleOption
                                                ? 'border-primary bg-primary/5 shadow-md'
                                                : 'border-border hover:border-primary/50 hover:bg-accent/5'
                                                }`}
                                        >
                                            <div className="text-xl mb-1">{info.emoji}</div>
                                            <div className="text-xs font-semibold text-foreground truncate">{info.label}</div>
                                            <div className="text-[10px] text-muted-foreground line-clamp-1">{info.desc}</div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-foreground">
                                Number of Slides: <span className="text-primary">{numSlides}</span>
                            </label>
                            <div className="flex gap-2">
                                {[6, 10, 20, 50, 75, 100].map(val => (
                                    <Badge
                                        key={val}
                                        variant={numSlides === val ? 'default' : 'outline'}
                                        className="cursor-pointer hover:bg-primary/10"
                                        onClick={() => setNumSlides(val)}
                                    >
                                        {val}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="100"
                            value={numSlides}
                            onChange={(e) => setNumSlides(parseInt(e.target.value))}
                            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={!prompt.trim() || isGenerating}
                        className="w-full h-14 text-base font-semibold bg-gradient-to-r from-primary via-accent to-primary hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl disabled:opacity-50"
                        style={{ backgroundSize: '200% 100%' }}
                        size="lg"
                    >
                        <Sparkle className="w-5 h-5 mr-2" weight="fill" />
                        {isGenerating ? 'Generating...' : 'Generate Presentation with AI'}
                    </Button>

                    <div className="pt-6 border-t border-border">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Try an example
                            </p>
                            <Badge variant="outline" className="text-[10px]">
                                {examplePrompts.length} ideas
                            </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {examplePrompts.map((example, idx) => (
                                <motion.button
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => handleExampleClick(example)}
                                    disabled={isGenerating}
                                    className="text-left text-sm px-4 py-3 rounded-lg bg-secondary/50 hover:bg-secondary text-secondary-foreground transition-all disabled:opacity-50 border border-border/50 hover:border-primary/30 hover:shadow-md"
                                >
                                    <span className="line-clamp-2">{example}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}
