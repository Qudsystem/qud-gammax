import { motion, AnimatePresence } from 'framer-motion'
import { Sparkle, FileText } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export function ImportDropdown({ isOpen, onClose, onSelect }: { isOpen: boolean; onClose: () => void; onSelect?: (id: string) => void }) {
    const options = [
        {
            id: 'ai',
            label: 'AI import',
            description: 'Enhance your content. Add images and layouts, rewrite content, and more',
            icon: Sparkle,
            badge: 'AI'
        },
        {
            id: 'plain',
            label: 'Plain import',
            description: 'Import text and images without changing the content',
            icon: FileText
        }
    ]

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={onClose} />
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 overflow-hidden"
                    >
                        <div className="px-4 py-3 border-b border-slate-50 mb-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Content</span>
                        </div>

                        <div className="space-y-1">
                            {options.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => {
                                        onSelect?.(opt.id)
                                        console.log(`Selected import: ${opt.id}`)
                                        onClose()
                                    }}
                                    className="w-full flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-all text-left group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:border-blue-100 transition-all">
                                        <opt.icon weight="bold" className={cn("w-5 h-5", opt.id === 'ai' ? "text-blue-600" : "text-slate-400")} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-black text-slate-800">{opt.label}</span>
                                            {opt.badge && (
                                                <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-600 text-[9px] font-black uppercase">
                                                    {opt.badge}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] font-medium text-slate-500 leading-snug">
                                            {opt.description}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
