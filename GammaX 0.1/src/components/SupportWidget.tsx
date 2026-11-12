import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChatCircleText,
    X,
    PaperPlaneTilt,
    MagnifyingGlass,
    CaretRight,
    Question,
    ChatDots
} from '@phosphor-icons/react'
import { Input } from './ui/input'

export function SupportWidget() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="fixed bottom-8 right-8 z-[100]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-20 right-0 w-[380px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-[#003B95] p-8 pb-12 text-white relative">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X weight="bold" />
                            </button>
                            <div className="flex -space-x-3 mb-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full bg-slate-300 border-2 border-[#003B95] overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?u=${i}`} alt="Avatar" />
                                    </div>
                                ))}
                            </div>
                            <h3 className="text-2xl font-black tracking-tight mb-1">مرحباً 👋</h3>
                            <p className="text-white/70 text-sm font-medium">كيف يمكننا مساعدتك اليوم؟</p>
                        </div>

                        {/* Content */}
                        <div className="-mt-6 mx-4 space-y-4 relative z-10 pb-6">
                            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-50 space-y-4">
                                <h4 className="text-sm font-black text-slate-800 text-right">أطرح سؤالاً</h4>
                                <p className="text-xs text-slate-400 font-medium text-right leading-relaxed">يمكن للروبوت وفريق العمل لدينا مساعدتك في أي وقت.</p>

                                <div className="relative">
                                    <Input
                                        placeholder="رسالتك هنا..."
                                        className="h-12 bg-slate-50 border-none rounded-xl pr-12 text-right font-medium"
                                    />
                                    <PaperPlaneTilt weight="fill" className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600" />
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-50 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                        <MagnifyingGlass weight="bold" />
                                    </div>
                                    <h4 className="text-sm font-black text-slate-800 text-right">البحث عن مساعدة</h4>
                                </div>

                                <div className="space-y-1">
                                    {[
                                        'Upgrading your Gamma subscription',
                                        'How do I manage or cancel my subscription?',
                                        'How do I create & publish a site in Gamma?',
                                        'How do I create a new presentation, document, or webpage in Gamma?'
                                    ].map((q, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group cursor-pointer">
                                            <CaretRight weight="bold" className="w-3 h-3 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                            <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 text-right transition-colors">{q}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button className="flex flex-col items-center justify-center p-4 bg-white rounded-3xl shadow-lg border border-slate-50 hover:bg-slate-50 transition-colors group">
                                    <ChatDots weight="fill" className="text-blue-600 w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black text-slate-600">الرسائل</span>
                                </button>
                                <button className="flex flex-col items-center justify-center p-4 bg-white rounded-3xl shadow-lg border border-slate-50 hover:bg-slate-50 transition-colors group">
                                    <Question weight="fill" className="text-blue-600 w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black text-slate-600">الصفحة الرئيسية</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 rounded-full bg-[#003B95] text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-blue-900/40 relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }}>
                            <X weight="bold" className="w-8 h-8" />
                        </motion.div>
                    ) : (
                        <motion.div key="chat" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <ChatCircleText weight="fill" className="w-8 h-8" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </button>
        </div>
    )
}
