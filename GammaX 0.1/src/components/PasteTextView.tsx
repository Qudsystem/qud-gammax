import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft,
    Presentation,
    Globe,
    FileText,
    DeviceMobile,
    CaretDown,
    Check,
    ListBullets,
    FileText as FileIcon,
    Lock,
    Question,
    Robot,
    ArrowRight
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface PasteTextViewProps {
    onBack: () => void
    isGenerating?: boolean
    onContinue: (content: string, mode: string) => void
}

type TabType = 'presentation' | 'webpage' | 'document' | 'social'

export function PasteTextView({ onBack, onContinue, isGenerating }: PasteTextViewProps) {
    const [activeTab, setActiveTab] = useState<TabType>('presentation')
    const [content, setContent] = useState('')
    const [mode, setMode] = useState('generate')
    const [cardSize, setCardSize] = useState('Portrait')
    const [showCardSize, setShowCardSize] = useState(false)

    const tabs = [
        { id: 'presentation', label: 'Presentation', icon: Presentation },
        { id: 'webpage', label: 'Webpage', icon: Globe },
        { id: 'document', label: 'Document', icon: FileText },
        { id: 'social', label: 'Social', icon: DeviceMobile },
    ] as const

    const cardSizes = [
        { label: 'Square', ratio: '1:1', icon: '◻️' },
        { label: 'Portrait', ratio: '4:5', icon: '▯' },
        { label: 'Stories', ratio: '9:16', icon: '📱' },
    ]

    return (
        <div className="min-h-screen bg-[#f1f6fc] flex flex-col relative overflow-hidden font-sans" onClick={() => setShowCardSize(false)}>
            {/* Background */}
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

            <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 pt-16 pb-32 flex flex-col items-center">

                {/* Title Section */}
                <div className="text-center space-y-4 mb-8">
                    <div className="flex items-center justify-center gap-3 text-blue-600 mb-2">
                        <FileText weight="fill" className="w-8 h-8" />
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Paste in text</h1>
                    </div>
                    <p className="text-slate-500 font-medium text-lg">What would you like to create?</p>
                </div>

                {/* Tabs */}
                <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm flex gap-1 mb-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-bold text-sm min-w-[140px] justify-center relative",
                                activeTab === tab.id
                                    ? "bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100"
                                    : "text-slate-500 hover:bg-slate-50"
                            )}
                        >
                            {activeTab === tab.id && (
                                <div className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full" />
                            )}
                            <tab.icon weight={activeTab === tab.id ? "fill" : "bold"} className="w-5 h-5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Configuration Dropdown (Dynamic) */}
                <div className="mb-8 relative z-30 h-10">
                    {activeTab === 'social' ? (
                        <div className="relative" onClick={e => e.stopPropagation()}>
                            <button
                                onClick={() => setShowCardSize(!showCardSize)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:border-blue-300 transition-all shadow-sm min-w-[140px] justify-between"
                            >
                                <span className="flex items-center gap-2">
                                    <DeviceMobile weight="bold" />
                                    {cardSize}
                                </span>
                                <CaretDown weight="bold" className="text-slate-400" />
                            </button>
                            <AnimatePresence>
                                {showCardSize && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 p-2 min-w-[200px]"
                                    >
                                        <div className="px-3 py-2 text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Card size</div>
                                        {cardSizes.map(size => (
                                            <button
                                                key={size.label}
                                                onClick={() => { setCardSize(size.label); setShowCardSize(false) }}
                                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-lg text-sm font-medium text-slate-700"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <span>{size.icon}</span>
                                                    {size.label}
                                                </span>
                                                <span className="text-xs text-slate-400">{size.ratio}</span>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm min-w-[140px] justify-between cursor-default">
                            <span className="flex items-center gap-2">
                                <span className="text-slate-400">⛶</span>
                                Default
                            </span>
                            <CaretDown weight="bold" className="text-slate-400" />
                        </button>
                    )}
                </div>

                <div className="w-full max-w-5xl flex gap-8 items-start">
                    {/* Main Text Area */}
                    <div className="flex-1 space-y-4">
                        <label className="text-slate-500 font-medium ml-1">Paste in the notes, outline or text content you'd like to use</label>
                        <div className="relative group">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Type or paste in content here"
                                className="w-full h-[400px] bg-white border border-slate-200 rounded-2xl p-6 text-lg font-medium placeholder:text-slate-300 focus:ring-4 focus:ring-blue-50 focus:border-blue-300 outline-none shadow-sm transition-all resize-none"
                            />
                            {content.length > 0 && (
                                <div className="absolute bottom-4 right-4 text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 animate-fade-in">
                                    <Robot weight="bold" />
                                    AI Ready
                                </div>
                            )}
                        </div>

                        {/* Action Mode */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-1 shadow-sm mt-8">
                            <div className="bg-blue-50/50 border-b border-blue-100 p-4 rounded-t-xl mb-1">
                                <h3 className="font-bold text-slate-700 text-sm">What do you want to do with this content?</h3>
                            </div>
                            <div className="p-2 space-y-1">
                                <button
                                    onClick={() => setMode('generate')}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 rounded-xl transition-all text-left",
                                        mode === 'generate' ? "bg-blue-50 border border-blue-200" : "hover:bg-slate-50 border border-transparent"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", mode === 'generate' ? "border-blue-600" : "border-slate-300")}>
                                            {mode === 'generate' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                                <ListBullets />
                                                Generate from notes or an outline
                                            </div>
                                            <div className="text-slate-500 text-xs pl-6">Turn rough ideas, bullet points, or outlines into beautiful content</div>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setMode('summarize')}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 rounded-xl transition-all text-left",
                                        mode === 'summarize' ? "bg-blue-50 border border-blue-200" : "hover:bg-slate-50 border border-transparent"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", mode === 'summarize' ? "border-blue-600" : "border-slate-300")}>
                                            {mode === 'summarize' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                                <FileIcon />
                                                Summarize long text or document
                                            </div>
                                            <div className="text-slate-500 text-xs pl-6">Great for condensing detailed content into something more presentable</div>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setMode('preserve')}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 rounded-xl transition-all text-left",
                                        mode === 'preserve' ? "bg-blue-50 border border-blue-200" : "hover:bg-slate-50 border border-transparent"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", mode === 'preserve' ? "border-blue-600" : "border-slate-300")}>
                                            {mode === 'preserve' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                                <Lock />
                                                Preserve this exact text
                                            </div>
                                            <div className="text-slate-500 text-xs pl-6">Create using your text, exactly as you've written it</div>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Continue Button */}
                        <button
                            disabled={!content.trim() || isGenerating}
                            onClick={() => onContinue(content, mode)}
                            className="w-full py-4 bg-blue-600 disabled:bg-blue-200 disabled:cursor-not-allowed text-white rounded-full font-bold shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 mt-6 relative overflow-hidden"
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Continue to prompt editor
                                    <ArrowRight weight="bold" />
                                </>
                            )}
                        </button>

                        <div className="text-center">
                            <span className="text-slate-500 text-sm">You can also </span>
                            <button className="text-slate-700 font-bold underline text-sm hover:text-blue-600">Import files</button>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="w-80 bg-blue-50/50 rounded-2xl border border-blue-100 p-6 self-stretch hidden lg:block">
                        <div className="flex items-start gap-3 mb-4">
                            <Robot className="w-6 h-6 text-blue-500 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">Optional: card-by-card control</h4>
                                <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                                    Know what you want on each card? Add three dashes <code className="bg-white px-1 rounded text-blue-600 border border-blue-100">---</code> between each section.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Example:</p>
                            <div className="space-y-2 text-xs text-slate-600 font-mono">
                                <div className="opacity-50">Intro to our new strategy</div>
                                <div className="pl-2 border-l-2 border-blue-200">
                                    <div>• Key point 1</div>
                                    <div>• Key point 2</div>
                                </div>
                                <div className="text-center text-blue-300 font-bold py-1">---</div>
                                <div className="opacity-50">Key metrics from Q1</div>
                                <div className="pl-2 border-l-2 border-blue-200">
                                    <div>• Metric A</div>
                                    <div>• Metric B</div>
                                </div>
                                <div className="text-center text-blue-300 font-bold py-1">---</div>
                                <div className="opacity-50">Next steps + ownership</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Float Help Button */}
            <button className="fixed bottom-8 right-8 w-12 h-12 bg-white rounded-full shadow-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all hover:scale-110 active:scale-95 z-50">
                <Question weight="bold" className="w-6 h-6" />
            </button>
        </div>
    )
}
