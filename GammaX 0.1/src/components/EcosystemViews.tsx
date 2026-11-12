import React from 'react'
import { motion } from 'framer-motion'
import { Plus, ArrowSquareOut } from '@phosphor-icons/react'
import { Button } from './ui/button'

export function AIImagesView() {
    // Mock generated images
    const [images, setImages] = React.useState(Array.from({ length: 12 }, (_, i) => ({
        id: i,
        url: `https://picsum.photos/seed/${i + 100}/400/500`,
        title: `Image ${i + 1}`
    })))
    const [isGenerating, setIsGenerating] = React.useState(false)

    const handleGenerate = () => {
        setIsGenerating(true)
        setTimeout(() => {
            const newImage = {
                id: Date.now(),
                url: `https://picsum.photos/seed/${Date.now()}/400/500`,
                title: 'New Generation'
            }
            setImages([newImage, ...images])
            setIsGenerating(false)
        }, 2000)
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">AI Images</h1>
                    <p className="text-sm text-slate-500 mt-1">Discover your AI generated visual assets.</p>
                </div>
                <Button 
                    onClick={handleGenerate} 
                    disabled={isGenerating}
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGenerating ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Plus weight="bold" className="w-4 h-4" />
                            Generate new image
                        </>
                    )}
                </Button>
            </div>

            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
                {images.map((img) => (
                    <motion.div
                        key={img.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: img.id * 0.02 }}
                        className="break-inside-avoid relative group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
                    >
                        <img
                            src={img.url}
                            alt={img.title}
                            className="w-full h-auto object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button className="bg-white/20 backdrop-blur-md p-2 rounded-lg text-white hover:bg-white/40">
                                <ArrowSquareOut weight="bold" className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export function SitesView() {
    const [isCreating, setIsCreating] = React.useState(false)
    const [sites, setSites] = React.useState<any[]>([])

    if (isCreating) {
        return (
            <div className="p-8 max-w-5xl mx-auto animate-in slide-in-from-bottom-4 fade-in duration-500">
                <button onClick={() => setIsCreating(false)} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm">
                    <ArrowSquareOut className="rotate-180" /> Back to sites
                </button>
                <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white text-center relative overflow-hidden">
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-4xl font-black mb-6">Build your professional website</h2>
                        <div className="bg-white/10 backdrop-blur-xl p-2 rounded-2xl flex items-center gap-2 border border-white/20 mb-8">
                            <input
                                type="text"
                                placeholder="Describe your site (e.g., 'A portfolio for a digital artist with a dark theme')"
                                className="flex-1 bg-transparent border-none text-white placeholder-white/50 px-4 py-3 font-medium outline-none"
                            />
                            <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg" onClick={() => {
                                setSites([...sites, { id: Date.now(), name: 'New Website', status: 'Published', views: 0 }])
                                setIsCreating(false)
                            }}>
                                Generate Site
                            </button>
                        </div>
                        <div className="flex justify-center gap-8 text-sm font-bold text-slate-400">
                            <span className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-400 rounded-full" /> SEO Optimized</span>
                            <span className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-400 rounded-full" /> Mobile Responsive</span>
                            <span className="flex items-center gap-2"><div className="w-2 h-2 bg-purple-400 rounded-full" /> Analytics Ready</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (sites.length > 0) {
        return (
            <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-black text-slate-900">Your Websites</h1>
                    <Button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-xl h-10 px-6 font-bold">
                        <Plus weight="bold" /> New Site
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sites.map(site => (
                        <div key={site.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                            <div className="aspect-video bg-slate-50 rounded-2xl mb-4 relative overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">🌐</div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-900">{site.name}</h3>
                                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> {site.status}</span>
                                </div>
                                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full">{site.views} views</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="max-w-md"
            >
                <div className="relative w-64 h-64 mx-auto mb-8">
                    <div className="absolute inset-0 bg-blue-100 rounded-full opacity-20 animate-pulse" />
                    <div className="absolute inset-4 bg-blue-200 rounded-full opacity-40 animate-pulse delay-75" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-9xl">🎈</div>
                    </div>
                </div>

                <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">This space is full of potential</h1>
                <p className="text-slate-500 mb-10 text-lg leading-relaxed">Draft, craft, and publish your first website in minutes. Turn your ideas into interactive experiences.</p>

                <div className="flex items-center justify-center gap-4">
                    <Button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700 h-14 px-8 rounded-2xl gap-3 text-lg font-bold shadow-lg shadow-blue-200">
                        <Plus weight="bold" className="w-5 h-5" />
                        Create site
                    </Button>
                    <Button variant="outline" className="h-14 px-8 rounded-2xl gap-3 text-lg font-bold border-slate-200 text-slate-700">
                        Learn more
                        <ArrowSquareOut weight="bold" className="w-5 h-5" />
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}

export function SharedView() {
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-white">
            <h1 className="text-2xl font-black text-slate-900 mb-2">Shared with you</h1>
            <p className="text-slate-500 font-medium">When people share presentations with you, they'll appear here.</p>
        </div>
    )
}

export function FontsView() {
    return (
        <div className="p-12 max-w-5xl mx-auto">
            <h1 className="text-2xl font-black text-slate-900 mb-8">Custom fonts</h1>
            <div className="p-20 border-2 border-dashed border-slate-100 rounded-[2rem] text-center bg-slate-50/50">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Upload your own .woff2 or .ttf files to use in your presentations.</p>
                <Button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-8 font-black">
                    Upload font
                </Button>
            </div>
        </div>
    )
}

export function TrashView() {
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-white">
            <div className="text-6xl mb-6">🗑️</div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">Trash is empty</h1>
            <p className="text-slate-500 font-medium text-center max-w-sm">Items you delete will be kept here for 30 days before being permanently removed.</p>
        </div>
    )
}
