import React from 'react'
import { motion } from 'framer-motion'
import { Plus, PaintBrush, MagnifyingGlass, ArrowSquareIn, DotsThree } from '@phosphor-icons/react'
import { Button } from './ui/button'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'
import { Input } from './ui/input'
import { cn } from '@/lib/utils'

export function ThemesView({ onEditTheme }: { onEditTheme: (themeId?: string) => void }) {
    const themes = [
        { id: '1', name: 'Pearl', bg: 'bg-white', title: 'text-slate-900', body: 'text-slate-500', link: 'text-blue-600' },
        { id: '2', name: 'Neon', bg: 'bg-slate-900', title: 'text-white', body: 'text-slate-400', link: 'text-blue-400' },
        { id: '3', name: 'Zodiac', bg: 'bg-indigo-950', title: 'text-amber-200', body: 'text-indigo-300', link: 'text-amber-400' },
        { id: '4', name: 'Dune', bg: 'bg-orange-50', title: 'text-orange-900', body: 'text-orange-800/60', link: 'text-orange-600' },
        { id: '5', name: 'Oceanic', bg: 'bg-blue-50', title: 'text-blue-900', body: 'text-blue-700', link: 'text-blue-500' },
        { id: '6', name: 'Stratos', bg: 'bg-slate-950', title: 'text-white', body: 'text-slate-500', link: 'text-indigo-400' },
        { id: '7', name: 'Nova', bg: 'bg-blue-100/50', title: 'text-indigo-900', body: 'text-indigo-800/60', link: 'text-blue-600' },
        { id: '8', name: 'Twilight', bg: 'bg-rose-950', title: 'text-rose-200', body: 'text-rose-300', link: 'text-rose-400' },
        { id: '9', name: 'Ashrose', bg: 'bg-rose-50', title: 'text-rose-900', body: 'text-rose-700/60', link: 'text-rose-600' },
        { id: '10', name: 'Neumorph', bg: 'bg-[#e0e0e0]', title: 'text-slate-800', body: 'text-slate-500', link: 'text-blue-500', isSpecial: 'neumorphic' },
        { id: '11', name: 'Glass', bg: 'bg-gradient-to-br from-indigo-500 to-purple-600', title: 'text-white', body: 'text-white/80', link: 'text-white', isSpecial: 'glass' },
    ]

    // Custom Brand Engine State
    const [activeTab, setActiveTab] = React.useState('standard')
    const [brandColors, setBrandColors] = React.useState({
        primary: '#3b82f6',
        secondary: '#0f172a',
        accent: '#8b5cf6'
    })

    return (
        <div className="p-12 max-w-[1600px] mx-auto">
            <div className="mb-8">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <PaintBrush weight="fill" className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-sm">Themes</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Themes</h1>
                <p className="text-slate-500 mt-2 font-medium">Themes control the colors, fonts, logo, and design of your gammas. Build your own, import a PPT, or customize a standard theme.</p>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-12">
                <div className="flex items-center gap-4">
                    <Button onClick={() => onEditTheme()} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-6 font-black gap-2 shadow-lg shadow-blue-200">
                        <Plus weight="bold" />
                        New theme
                    </Button>
                    <Button variant="outline" className="rounded-xl h-11 px-4 font-bold border-slate-100 text-slate-600 hover:bg-slate-50 gap-2">
                        <ArrowSquareIn weight="bold" className="w-4 h-4" />
                        Import theme
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="bg-slate-100/50 p-1 rounded-xl h-11 border border-slate-100">
                            <TabsTrigger value="custom" className="px-6 rounded-lg text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600">Custom</TabsTrigger>
                            <TabsTrigger value="standard" className="px-6 rounded-lg text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600">Standard</TabsTrigger>
                            <TabsTrigger value="archived" className="px-6 rounded-lg text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600">Archived</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="relative w-72">
                        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                            placeholder="Search themes..."
                            className="pl-10 h-11 rounded-xl bg-slate-100/50 border-slate-100 focus:bg-white"
                        />
                    </div>
                </div>
            </div>

            {activeTab === 'custom' && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-12 bg-slate-50 rounded-[2.5rem] p-12 border border-slate-100"
                >
                    <div className="flex gap-12">
                        {/* Editor Controls */}
                        <div className="w-1/3 space-y-8">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">Brand Engine</h3>
                                <p className="text-slate-500 font-medium text-sm">Define your visual identity. Changes apply in real-time.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Primary Color</label>
                                    <div className="flex gap-3">
                                        <div className="w-12 h-12 rounded-xl shadow-sm border border-black/5" style={{ backgroundColor: brandColors.primary }} />
                                        <Input
                                            value={brandColors.primary}
                                            onChange={(e) => setBrandColors(prev => ({ ...prev, primary: e.target.value }))}
                                            className="font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Secondary Color</label>
                                    <div className="flex gap-3">
                                        <div className="w-12 h-12 rounded-xl shadow-sm border border-black/5" style={{ backgroundColor: brandColors.secondary }} />
                                        <Input
                                            value={brandColors.secondary}
                                            onChange={(e) => setBrandColors(prev => ({ ...prev, secondary: e.target.value }))}
                                            className="font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Accent Color</label>
                                    <div className="flex gap-3">
                                        <div className="w-12 h-12 rounded-xl shadow-sm border border-black/5" style={{ backgroundColor: brandColors.accent }} />
                                        <Input
                                            value={brandColors.accent}
                                            onChange={(e) => setBrandColors(prev => ({ ...prev, accent: e.target.value }))}
                                            className="font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button className="w-full bg-slate-900 text-white rounded-xl h-12 font-bold shadow-xl shadow-slate-200">
                                Save brand theme
                            </Button>
                        </div>

                        {/* Live Preview */}
                        <div className="flex-1 bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden relative p-8 flex flex-col justify-center items-center text-center gap-6" style={{ backgroundColor: '#ffffff' }}>
                            <div className="absolute top-0 left-0 w-full h-2" style={{ background: `linear-gradient(to right, ${brandColors.primary}, ${brandColors.accent})` }} />

                            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg" style={{ backgroundColor: brandColors.primary }}>
                                <span className="text-4xl">✨</span>
                            </div>

                            <h2 className="text-4xl font-black tracking-tight" style={{ color: brandColors.secondary }}>
                                Make it yours.
                            </h2>
                            <p className="text-lg max-w-md font-medium text-slate-500">
                                This is a live preview of your brand theme. <span style={{ color: brandColors.accent, fontWeight: 'bold' }}>Colors apply instantly.</span>
                            </p>

                            <div className="flex gap-4 mt-8">
                                <button className="px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-105" style={{ backgroundColor: brandColors.primary }}>
                                    Primary Button
                                </button>
                                <button className="px-8 py-3 rounded-xl font-bold bg-slate-50 transition-colors hover:bg-slate-100" style={{ color: brandColors.secondary }}>
                                    Secondary
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                {themes.map((theme, i) => (
                    <motion.div
                        key={theme.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group cursor-pointer"
                        onClick={() => onEditTheme(theme.id)}
                    >
                        <div className="aspect-[1.3/1] bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group-hover:shadow-2xl group-hover:-translate-y-2 transition-all p-3">
                            <div className={cn(
                                "w-full h-[75%] rounded-[2rem] p-8 flex flex-col justify-center gap-2 border border-slate-50 overflow-hidden relative transition-all",
                                theme.bg,
                                theme.isSpecial === 'neumorphic' && "shadow-[10px_10px_20px_#bebebe,-10px_-10px_20px_#ffffff] border-none",
                                theme.isSpecial === 'glass' && "backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl"
                            )}>
                                <h3 className={cn("text-2xl font-black tracking-tight", theme.title)}>Title</h3>
                                <p className={cn("text-sm font-bold", theme.body)}>Body & <span className={cn("underline", theme.link)}>link</span></p>

                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-white/20 backdrop-blur-md p-2 rounded-full">
                                        <DotsThree weight="bold" className={cn("w-5 h-5", theme.title)} />
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 flex items-center justify-between">
                                <span className="text-sm font-black text-slate-800">{theme.name}</span>
                                <div className="flex gap-1">
                                    <div className={cn("w-3 h-3 rounded-full border border-slate-200", theme.bg)} />
                                    <div className={cn("w-3 h-3 rounded-full border border-slate-200 opacity-50", theme.bg)} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
