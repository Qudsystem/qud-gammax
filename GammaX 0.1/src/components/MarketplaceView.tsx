import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    MagnifyingGlass,
    ShoppingBag,
    Star,
    DownloadSimple,
    Layout,
    PaintBrush,
    TrendUp,
    Globe,
    Briefcase,
    MagicWand,
    Heart
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { PresentationStyle } from '@/lib/types'

interface Template {
    id: string
    title: string
    author: string
    rating: number
    downloads: string
    image: string
    style: PresentationStyle
    category: string
    price: 'Free' | 'Pro'
}

export function MarketplaceView() {
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('All')

    const templates: Template[] = [
        { id: '1', title: 'Midnight Executive', author: 'Gamma Team', rating: 4.9, downloads: '12k', style: 'dark', category: 'Business', price: 'Free', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400' },
        { id: '2', title: 'Organic Growth', author: 'Studio Eco', rating: 4.8, downloads: '8.4k', style: 'eco', category: 'Creative', price: 'Free', image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=400' },
        { id: '3', title: 'Retro Future', author: 'Vapor Design', rating: 4.7, downloads: '5.2k', style: 'retro', category: 'Education', price: 'Pro', image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=400' },
        { id: '4', title: 'Glassmorphism 2.0', author: 'Modern UI', rating: 5.0, downloads: '15k', style: 'glass', category: 'Tech', price: 'Pro', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400' },
        { id: '5', title: 'Brutal Mono', author: 'Raw Ink', rating: 4.6, downloads: '3.1k', style: 'brutal', category: 'Portfolio', price: 'Free', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=400' },
        { id: '6', title: 'Neon Nights', author: 'Cyber Pixel', rating: 4.9, downloads: '9.8k', style: 'neon', category: 'Tech', price: 'Free', image: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=80&w=400' },
    ]

    const categories = [
        { name: 'All', icon: Layout },
        { name: 'Business', icon: Briefcase },
        { name: 'Creative', icon: MagicWand },
        { name: 'Tech', icon: Globe },
        { name: 'Education', icon: PaintBrush },
    ]

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 pb-32">
            <div className="relative h-[300px] rounded-[3rem] overflow-hidden bg-slate-900 flex items-center px-12 text-white">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent" />
                <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800')] bg-cover opacity-50 contrast-125" />
                <div className="relative z-10 max-w-lg">
                    <span className="bg-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block">Featured</span>
                    <h1 className="text-5xl font-black tracking-tight mb-4 leading-[1.1]">The Template Marketplace</h1>
                    <p className="text-slate-400 font-medium text-lg leading-relaxed mb-8">
                        Beautiful themes, high-fidelity slides, and smart layouts for every type of story.
                    </p>
                    <div className="relative max-w-md">
                        <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search for themes..."
                            className="w-full bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-500"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map((cat) => (
                    <button
                        key={cat.name}
                        onClick={() => setCategory(cat.name)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all",
                            category === cat.name
                                ? "bg-slate-900 text-white shadow-lg"
                                : "bg-white border border-slate-100 text-slate-500 hover:border-slate-200"
                        )}
                    >
                        <cat.icon weight={category === cat.name ? "fill" : "bold"} />
                        {cat.name}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {templates.map((template, i) => (
                    <motion.div
                        key={template.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col"
                    >
                        <div className="relative h-64 overflow-hidden">
                            <img
                                src={template.image}
                                alt={template.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <button className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40">
                                <Heart weight="fill" className="w-5 h-5" />
                            </button>
                            <div className="absolute bottom-4 left-4 flex gap-2">
                                <span className="bg-slate-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight">
                                    {template.style}
                                </span>
                                {template.price === 'Pro' && (
                                    <span className="bg-amber-500/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight">
                                        PRO
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="p-8 flex flex-col flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{template.title}</h4>
                                <div className="flex items-center gap-1 text-slate-400 group-hover:text-blue-600 transition-colors">
                                    <Star weight="fill" className="w-3.5 h-3.5" />
                                    <span className="text-xs font-black">{template.rating}</span>
                                </div>
                            </div>

                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">By {template.author}</p>

                            <div className="mt-auto flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-slate-500">
                                    <DownloadSimple weight="bold" className="w-4 h-4" />
                                    <span className="text-xs font-bold">{template.downloads} downloads</span>
                                </div>
                                <button className="px-6 py-3 bg-slate-50 hover:bg-blue-600 hover:text-white rounded-2xl text-xs font-black transition-all group-active:scale-95">
                                    Use Preview
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-indigo-600 rounded-[3rem] p-12 text-white relative overflow-hidden text-center">
                <div className="relative z-10">
                    <h2 className="text-4xl font-black tracking-tight mb-4">Want to share your creations?</h2>
                    <p className="text-indigo-100 font-medium text-lg mb-10 opacity-80 max-w-2xl mx-auto">
                        Join our creator community and share your templates with millions of storytellers around the world.
                    </p>
                    <button className="px-10 py-5 bg-white text-indigo-600 rounded-2xl font-black text-lg hover:shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0">
                        Become a Creator
                    </button>
                </div>
            </div>
        </div>
    )
}
