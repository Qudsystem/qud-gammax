import { Dialog, DialogContent } from './ui/dialog'
import { Button } from './ui/button'
import {
    X,
    Lightning,
    UserPlus,
    HandHeart,
    CaretRight,
    Sparkle
} from '@phosphor-icons/react'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'

interface CreditsModalProps {
    isOpen: boolean
    onClose: () => void
}

export function CreditsModal({ isOpen, onClose }: CreditsModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl bg-white rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden">
                <div className="bg-blue-50/50 p-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600" />
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white rounded-full text-slate-400 transition-colors">
                        <X weight="bold" />
                    </button>

                    <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Your account balance</h2>
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <Lightning weight="fill" className="w-10 h-10 text-blue-600 animate-pulse" />
                        <span className="text-6xl font-black text-slate-900 tracking-tighter">397 credits</span>
                    </div>
                    <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto">Credits let you create and edit with AI. Each user in your workspace gets their own credits.</p>
                </div>

                <div className="p-2 border-b border-slate-50">
                    <Tabs defaultValue="get">
                        <TabsList className="bg-transparent h-auto p-0 gap-2 w-full">
                            <TabsTrigger value="get" className="flex-1 bg-transparent border-none data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 rounded-xl py-3 text-sm font-bold text-slate-500 transition-all gap-2">
                                Get more credits
                            </TabsTrigger>
                            <TabsTrigger value="refer" className="flex-1 bg-transparent border-none data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 rounded-xl py-3 text-sm font-bold text-slate-500 transition-all gap-2">
                                Refer a friend
                            </TabsTrigger>
                            <TabsTrigger value="invite" className="flex-1 bg-transparent border-none data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 rounded-xl py-3 text-sm font-bold text-slate-500 transition-all gap-2">
                                Invite a teammate
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="p-8 space-y-6">
                    <div className="bg-gradient-to-br from-white to-slate-50 border border-blue-200 p-6 rounded-3xl flex items-center justify-between group cursor-pointer hover:shadow-xl hover:shadow-blue-100 transition-all">
                        <div className="space-y-1">
                            <h3 className="font-black text-slate-900">More power, fewer limits</h3>
                            <p className="text-xs text-slate-400 font-medium max-w-[240px]">Upgrade for more credits, advanced AI models, and branding tools.</p>
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700 h-10 px-6 rounded-xl font-black shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
                            Upgrade
                        </Button>
                    </div>

                    <div className="space-y-1">
                        {[
                            { label: 'What uses credits?', icon: Sparkle },
                            { label: 'How many credits do I get?', icon: Lightning },
                            { label: 'How can I earn more credits?', icon: HandHeart },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl cursor-pointer group transition-colors">
                                <div className="flex items-center gap-3">
                                    <item.icon weight="bold" className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                                    <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{item.label}</span>
                                </div>
                                <CaretRight weight="bold" className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                            </div>
                        ))}
                    </div>

                    <div className="text-center pt-2">
                        <a href="#" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Frequently asked questions</a>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
