import { motion } from 'framer-motion'
import { Slide, PresentationStyle } from '@/lib/types'
import { cn } from '@/lib/utils'
import { List, Selection, CheckCircle } from '@phosphor-icons/react'

interface SlideOutlineProps {
    slides: Slide[]
    currentSlideIndex: number
    onSelectSlide: (index: number) => void
    style: PresentationStyle
}

export function SlideOutline({ slides, currentSlideIndex, onSelectSlide }: SlideOutlineProps) {
    return (
        <div className="flex flex-col h-full bg-white border-r border-slate-100 w-64 shrink-0">
            <div className="p-4 border-b border-slate-50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <List weight="bold" className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Outline</span>
                </div>
                <Selection weight="bold" className="w-4 h-4 text-slate-300 hover:text-blue-600 cursor-pointer" />
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {slides.map((slide, idx) => (
                    <motion.div
                        key={slide.id}
                        onClick={() => onSelectSlide(idx)}
                        className={cn(
                            "group flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer relative",
                            currentSlideIndex === idx
                                ? "bg-blue-50/50 shadow-sm border border-blue-100"
                                : "hover:bg-slate-50 border border-transparent"
                        )}
                    >
                        <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                            <span className={cn(
                                "text-[10px] font-black",
                                currentSlideIndex === idx ? "text-blue-600" : "text-slate-300 group-hover:text-slate-500"
                            )}>
                                {idx + 1}
                            </span>
                            {currentSlideIndex === idx && (
                                <div className="w-1 h-1 rounded-full bg-blue-600" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className={cn(
                                    "text-xs font-black truncate leading-tight",
                                    currentSlideIndex === idx ? "text-slate-900" : "text-slate-500"
                                )}>
                                    {slide.title || 'Untitled Slide'}
                                </h4>
                                {idx === 0 && <CheckCircle weight="fill" className="text-emerald-500 w-3 h-3" />}
                            </div>

                            {/* Small Card Placeholder Preview */}
                            <div className={cn(
                                "w-full aspect-[16/10] rounded-lg border flex flex-col gap-1 p-1.5 transition-all overflow-hidden",
                                currentSlideIndex === idx
                                    ? "bg-white border-blue-200"
                                    : "bg-slate-50 border-slate-100 group-hover:border-slate-200"
                            )}>
                                <div className="w-3/4 h-1 bg-slate-200 rounded-full" />
                                <div className="w-full h-0.5 bg-slate-100 rounded-full" />
                                <div className="w-5/6 h-0.5 bg-slate-100 rounded-full" />
                                <div className="w-2/3 h-0.5 bg-slate-100 rounded-full pt-2" />

                                <div className="mt-auto flex justify-between items-center">
                                    <div className="w-2 h-2 rounded bg-slate-100" />
                                    {slide.imageUrl && (
                                        <div className="w-6 h-4 rounded bg-slate-200" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Drag Handle (Hover) */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <List weight="bold" className="text-slate-300 w-3 h-3 cursor-grab active:cursor-grabbing" />
                        </div>
                    </motion.div>
                ))}

                <button className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50/20 transition-all text-xs font-black uppercase tracking-widest mt-4">
                    <span className="text-lg">+</span> Add Slide
                </button>
            </div>

            <div className="p-4 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{slides.length} SLIDES</span>
                <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">SAVED</span>
                </div>
            </div>
        </div>
    )
}
