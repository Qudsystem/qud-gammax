import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft,
    CaretDown,
    Shuffle,
    MusicNotes,
    Basketball,
    PencilLine,
    UsersThree,
    TShirt,
    Bank,
    Lightning,
    Plus,
    Question,
    Check,
    Sparkle,
    Microphone
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { loadProviderSettings } from '@/lib/settings'

interface GenerateViewProps {
    onBack: () => void
    isGenerating?: boolean
    onGenerate: (prompt: string, config: { cardCount: number; style: string; language: string; ratio: string; textDensity: string }) => void
}

type DropdownType = 'cards' | 'mode' | 'ratio' | 'language' | null

export function GenerateView({ onBack, onGenerate, isGenerating }: GenerateViewProps) {
    const [activeTab, setActiveTab] = useState<'presentation' | 'document' | 'webpage'>('presentation')
    const [prompt, setPrompt] = useState('')
    const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null)
    const [textDensity, setTextDensity] = useState('minimal')
    const [isListening, setIsListening] = useState(false)
    const [isEnhancing, setIsEnhancing] = useState(false)
    const recognitionRef = useRef<any>(null)

    // Configuration State
    const [cardCount, setCardCount] = useState(10)
    const [mode, setMode] = useState('Default')
    const [ratio, setRatio] = useState('Default')
    const [language, setLanguage] = useState('English')

    const tabs = [
        { id: 'presentation', label: 'Presentation', icon: '📺' },
        { id: 'document', label: 'Document', icon: '📄' },
        { id: 'webpage', label: 'Webpage', icon: '🌐' },
    ] as const

    const examplePrompts = [
        { id: 1, text: 'Exploring the history of jazz music', icon: MusicNotes, color: 'text-blue-600' },
        { id: 2, text: 'The most ridiculous moments in NBA history', icon: Basketball, color: 'text-orange-500' },
        { id: 3, text: 'Marketing research on the skincare industry', icon: PencilLine, color: 'text-blue-500' },
        { id: 4, text: 'Workshops for college students', icon: UsersThree, color: 'text-indigo-600' },
        { id: 5, text: 'Evolution of fashion trends', icon: TShirt, color: 'text-blue-700' },
        { id: 6, text: 'Senior thesis defense', icon: Bank, color: 'text-blue-900' },
    ]

    const densityOptions = [
        { id: 'vibes', label: 'Just vibes', desc: 'Mostly images' },
        { id: 'minimal', label: 'Minimal text', desc: 'Short bullets' },
        { id: 'context', label: 'A little context', desc: 'Standard slides' },
        { id: 'plenty', label: 'Plenty of text', desc: 'Detailed content' },
    ]

    const languages = [
        { id: 'english', label: 'English' },
        { id: 'arabic', label: 'العربية' },
        { id: 'french', label: 'Français' },
        { id: 'spanish', label: 'Español' },
        { id: 'german', label: 'Deutsch' },
        { id: 'japanese', label: '日本語' },
    ]

    const cardOptions = [
        { count: 1, label: '1 card' },
        { count: 2, label: '2 cards' },
        { count: 3, label: '3 cards' },
        { count: 4, label: '4 cards' },
        { count: 5, label: '5 cards' },
        { count: 6, label: '6 cards' },
        { count: 7, label: '7 cards' },
        { count: 8, label: '8 cards' },
        { count: 9, label: '9 cards' },
        { count: 10, label: '10 cards', default: true },
        { count: 15, label: '15 cards', badge: 'PLUS' },
        { count: 20, label: '20 cards', badge: 'PLUS' },
        { count: 25, label: '25 cards', badge: 'PRO' },
        { count: 30, label: '30 cards', badge: 'PRO' },
        { count: 75, label: '75 cards', badge: 'PRO' },
        { count: 100, label: '100 cards', badge: 'PRO' },
    ]

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            if (prompt.trim()) {
                onGenerate(prompt, { cardCount, style: mode, language, ratio, textDensity })
            }
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
        <div className="min-h-screen bg-[#f1f6fc] flex flex-col relative overflow-hidden font-sans" onClick={() => setActiveDropdown(null)}>
            {/* Soft Ambient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-purple-50/20 to-white -z-10 pointer-events-none" />

            {/* Header */}
            <header className="absolute top-8 left-8 z-20">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200/60 rounded-full text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95 group"
                >
                    <ArrowLeft weight="bold" className="group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>
            </header>

            <main className="flex-1 max-w-[1000px] mx-auto w-full px-6 pt-24 pb-32 flex flex-col items-center relative z-10">
                <div className="text-center space-y-3 mb-10">
                    <h1 className="text-[3.5rem] font-black text-slate-800 tracking-tight leading-tight">Generate</h1>
                    <p className="text-slate-500 text-lg font-medium">What would you like to create today?</p>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-white border border-slate-200 rounded-2xl shadow-sm mb-8 w-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-12 py-3 rounded-[0.85rem] transition-all text-sm font-bold min-w-[160px] justify-center",
                                activeTab === tab.id
                                    ? "bg-[#eef6ff] text-blue-600 shadow-sm"
                                    : "text-slate-500 hover:bg-slate-50"
                            )}
                        >
                            {/* <span className="text-lg">{tab.icon}</span> */}
                            <span className="flex items-center">
                                {tab.id === 'presentation' && <div className={cn("w-3.5 h-4 border-2 rounded-sm mr-2.5", activeTab === 'presentation' ? 'border-blue-600 bg-blue-600/20' : 'border-slate-400')} />}
                                {tab.id === 'document' && <div className={cn("w-3 h-4 border-2 rounded-sm mr-2.5 relative after:absolute after:top-0 after:right-0 after:w-1 after:h-1 after:border-l-2 after:border-b-2 after:border-inherit", activeTab === 'document' ? 'border-blue-600 bg-blue-600/20 after:border-blue-600' : 'border-slate-400 after:border-slate-400')} />}
                                {tab.id === 'webpage' && <div className={cn("w-4 h-4 border-2 rounded-full mr-2.5", activeTab === 'webpage' ? 'border-blue-600 bg-blue-600/20' : 'border-slate-400')} />}
                                {tab.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Controls Bar */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-4 w-full relative z-30">

                    {/* Cards Dropdown */}
                    <div className="relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setActiveDropdown(activeDropdown === 'cards' ? null : 'cards')}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-blue-300 transition-all shadow-sm min-w-[110px] justify-between"
                        >
                            <span>{cardCount} cards</span>
                            <CaretDown weight="bold" className="text-slate-400 w-3 h-3" />
                        </button>
                        <AnimatePresence>
                            {activeDropdown === 'cards' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 p-2 min-w-[200px] z-50 max-h-[300px] overflow-y-auto"
                                >
                                    <div className="px-3 py-2 text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
                                        Tip: cards are like slides
                                    </div>
                                    {cardOptions.map(opt => (
                                        <button
                                            key={opt.count}
                                            onClick={() => {
                                                setCardCount(opt.count)
                                                setActiveDropdown(null)
                                            }}
                                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-lg text-sm font-medium text-slate-700"
                                        >
                                            <span className="flex items-center gap-2">
                                                {cardCount === opt.count && <Check weight="bold" className="text-blue-600 w-3 h-3" />}
                                                <span className={cn(cardCount !== opt.count && "pl-5")}>{opt.label}</span>
                                            </span>
                                            {opt.badge && (
                                                <span className={cn(
                                                    "text-[9px] px-1.5 py-0.5 rounded-md font-black text-white",
                                                    opt.badge === 'PLUS' ? "bg-blue-500" : "bg-purple-600"
                                                )}>
                                                    {opt.badge}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Mode Dropdown */}
                    <div className="relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setActiveDropdown(activeDropdown === 'mode' ? null : 'mode')}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-blue-300 transition-all shadow-sm"
                        >
                            <div className="w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded flex items-center justify-center text-[10px] text-white font-serif italic">Tx</div>
                            <span>Studio</span>
                            <span className="text-[9px] px-1 py-0.5 bg-purple-100 text-purple-600 rounded font-black">BETA</span>
                            <CaretDown weight="bold" className="text-slate-400 w-3 h-3" />
                        </button>
                        <AnimatePresence>
                            {activeDropdown === 'mode' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 p-2 w-[280px] z-50"
                                >
                                    <button
                                        onClick={() => { setMode('Default'); setActiveDropdown(null) }}
                                        className="w-full text-left flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors group"
                                    >
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-sm flex-shrink-0" />
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm">Classic</div>
                                            <div className="text-xs text-slate-500 leading-snug">Flexible cards with editable text, images, and layout blocks.</div>
                                        </div>
                                    </button>
                                    <div className="h-px bg-slate-100 my-1" />
                                    <button
                                        onClick={() => { setMode('Studio'); setActiveDropdown(null) }}
                                        className="w-full text-left flex items-start gap-3 p-3 bg-blue-50/50 rounded-xl transition-colors border border-blue-100"
                                    >
                                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg shadow-sm flex-shrink-0 flex items-center justify-center text-white font-serif italic text-lg">Tx</div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-800 text-sm">Studio</span>
                                                <span className="text-[9px] px-1 py-0.5 bg-purple-100 text-purple-600 rounded font-black">BETA</span>
                                            </div>
                                            <div className="text-xs text-slate-500 leading-snug">Every card is a single image with embedded text. Edit by asking AI.</div>
                                        </div>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Ratio/Dimensions */}
                    <div className="relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setActiveDropdown(activeDropdown === 'ratio' ? null : 'ratio')}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-blue-300 transition-all shadow-sm"
                        >
                            <span className="text-slate-400 max-sm:hidden">⛶</span>
                            <span>{ratio}</span>
                            <CaretDown weight="bold" className="text-slate-400 w-3 h-3" />
                        </button>
                        <AnimatePresence>
                            {activeDropdown === 'ratio' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 p-2 min-w-[200px] z-50"
                                >
                                    <div className="px-3 py-2 text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Card size</div>
                                    {[
                                        { label: 'Default', sub: 'Fluid', icon: '⛶' },
                                        { label: 'Traditional', sub: '16:9', icon: '▭' },
                                        { label: 'Tall', sub: '4:3', icon: '▯' },
                                    ].map(opt => (
                                        <button
                                            key={opt.label}
                                            onClick={() => { setRatio(opt.label); setActiveDropdown(null) }}
                                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-lg text-sm font-medium text-slate-700 group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="w-4 text-center text-slate-400 group-hover:text-blue-500">{opt.icon}</span>
                                                <span>{opt.label}</span>
                                            </div>
                                            <span className="text-xs text-slate-400">{opt.sub}</span>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Language */}
                    <div className="relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setActiveDropdown(activeDropdown === 'language' ? null : 'language')}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-blue-300 transition-all shadow-sm"
                        >
                            <span>{language.split(' ')[0]}</span>
                            <span className="text-xs text-slate-400">🌐</span>
                            <CaretDown weight="bold" className="text-slate-400 w-3 h-3" />
                        </button>
                        <AnimatePresence>
                            {activeDropdown === 'language' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 p-2 min-w-[180px] z-50 max-h-[300px] overflow-y-auto"
                                >
                                    <div className="px-3 py-2 text-xs font-black text-slate-400 uppercase tracking-wider mb-1 sticky top-0 bg-white z-10">Language</div>
                                    {languages.map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => { setLanguage(opt.label); setActiveDropdown(null) }}
                                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-lg text-sm font-medium text-slate-700"
                                        >
                                            <span>{opt.label}</span>
                                            {language === opt.label && <Check weight="bold" className="text-blue-600 w-3 h-3" />}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>

                {/* Prompt Input & Density */}
                <div className="w-full relative group mb-12 flex flex-col items-center">
                    <div className="w-full bg-white border border-slate-200 rounded-[1.5rem] shadow-sm focus-within:ring-4 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all overflow-hidden relative">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe what you'd like to make"
                            className="w-full min-h-[140px] p-8 text-xl font-medium placeholder:text-slate-300 outline-none resize-none"
                        />
                        {/* Send Button */}
                        <div className="absolute bottom-4 right-4 flex items-center gap-3">
                            {prompt.length > 0 && <span className="text-xs font-bold text-slate-400 animate-fade-in">Press Enter</span>}
                            <button
                                type="button"
                                onClick={toggleVoice}
                                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md border ${isListening ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                title="Voice input"
                            >
                                <Microphone weight="bold" />
                            </button>
                            <button
                                type="button"
                                disabled={!prompt.trim() || isEnhancing}
                                onClick={enhancePrompt}
                                className="w-10 h-10 bg-white text-slate-700 rounded-full flex items-center justify-center shadow-md border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Enhance prompt"
                            >
                                <Sparkle weight="fill" />
                            </button>
                            <button
                                disabled={!prompt.trim()}
                                onClick={() => prompt.trim() && onGenerate(prompt, { cardCount, style: mode, language, ratio, textDensity })}
                                className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-90"
                            >
                                <Lightning weight="bold" />
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="w-full mt-6">
                        <button
                            disabled={!prompt.trim() || isGenerating}
                            onClick={() => prompt.trim() && onGenerate(prompt, { cardCount, style: mode, language, ratio, textDensity })}
                            className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden"
                        >
                            {isGenerating && (
                                <motion.div
                                    initial={{ x: '-100%' }}
                                    animate={{ x: '100%' }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                                    className="absolute inset-0 bg-white/20"
                                />
                            )}
                            {isGenerating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating Magic...
                                </>
                            ) : (
                                <>
                                    <Sparkle weight="fill" className="animate-pulse" />
                                    Generate Presentation
                                </>
                            )}
                        </button>
                    </div>

                    {/* Density Selector */}
                    <div className="flex gap-2 mt-4 w-full">
                        {densityOptions.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => setTextDensity(opt.id)}
                                className={cn(
                                    "flex-1 p-4 rounded-xl border text-left transition-all relative group",
                                    textDensity === opt.id
                                        ? "bg-white border-blue-500 ring-1 ring-blue-500 shadow-md z-10"
                                        : "bg-white border-slate-200 hover:border-blue-300 text-slate-500"
                                )}
                            >
                                <div className="space-y-1">
                                    <div className="h-1.5 w-12 bg-slate-200 rounded-full mb-2 group-hover:bg-blue-100 transition-colors" />
                                    {/* Mock lines based on density */}
                                    <div className="space-y-1 opacity-50">
                                        {opt.id === 'vibes' && <div className="h-1 w-full bg-slate-100 rounded-full" />}
                                        {opt.id === 'minimal' && <><div className="h-1 w-3/4 bg-slate-200 rounded-full" /><div className="h-1 w-1/2 bg-slate-200 rounded-full" /></>}
                                        {opt.id === 'context' && <><div className="h-1 w-full bg-slate-200 rounded-full" /><div className="h-1 w-5/6 bg-slate-200 rounded-full" /><div className="h-1 w-4/6 bg-slate-200 rounded-full" /></>}
                                        {opt.id === 'plenty' && <><div className="h-1 w-full bg-slate-300 rounded-full" /><div className="h-1 w-full bg-slate-300 rounded-full" /><div className="h-1 w-3/4 bg-slate-300 rounded-full" /><div className="h-1 w-full bg-slate-300 rounded-full" /></>}
                                    </div>
                                    <p className={cn("text-xs font-bold mt-3", textDensity === opt.id ? "text-blue-600" : "text-slate-600")}>{opt.label}</p>
                                </div>
                                {textDensity === opt.id && (
                                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 rounded-t-xl" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Example Prompts */}
                <div className="w-full space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-[1px] flex-1 bg-slate-200/60" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Example prompts</span>
                        <div className="h-[1px] flex-1 bg-slate-200/60" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {examplePrompts.map((example) => (
                            <motion.button
                                key={example.id}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setPrompt(example.text)}
                                className="bg-blue-50/50 p-4 rounded-2xl border border-transparent hover:bg-white hover:border-blue-100 hover:shadow-lg transition-all text-left flex items-start gap-3 group h-full"
                            >
                                <div className={cn("mt-0.5 p-1.5 rounded-lg bg-white shadow-sm", example.color)}>
                                    <example.icon weight="fill" className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-slate-600 leading-relaxed group-hover:text-slate-900 line-clamp-2">
                                    {example.text}
                                </span>
                            </motion.button>
                        ))}
                    </div>

                    <div className="flex justify-center pt-6">
                        <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-full text-xs font-black text-slate-600 hover:shadow-md transition-all active:scale-95 hover:text-blue-600 group">
                            <Shuffle weight="bold" className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                            Shuffle
                        </button>
                    </div>
                </div>
            </main>

            {/* Float Help Button */}
            <button className="fixed bottom-6 right-6 w-10 h-10 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all hover:scale-110 active:scale-95 z-50">
                <Question weight="bold" className="w-5 h-5" />
            </button>
        </div>
    )
}
