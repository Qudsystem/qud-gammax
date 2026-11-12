import { motion } from 'framer-motion'
import { Sparkle, FileText, FileArrowUp, SquaresFour, CaretRight, ArrowLeft } from '@phosphor-icons/react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

interface CreateAIViewProps {
    onAction: (action: 'generate' | 'paste' | 'import' | 'template') => void
    onBack?: () => void
}

const actions = [
    {
        id: 'generate',
        title: 'Generate',
        description: 'Create a presentation, document or webpage from a single prompt in seconds.',
        icon: Sparkle,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        badge: 'NEW',
        cta: 'Start generating',
        secondaryCta: 'Try an example'
    },
    {
        id: 'paste',
        title: 'Text to deck',
        description: 'Transform your existing notes, documents, or articles into beautiful slides instantly.',
        icon: FileText,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        cta: 'Paste in text'
    },
    {
        id: 'import',
        title: 'Import',
        description: 'Enhance your existing PowerPoint or PDF files with AI-powered layouts and images.',
        icon: FileArrowUp,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        cta: 'Upload file'
    },
    {
        id: 'template',
        title: 'Generate from template',
        description: 'Speed up your workflow with pre-built, AI-optimized structures for any use case.',
        icon: SquaresFour,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        badge: 'BETA',
        cta: 'Pick a template'
    }
]

export function CreateAIView({ onAction, onBack }: CreateAIViewProps) {
    return (
        <div className="min-h-full p-8 lg:p-12 bg-slate-50/50 flex flex-col items-center">
            <div className="max-w-6xl w-full">
                <header className="mb-12 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Create with AI</h1>
                        <p className="text-slate-500 font-medium text-lg">Select a method to start creating your next presentation.</p>
                    </div>
                    {onBack && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full border border-slate-200 hover:bg-slate-100 text-slate-500"
                            onClick={onBack}
                        >
                            <ArrowLeft weight="bold" className="w-5 h-5" />
                        </Button>
                    )}
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {actions.map((action, idx) => (
                        <motion.div
                            key={action.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40 relative group cursor-pointer overflow-hidden flex flex-col justify-between min-h-[320px]"
                            onClick={() => onAction(action.id as any)}
                        >
                            {/* Decorative background glow */}
                            <div className={cn("absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity", action.bgColor)} />

                            <div className="relative z-10 flex-1">
                                <div className="flex items-start justify-between mb-8">
                                    <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-inner", action.bgColor)}>
                                        <action.icon weight="fill" className={cn("w-8 h-8", action.color)} />
                                    </div>
                                    {action.badge && (
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase",
                                            action.badge === 'NEW' ? "bg-indigo-600 text-white" : "bg-purple-100 text-purple-600"
                                        )}>
                                            {action.badge}
                                        </span>
                                    )}
                                </div>

                                <h2 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{action.title}</h2>
                                <p className="text-slate-500 font-medium leading-relaxed max-w-sm">{action.description}</p>
                            </div>

                            <div className="relative z-10 mt-10 flex items-center gap-4">
                                <Button className="h-12 px-8 rounded-xl font-black bg-slate-900 group-hover:bg-blue-600 transition-all text-white shadow-lg active:scale-95">
                                    {action.cta}
                                </Button>
                                {action.secondaryCta && (
                                    <button className="text-sm font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest flex items-center gap-1 group/cta">
                                        {action.secondaryCta}
                                        <CaretRight weight="bold" className="w-3 h-3 group-hover/cta:translate-x-1 transition-transform" />
                                    </button>
                                )}
                            </div>

                            {/* Hover accent line */}
                            <div className={cn("absolute bottom-0 left-0 h-1.5 w-0 group-hover:w-full transition-all duration-500", action.id === 'generate' ? "bg-indigo-600" : action.id === 'paste' ? "bg-emerald-600" : action.id === 'import' ? "bg-blue-600" : "bg-purple-600")} />
                        </motion.div>
                    ))}
                </div>

                <div className="mt-16 p-8 rounded-[2rem] bg-indigo-50/50 border border-indigo-100 flex items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                            <Sparkle weight="fill" className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="font-black text-slate-900">Want to generate something specific or high-stake?</p>
                            <p className="text-sm text-slate-500 font-medium">Try our <span className="text-indigo-600 underline cursor-pointer">Guided Mode</span> for more control over the structure and content.</p>
                        </div>
                    </div>
                    <Button variant="outline" className="h-11 border-indigo-200 text-indigo-600 font-black rounded-xl hover:bg-white shadow-sm">Learn more</Button>
                </div>
            </div>
        </div>
    )
}
