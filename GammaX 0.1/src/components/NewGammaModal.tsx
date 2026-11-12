import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    Presentation,
    FileText,
    Users,
    Globe,
    Selection,
    Monitor,
    DeviceMobile,
    Desktop,
    Plus,
    ArrowSquareOut,
    Sparkle
} from '@phosphor-icons/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { cn } from '@/lib/utils'

interface NewGammaModalProps {
    isOpen: boolean
    onClose: () => void
    onSelect?: (type: string, layout: string) => void
}

export function NewGammaModal({ isOpen, onClose, onSelect }: NewGammaModalProps) {
    const [activeTab, setActiveTab] = useState('presentation')

    const tabs = [
        { id: 'presentation', label: 'Presentation', icon: Presentation },
        { id: 'document', label: 'Document', icon: FileText },
        { id: 'social', label: 'Social', icon: Users },
        { id: 'webpage', label: 'Webpage', icon: Globe },
    ]

    const layouts = {
        presentation: [
            { id: 'fluid', label: 'Default', sub: 'Fluid', icon: Selection, description: 'Flexible height' },
            { id: '16-9', label: 'Traditional', sub: '16:9', icon: Monitor, description: 'Classic widescreen' },
            { id: '4-3', label: 'Tall', sub: '4:3', icon: Desktop, description: 'Standard ratio' },
        ],
        document: [
            { id: 'fluid-doc', label: 'Default', sub: 'Fluid', icon: FileText },
            { id: 'pageless', label: 'Pageless', sub: 'Fluid', icon: Globe },
            { id: 'letter', label: 'Letter', sub: 'US letter', icon: Selection },
            { id: 'a4', label: 'A4', sub: 'A4', icon: Selection },
        ],
        social: [
            { id: 'square', label: 'Square', sub: '1:1', icon: Selection },
            { id: 'portrait', label: 'Portrait', sub: '4:5', icon: DeviceMobile },
            { id: 'stories', label: 'Stories', sub: '9:16', icon: DeviceMobile },
        ],
        webpage: [
            { id: 'standard', label: 'Standard', sub: 'Full width', icon: Globe },
            { id: 'landing', label: 'Landing', sub: 'Sectioned', icon: Selection },
        ]
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl p-0 border-none bg-white rounded-[2rem] shadow-2xl overflow-hidden">
                <div className="flex flex-col h-[700px]">
                    <DialogHeader className="p-8 border-b border-slate-50 relative shrink-0">
                        <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">New gamma</DialogTitle>
                        <button onClick={onClose} className="absolute right-8 top-8 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                            <X weight="bold" className="w-5 h-5" />
                        </button>
                    </DialogHeader>

                    <main className="flex-1 flex overflow-hidden">
                        {/* Sidebar Tabs */}
                        <aside className="w-64 border-r border-slate-50 p-6 space-y-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                                        activeTab === tab.id
                                            ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/50"
                                            : "text-slate-500 hover:bg-slate-50"
                                    )}
                                >
                                    <tab.icon weight={activeTab === tab.id ? "fill" : "bold"} className="w-5 h-5" />
                                    {tab.label}
                                </button>
                            ))}
                        </aside>

                        {/* Content Area */}
                        <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
                            <div className="space-y-12">
                                {/* Blank Options */}
                                <section>
                                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">New blank {activeTab}</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        {layouts[activeTab as keyof typeof layouts].map((layout) => (
                                            <button
                                                key={layout.id}
                                                className="group flex flex-col items-center p-6 rounded-2xl border-2 border-slate-50 hover:border-blue-100 hover:bg-blue-50/20 transition-all text-center"
                                                onClick={() => onSelect?.(activeTab, layout.id)}
                                            >
                                                <div className="w-16 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 group-hover:bg-white group-hover:border-blue-200 transition-all">
                                                    <layout.icon weight="bold" className="w-6 h-6 text-blue-500" />
                                                </div>
                                                <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{layout.label}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">{layout.sub}</span>
                                            </button>
                                        ))}
                                    </div>
                                </section>

                                {/* Workspace Templates */}
                                <section>
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Workspace templates</h3>
                                        <button className="text-[11px] font-black text-slate-500 hover:text-blue-600 flex items-center gap-1">
                                            Manage templates <ArrowSquareOut weight="bold" />
                                        </button>
                                    </div>

                                    <div className="p-12 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/30 flex flex-col items-center text-center">
                                        <div className="relative mb-8">
                                            <motion.div
                                                animate={{ y: [0, -10, 0] }}
                                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                                className="text-8xl"
                                            >
                                                🎈
                                            </motion.div>
                                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-2 bg-slate-900/10 rounded-full blur-sm" />
                                        </div>

                                        <h2 className="text-2xl font-black text-slate-900 mb-2">
                                            Add your first template <span className="ml-2 py-0.5 px-2 bg-indigo-100 text-indigo-600 text-[10px] rounded-md font-black uppercase vertical-middle">BETA</span>
                                        </h2>
                                        <p className="max-w-xs text-sm text-slate-500 font-medium leading-relaxed mb-8">
                                            Create once, reuse forever. Turn any gamma into a reusable workspace template for fast, consistent outputs.
                                        </p>

                                        <Button className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-xl font-black shadow-lg shadow-blue-200">
                                            Manage templates
                                        </Button>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </main>

                    <footer className="p-4 border-t border-slate-50 text-center shrink-0">
                        <p className="text-[11px] font-bold text-slate-400 italic">
                            Tip: type <span className="text-indigo-600 font-black">gamma.new</span> into your browser to quickly make a blank gamma.
                        </p>
                    </footer>
                </div>
            </DialogContent>
        </Dialog>
    )
}
