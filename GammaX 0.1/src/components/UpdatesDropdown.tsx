import { motion } from 'framer-motion'
import {
    Sparkle,
    Globe,
    Monitor,
    TrendUp,
    Rss,
    Eye,
    CaretRight
} from '@phosphor-icons/react'

interface UpdatesDropdownProps {
    isOpen: boolean
    onClose: () => void
}

export function UpdatesDropdown({ isOpen, onClose }: UpdatesDropdownProps) {
    if (!isOpen) return null

    const updates = [
        {
            type: 'NEW',
            title: 'Adaptive theme logos',
            desc: 'Ever wish your logo looked just as good on cards with light and dark backgrounds? Now you can...',
            icon: Sparkle,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-50'
        },
        {
            type: 'NEW',
            title: 'Make your Gamma site discoverable',
            desc: 'Want your site to show up in search results? Now you can enable Indexing to help people...',
            icon: Globe,
            color: 'text-blue-500',
            bgColor: 'bg-blue-50'
        },
        {
            type: 'IMPROVED',
            title: 'Studio mode powered by Banana Pro',
            desc: 'Studio mode now runs on Nano Banana Pro HD with completely new prompting under the...',
            icon: Monitor,
            color: 'text-indigo-500',
            bgColor: 'bg-indigo-50'
        }
    ]

    return (
        <>
            <div className="fixed inset-0 z-[60]" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute top-16 right-8 w-[400px] bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-[70] overflow-hidden"
            >
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="font-black text-slate-900 tracking-tight">Latest Updates</h3>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded-lg">
                        <TrendUp weight="bold" className="w-3 h-3 text-blue-600" />
                        <span className="text-[10px] font-black text-blue-600 uppercase">What's New</span>
                    </div>
                </div>

                <div className="overflow-y-auto max-h-[500px] custom-scrollbar">
                    {updates.map((update, idx) => (
                        <div key={idx} className="p-6 hover:bg-slate-50 cursor-pointer transition-colors group">
                            <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-xl ${update.bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                    <update.icon weight="fill" className={`w-5 h-5 ${update.color}`} />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${update.bgColor} ${update.color} tracking-widest`}>
                                            {update.type}
                                        </span>
                                        <h4 className="text-sm font-black text-slate-800 line-clamp-1">{update.title}</h4>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-2">{update.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-slate-50/50 flex items-center justify-between px-6 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-slate-400">
                        <div className="flex items-center gap-1 text-[10px] font-bold hover:text-blue-600 transition-colors cursor-pointer">
                            <Rss weight="bold" /> RSS
                        </div>
                        <div className="w-1 h-1 bg-slate-200 rounded-full" />
                        <p className="text-[10px] font-bold">Powered by Canny</p>
                    </div>
                    <button className="flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-blue-600 transition-colors">
                        See all changes <CaretRight weight="bold" />
                    </button>
                </div>
            </motion.div>
        </>
    )
}
