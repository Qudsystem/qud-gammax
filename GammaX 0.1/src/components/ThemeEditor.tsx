import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Palette,
    TextT,
    Image as ImageIcon,
    Selection,
    Layout,
    X,
    Check,
    CloudArrowUp,
    CaretDown,
    ArrowCounterClockwise,
    PencilSimple,
    Info,
    Circle,
    Plus
} from '@phosphor-icons/react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { cn } from '@/lib/utils'

export function ThemeEditor({ onClose }: { onClose: () => void }) {
    const [activeTab, setActiveTab] = useState('colors')
    const [designSubTab, setDesignSubTab] = useState('cards')
    const [imagesSubTab, setImagesSubTab] = useState('ai')
    const [themeName, setThemeName] = useState('Untitled theme')

    const sidebarTabs = [
        { id: 'colors', label: 'Colors', icon: Palette },
        { id: 'fonts', label: 'Fonts', icon: TextT },
        { id: 'logo', label: 'Logo', icon: ImageIcon },
        { id: 'design', label: 'Design', icon: Selection },
        { id: 'images', label: 'Images', icon: ImageIcon },
    ]

    const accentShapes = [
        { id: 'full', path: 'M4 4h24v24H4z' },
        { id: 'top-left', path: 'M28 4v24H4V16C4 9.373 9.373 4 16 4h12z' },
        { id: 'top-right', path: 'M4 4h12c6.627 0 12 5.373 12 11.333V28H4V4z' },
        { id: 'bottom-left', path: 'M4 4h24v12c0 6.627-5.373 12-12 12H4V4z' },
        { id: 'bottom-right', path: 'M4 4h24v24H16c-6.627 0-12-5.373-12-12V4z' },
        { id: 'rounded', path: 'M4 16C4 9.373 9.373 4 16 4s12 5.373 12 12-5.373 12-12 12-12-5.373-12-12z' }
    ]

    const aiExamples = [
        { id: 1, title: 'The golden gate bridge', tags: 'photo, professional, photography, warm lighting', url: 'https://picsum.photos/seed/gate1/400/400' },
        { id: 2, title: 'The golden gate bridge', tags: 'abstract shapes, illustration, playful, fun modern', url: 'https://picsum.photos/seed/gate2/400/400' },
        { id: 3, title: 'The golden gate bridge', tags: 'claymation style, clay sculpture, 3D render', url: 'https://picsum.photos/seed/gate3/400/400' },
    ]

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden font-sans">
            {/* Header */}
            <header className="h-16 border-b border-slate-100 flex items-center justify-between px-8 bg-white z-10 shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <X weight="bold" className="w-5 h-5" />
                    </Button>
                    <div className="h-6 w-[1px] bg-slate-100 mx-2" />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 group">
                            <input
                                value={themeName}
                                onChange={(e) => setThemeName(e.target.value)}
                                className="text-lg font-black bg-transparent border-none p-0 focus:ring-0 w-auto min-w-[100px]"
                            />
                            <PencilSimple className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">0 gammas are using this theme</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={onClose} className="font-bold text-slate-600 rounded-xl hover:bg-slate-50">Cancel</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 font-black shadow-lg shadow-blue-200" onClick={onClose}>
                        Save theme
                    </Button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <aside className="w-80 border-r border-slate-100 flex flex-col bg-white overflow-hidden">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                        <div className="p-6 shrink-0">
                            <TabsList className="flex flex-col h-auto bg-transparent border-none gap-2 p-0">
                                {sidebarTabs.map((tab) => (
                                    <TabsTrigger
                                        key={tab.id}
                                        value={tab.id}
                                        className={cn(
                                            "w-full flex items-center justify-start gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all border-2",
                                            activeTab === tab.id
                                                ? "bg-blue-50 text-blue-600 border-blue-100"
                                                : "text-slate-500 border-transparent hover:bg-slate-50"
                                        )}
                                    >
                                        <tab.icon weight={activeTab === tab.id ? "fill" : "bold"} className="w-5 h-5" />
                                        {tab.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar">
                            {/* Colors Tab */}
                            <TabsContent value="colors" className="mt-0 space-y-8 animate-in fade-in slide-in-from-left-4">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black text-slate-900">Theme palette</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Primary accent color</label>
                                            <div className="flex gap-2">
                                                <div className="w-12 h-12 rounded-xl bg-[#1B1B27] border border-slate-200" />
                                                <Input defaultValue="#1B1B27" className="h-12 bg-slate-50 border-none rounded-xl font-mono text-sm" />
                                            </div>
                                        </div>
                                        <Button variant="ghost" className="w-full text-blue-600 font-bold justify-start gap-2 h-10 rounded-xl hover:bg-blue-50">
                                            <Plus weight="bold" /> ADD MORE
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-black text-slate-900 font-sans">Text</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between pr-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Heading color</label>
                                                <ArrowCounterClockwise className="w-3 h-3 text-slate-300 cursor-pointer" />
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="w-10 h-10 rounded-lg bg-[#1B1B27]" />
                                                <Input defaultValue="#1B1B27" className="h-10 bg-slate-50 border-none rounded-lg font-mono text-xs" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between pr-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Body color</label>
                                                <ArrowCounterClockwise className="w-3 h-3 text-slate-300 cursor-pointer" />
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="w-10 h-10 rounded-lg bg-[#3C3939]" />
                                                <Input defaultValue="#3C3939" className="h-10 bg-slate-50 border-none rounded-lg font-mono text-xs" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Fonts Tab */}
                            <TabsContent value="fonts" className="mt-0 space-y-8 animate-in fade-in slide-in-from-left-4">
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-black text-slate-900">Headings</h3>
                                        <div className="relative">
                                            <Input defaultValue="Raleway" readOnly className="h-12 bg-slate-50 border-none rounded-xl font-bold pl-4 pr-10 cursor-pointer" />
                                            <CaretDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        </div>
                                        <div className="relative">
                                            <Input defaultValue="Regular" readOnly className="h-12 bg-slate-50 border-none rounded-xl font-bold pl-4 pr-10 cursor-pointer" />
                                            <CaretDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-sm font-black text-slate-900">Body</h3>
                                        <div className="relative">
                                            <Input defaultValue="Roboto" readOnly className="h-12 bg-slate-50 border-none rounded-xl font-bold pl-4 pr-10 cursor-pointer" />
                                            <CaretDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Logo Tab */}
                            <TabsContent value="logo" className="mt-0 animate-in fade-in slide-in-from-left-4">
                                <div className="space-y-6 text-center">
                                    <div className="p-12 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center gap-4 group hover:border-blue-300 transition-colors cursor-pointer bg-slate-50/30">
                                        <CloudArrowUp weight="bold" className="w-12 h-12 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-slate-700">Drag your own logo or <span className="text-blue-600 underline">click to upload</span></p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Default, your theme logo appears in the corner</p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Design Tab (IMAGE 0, 1, 2) */}
                            <TabsContent value="design" className="mt-0 space-y-8 animate-in fade-in slide-in-from-left-4">
                                <div className="space-y-6">
                                    <header>
                                        <h2 className="text-2xl font-black text-slate-900">Design</h2>
                                        <p className="text-[12px] text-slate-500 font-medium">More precise control for specific elements in your theme.</p>
                                    </header>

                                    <Tabs value={designSubTab} onValueChange={setDesignSubTab}>
                                        <TabsList className="bg-blue-50/50 p-1 rounded-xl h-10 w-full mb-6">
                                            <TabsTrigger value="cards" className="flex-1 rounded-lg text-[10px] font-black uppercase tracking-wider">Cards</TabsTrigger>
                                            <TabsTrigger value="blocks" className="flex-1 rounded-lg text-[10px] font-black uppercase tracking-wider">Blocks & content</TabsTrigger>
                                            <TabsTrigger value="buttons" className="flex-1 rounded-lg text-[10px] font-black uppercase tracking-wider">Buttons & links</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="cards" className="space-y-6">
                                            {/* Roundness */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-1.5">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Roundness</label>
                                                    <Info className="w-3 h-3 text-slate-300" />
                                                </div>
                                                <div className="flex gap-2">
                                                    {[0, 8, 16, 24].map((r, i) => (
                                                        <button key={i} className={cn("w-10 h-10 border-2 rounded-xl flex items-center justify-center transition-all", i === 1 ? "border-blue-500 bg-blue-50" : "border-slate-100 hover:border-slate-200")}>
                                                            <div className="w-6 h-6 border-2 border-slate-300" style={{ borderRadius: `${r}px` }} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Card Shadow */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-1.5">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Card shadow</label>
                                                    <Info className="w-3 h-3 text-slate-300" />
                                                </div>
                                                <div className="flex gap-2">
                                                    {[0, 1, 2].map((s, i) => (
                                                        <button key={i} className={cn("w-10 h-10 border-2 rounded-xl flex items-center justify-center transition-all", i === 0 ? "border-blue-500 bg-blue-50" : "border-slate-100 hover:border-slate-200")}>
                                                            <div className={cn("w-6 h-6 rounded bg-white border border-slate-100", i === 1 && "shadow-md", i === 2 && "shadow-xl")} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Card Border */}
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Card border</label>
                                                <div className="bg-slate-50 p-1 rounded-xl flex">
                                                    <button className="flex-1 h-9 rounded-lg flex items-center justify-center"><Circle weight="thin" className="w-4 h-4 opacity-30" /></button>
                                                    <button className="flex-1 h-9 rounded-lg flex items-center justify-center bg-white shadow-sm border border-slate-100"><div className="w-4 h-[1px] bg-slate-900" /></button>
                                                    <button className="flex-1 h-9 rounded-lg flex items-center justify-center"><div className="w-4 h-[2px] bg-slate-900" /></button>
                                                    <button className="flex-1 h-9 rounded-lg flex items-center justify-center"><div className="w-4 h-[3px] bg-slate-900" /></button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Card border color</label>
                                                <div className="flex gap-2">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200" />
                                                    <Input defaultValue="#E6E6E6 (default)" className="h-10 bg-slate-50 border-none rounded-lg text-xs font-mono" />
                                                </div>
                                            </div>

                                            {/* Card Transparency */}
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Card transparency</label>
                                                <div className="flex gap-2">
                                                    {[100, 50, 20].map((t, i) => (
                                                        <button key={i} className={cn("w-12 h-10 border-2 rounded-xl flex items-center justify-center overflow-hidden", i === 1 ? "border-blue-500 bg-blue-50" : "border-slate-100")}>
                                                            <div className="w-full h-full bg-blue-600" style={{ opacity: t / 100 }} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Accent Image Shape */}
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accent image shape</label>
                                                <div className="grid grid-cols-5 gap-2">
                                                    {accentShapes.map((s, i) => (
                                                        <button key={i} className={cn("aspect-square border-2 rounded-xl flex items-center justify-center transition-all", i === 0 ? "border-blue-500 bg-blue-50" : "border-slate-100")}>
                                                            <svg viewBox="0 0 32 32" className="w-8 h-8 fill-slate-200">
                                                                <path d={s.path} />
                                                            </svg>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="blocks" className="space-y-8">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Block fill colors</label>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <Circle className="w-4 h-4 text-slate-200" />
                                                        <span className="text-sm font-bold text-slate-600">Subtle</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Circle weight="fill" className="w-4 h-4 text-blue-600" />
                                                        <span className="text-sm font-black text-slate-900">Primary accent color</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Circle className="w-4 h-4 text-slate-200" />
                                                        <span className="text-sm font-bold text-slate-600">Custom</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Block fill</label>
                                                <div className="bg-slate-50 p-1 rounded-xl flex gap-1 h-10">
                                                    <button className="flex-1 rounded-lg bg-white flex items-center justify-center"><div className="w-3 h-3 rounded-full bg-blue-600" /></button>
                                                    <button className="flex-1 rounded-lg flex items-center justify-center"><div className="w-3 h-3 rounded-full border-2 border-slate-400" /></button>
                                                    <button className="flex-1 rounded-lg flex items-center justify-center"><div className="w-3 h-3 rounded-full border-2 border-slate-400 border-dashed" /></button>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Block border</label>
                                                <div className="bg-slate-50 p-1 rounded-xl flex h-10">
                                                    <button className="flex-1 rounded-lg flex items-center justify-center opacity-30"><Circle weight="thin" className="w-4 h-4" /></button>
                                                    <button className="flex-1 rounded-lg flex items-center justify-center bg-white shadow-sm border border-slate-100">─</button>
                                                    <button className="flex-1 rounded-lg flex items-center justify-center">━</button>
                                                    <button className="flex-1 rounded-lg flex items-center justify-center">■</button>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="buttons" className="space-y-8">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-1.5">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Button color</label>
                                                    <Info className="w-3 h-3 text-slate-300" />
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="w-10 h-10 rounded-lg bg-[#1B1B27]" />
                                                    <Input defaultValue="#1B1B27 (default)" className="h-10 bg-slate-50 border-none rounded-lg text-xs font-mono" />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Button shape</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button className="h-10 border border-slate-100 rounded text-[10px] bg-slate-50 font-black">Button</button>
                                                    <button className="h-10 border-2 border-blue-500 rounded-lg text-[10px] bg-blue-50 font-black text-blue-600">Button</button>
                                                    <button className="h-10 border border-slate-100 rounded-xl text-[10px] bg-slate-50 font-black">Button</button>
                                                    <button className="h-10 border border-slate-100 rounded-full text-[10px] bg-slate-50 font-black">Button</button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-1.5">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Link color</label>
                                                    <Info className="w-3 h-3 text-slate-300" />
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="w-10 h-10 rounded-lg bg-[#1B1B27]" />
                                                    <Input defaultValue="#1B1B27 (default)" className="h-10 bg-slate-50 border-none rounded-lg text-xs font-mono" />
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            </TabsContent>

                            {/* Images Tab (IMAGE 3, 4) */}
                            <TabsContent value="images" className="mt-0 space-y-8 animate-in fade-in slide-in-from-left-4">
                                <div className="space-y-6">
                                    <header>
                                        <h2 className="text-2xl font-black text-slate-900">Images</h2>
                                    </header>

                                    <Tabs value={imagesSubTab} onValueChange={setImagesSubTab}>
                                        <TabsList className="bg-blue-50/50 p-1 rounded-xl h-10 w-full mb-6">
                                            <TabsTrigger value="ai" className="flex-1 rounded-lg text-[10px] font-black uppercase tracking-wider">AI Images</TabsTrigger>
                                            <TabsTrigger value="accent" className="flex-1 rounded-lg text-[10px] font-black uppercase tracking-wider">Accent Images</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="ai" className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Style prompt</label>
                                                <p className="text-[10px] text-slate-500 font-medium">Give your AI images a consistent style. These keywords will be appended to your prompts when generating AI images.</p>
                                                <textarea
                                                    className="w-full h-32 bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-100 resize-none"
                                                    placeholder="Classy and modern with a corporate and minimalist touch..."
                                                    defaultValue="Classy and modern with a corporate and minimalist touch. Tone is serious yet elegant, using a palette of light, white, and cool gray colors."
                                                />
                                            </div>

                                            <div className="space-y-4 pt-4">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Examples:</h4>
                                                <div className="grid grid-cols-1 gap-6">
                                                    {aiExamples.map(ex => (
                                                        <div key={ex.id} className="space-y-3">
                                                            <div className="aspect-square rounded-2xl overflow-hidden border border-slate-100">
                                                                <img src={ex.url} alt={ex.title} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <div className="text-xs font-black text-slate-900 uppercase tracking-tight">{ex.title},</div>
                                                                <div className="text-[10px] font-bold text-slate-400 leading-tight">{ex.tags}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="accent" className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] text-slate-500 font-medium max-w-[140px]">Accent images are decorative placeholders you can use on the side or background of a card.</p>
                                                <Button variant="outline" className="h-9 rounded-xl border-slate-200 text-[10px] font-black gap-2">
                                                    <Plus weight="bold" /> ADD IMAGES
                                                </Button>
                                            </div>

                                            <div className="p-12 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center gap-4 bg-slate-50/20">
                                                <CloudArrowUp weight="bold" className="w-10 h-10 text-slate-200" />
                                                <p className="text-xs font-bold text-slate-400">Drop here or <span className="text-blue-600 underline">click to upload</span></p>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2">
                                                {Array.from({ length: 9 }).map((_, i) => (
                                                    <div key={i} className="aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-50">
                                                        <img src={`https://picsum.photos/seed/accent${i}/300/200`} className="w-full h-full object-cover opacity-50 contrast-125 saturate-0" />
                                                    </div>
                                                ))}
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </aside>

                {/* Preview Area */}
                <section className="flex-1 bg-slate-50 overflow-y-auto p-12 custom-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-12 pb-24">
                        {/* Slide Preview 1 */}
                        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden aspect-[16/10] border border-slate-100">
                            <div className="p-20 space-y-8 h-full flex flex-col justify-center">
                                <div className="flex items-center gap-2 text-blue-600 mb-4 animate-bounce">
                                    <span className="text-sm font-black">Hello 👋</span>
                                </div>
                                <h2 className="text-6xl font-black text-slate-900 leading-tight tracking-tighter">This is a theme preview</h2>
                                <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                                    Here's an example of body text. You can change its font and the color. <span className="text-blue-600 underline cursor-pointer font-black">Your accent color will be used for links.</span> It will also be used for layouts and buttons.
                                </p>

                                <div className="flex gap-4 pt-4">
                                    <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100 flex-1 space-y-3">
                                        <div className="w-full h-4 bg-slate-200 rounded-full" />
                                        <div className="w-2/3 h-4 bg-slate-100 rounded-full" />
                                    </div>
                                    <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100 flex-1 space-y-3">
                                        <div className="w-full h-4 bg-slate-200 rounded-full" />
                                        <div className="w-2/3 h-4 bg-slate-100 rounded-full" />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-8">
                                    <Button className="bg-slate-900 text-white rounded-xl h-14 px-10 font-black text-lg shadow-xl shadow-slate-200 active:scale-95 transition-all">Primary button</Button>
                                    <Button variant="outline" className="rounded-xl h-14 px-10 font-black text-lg border-slate-200 hover:bg-white active:scale-95 transition-all">Secondary button</Button>
                                </div>
                            </div>
                        </div>

                        {/* Theme Showcase Sections */}
                        <div className="space-y-12 grayscale opacity-30">
                            <div className="h-px bg-slate-200 w-full" />
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">Smart layouts & data visualization</h4>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="bg-white rounded-[2rem] p-12 border border-slate-100 space-y-6">
                                    <div className="flex gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-100" />
                                        <div className="flex-1 h-8 bg-slate-50 rounded-lg" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="w-full h-4 bg-slate-100 rounded" />
                                        <div className="w-full h-4 bg-slate-100 rounded" />
                                        <div className="w-3/4 h-4 bg-slate-100 rounded" />
                                    </div>
                                </div>
                                <div className="bg-white rounded-[2rem] p-12 border border-slate-100 flex flex-col justify-between">
                                    <div className="flex items-end gap-2 h-32">
                                        <div className="w-full bg-blue-500 rounded-t-lg h-[40%]" />
                                        <div className="w-full bg-blue-500 rounded-t-lg h-[70%]" />
                                        <div className="w-full bg-blue-500 rounded-t-lg h-[100%]" />
                                        <div className="w-full bg-blue-500 rounded-t-lg h-[60%]" />
                                    </div>
                                    <div className="h-4 bg-slate-50 rounded w-full mt-6" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}
