import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    Folder,
    GoogleLogo,
    Globe,
    UploadSimple,
    MagnifyingGlass,
    Plus,
    CaretRight,
    FileText
} from '@phosphor-icons/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'

interface ImportFileModalProps {
    isOpen: boolean
    onClose: () => void
    onImport: (urlOrFile: string) => void
}

export function ImportFileModal({ isOpen, onClose, onImport }: ImportFileModalProps) {
    const [showUrlInput, setShowUrlInput] = useState(false)
    const [url, setUrl] = useState('')

    const recentPrompts = [
        { title: 'عرض تقديمي عن الذكاء الاصطناعي', type: 'Generate', time: '1 year ago', status: 'DRAFT' },
        { title: 'Artificial Intelligence: The Future Is Now', type: 'Generate', time: '1 year ago', status: 'DRAFT' },
        { title: 'Qud Design WorkShop', type: 'Paste text', time: '1 year ago', status: 'DRAFT' },
        { title: 'Qud Design WorkShop', type: 'Paste text', time: '1 year ago', status: 'DRAFT' },
        { title: 'Qud Design WorkShop', type: 'Paste text', time: '1 year ago', status: 'DRAFT' },
    ]

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-5xl p-0 border-none bg-[#f1f6fc] rounded-[2rem] shadow-2xl overflow-hidden h-[800px] flex flex-col">
                <DialogHeader className="p-6 border-b border-white/50 flex flex-row items-center justify-between shrink-0 z-20">
                    <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Folder weight="bold" className="w-6 h-6 text-blue-600" />
                        Import file
                    </DialogTitle>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                        <X weight="bold" className="w-5 h-5" />
                    </button>
                </DialogHeader>

                <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center pt-8 pb-20 relative px-8">
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-100/30 via-purple-50/20 to-white -z-10 pointer-events-none" />

                    <div className="text-center space-y-4 mb-12">
                        <div className="flex items-center justify-center gap-3 text-slate-800">
                            <div className="bg-purple-100 p-2 rounded-xl">
                                <FileText weight="fill" className="w-8 h-8 text-purple-600" />
                            </div>
                            <h1 className="text-4xl font-black tracking-tight">Import with AI</h1>
                        </div>
                        <p className="text-slate-500 font-medium text-lg">Select the file you'd like to transform</p>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-8">
                        {/* Upload File */}
                        <div className="bg-white rounded-2xl p-6 border-b-4 border-b-purple-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden h-64 flex flex-col">
                            <div className="absolute top-0 left-0 w-full h-1 bg-purple-200" />
                            <div className="w-full h-24 bg-purple-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-500">
                                <Folder weight="fill" className="w-12 h-12 text-purple-400" />
                            </div>
                            <h3 className="text-lg font-black text-slate-800 mb-2">Upload a file</h3>
                            <ul className="space-y-1 mb-auto">
                                {['Powerpoint PPTX', 'Word docs', 'PDFs'].map(item => (
                                    <li key={item} className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                        <span className="text-green-500">✓</span> {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="absolute bottom-6 right-6">
                                <UploadSimple weight="bold" className="w-5 h-5 text-slate-400 group-hover:text-purple-500 transition-colors" />
                            </div>
                        </div>

                        {/* Import from Drive */}
                        <div className="bg-white rounded-2xl p-6 border-b-4 border-b-blue-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden h-64 flex flex-col">
                            <div className="absolute top-0 left-0 w-full h-1 bg-blue-200" />
                            <div className="w-full h-24 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-500">
                                <GoogleLogo weight="fill" className="w-12 h-12 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-black text-slate-800 mb-2">Import from Drive</h3>
                            <ul className="space-y-1 mb-auto">
                                {['Google Slides', 'Google Docs'].map(item => (
                                    <li key={item} className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                        <span className="text-green-500">✓</span> {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="absolute bottom-6 right-6">
                                <MagnifyingGlass weight="bold" className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                            </div>
                        </div>

                        {/* Import from URL */}
                        <div
                            onClick={() => setShowUrlInput(true)}
                            className="bg-white rounded-2xl p-6 border-b-4 border-b-emerald-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden h-64 flex flex-col"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-200" />
                            <div className="w-full h-24 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-500">
                                <Globe weight="bold" className="w-12 h-12 text-emerald-400 opacity-80" />
                            </div>
                            <h3 className="text-lg font-black text-slate-800 mb-2">Import from URL</h3>
                            <ul className="space-y-1 mb-auto">
                                {['Webpages', 'Blog posts or articles', 'Notion docs (public only)'].map(item => (
                                    <li key={item} className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                        <span className="text-green-500">✓</span> {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="absolute bottom-6 right-6">
                                <Plus weight="bold" className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                            </div>
                        </div>
                    </div>

                    <div className="mb-12 text-center">
                        <span className="text-slate-500 text-sm font-medium">If your file isn't supported, you can also </span>
                        <button className="text-slate-700 font-bold underline text-sm hover:text-blue-600 decoration-2 underline-offset-2">paste in text</button>
                    </div>

                    {/* Recent Prompts */}
                    <div className="w-full max-w-3xl">
                        <h3 className="text-left bg-blue-50/50 p-2 rounded-lg inline-block px-4 font-black text-slate-800 mb-6 text-sm mx-auto block w-fit">Your recent prompts</h3>
                        <div className="space-y-3">
                            {recentPrompts.map((prompt, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between group cursor-pointer hover:shadow-md transition-all"
                                    onClick={() => onImport(prompt.title)}
                                >
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm mb-1">{prompt.title}</h4>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                            <span>{prompt.type}</span>
                                            <span>•</span>
                                            <span>{prompt.time}</span>
                                            {prompt.status && <span className="text-emerald-500 bg-emerald-50 px-1.5 rounded uppercase">{prompt.status}</span>}
                                        </div>
                                    </div>
                                    <CaretRight weight="bold" className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                </motion.div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <button className="w-full py-3 bg-white border border-slate-200 rounded-xl text-slate-500 font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm">
                                <Plus weight="bold" />
                                Load more
                            </button>
                        </div>
                    </div>
                </main>

                <AnimatePresence>
                    {showUrlInput && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowUrlInput(false)}
                                className="absolute inset-0 bg-white/60 backdrop-blur-sm z-30"
                            />
                            <motion.div
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl z-50 px-4"
                            >
                                <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                                    <div className="p-6 pb-0 flex justify-between items-start">
                                        <div>
                                            <h3 className="font-black text-slate-800 text-lg">Import from URL</h3>
                                            <p className="text-xs text-slate-500 font-medium mt-1">This will extract the text from the webpage you enter.</p>
                                        </div>
                                        <button onClick={() => setShowUrlInput(false)} className="text-slate-400 hover:text-slate-600">
                                            <X weight="bold" />
                                        </button>
                                    </div>
                                    <div className="p-6 pt-4">
                                        <div className="mb-6">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">URL</label>
                                            <input
                                                type="text"
                                                placeholder="http://www.example.com/"
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300"
                                                value={url}
                                                onChange={(e) => setUrl(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setShowUrlInput(false)}
                                                className="px-4 py-2 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                disabled={!url}
                                                onClick={() => onImport(url)}
                                                className="px-6 py-2 bg-blue-600 text-white font-bold text-sm rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                                            >
                                                Import
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    )
}
