import React, { useState } from 'react'
import {
    Cards,
    Users,
    Globe,
    Image as ImageIcon,
    PaintBrush,
    TextT,
    Bell,
    CaretDown,
    Plus,
    Gear,
    ChatCircleText,
    Lightning,
    MagnifyingGlass,
    Trash,
    SquaresFour,
    ShoppingBag,
    ChartBar
} from '@phosphor-icons/react'
import { AppView } from '@/lib/types'
import { cn } from '@/lib/utils'
import { FolderModal } from './FolderModal'
import { CreditsModal } from './CreditsModal'
import { AccountSettingsModal } from './AccountSettingsModal'
import { SubscriptionModal } from './SubscriptionModal'
import { UpdatesDropdown } from './UpdatesDropdown'
import { SupportWidget } from './SupportWidget'

interface DashboardLayoutProps {
    currentView: AppView
    onViewChange: (view: AppView) => void
    onOpenNewGammaModal: () => void
    children: React.ReactNode
}

export function DashboardLayout({
    currentView,
    onViewChange,
    onOpenNewGammaModal,
    children
}: DashboardLayoutProps) {
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
    const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false)
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
    const [isUpdatesOpen, setIsUpdatesOpen] = useState(false)

    const navItems = [
        { id: 'dashboard', label: 'Gammas', icon: Cards },
        { id: 'shared', label: 'Shared with you', icon: Users },
        { id: 'sites', label: 'Sites', icon: Globe },
        { id: 'images', label: 'AI Images', icon: ImageIcon },
    ]

    const toolItems = [
        { id: 'templates', label: 'Templates', icon: SquaresFour },
        { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
        { id: 'analytics', label: 'Analytics', icon: ChartBar },
        { id: 'themes', label: 'Themes', icon: PaintBrush },
        { id: 'fonts', label: 'Custom fonts', icon: TextT },
        { id: 'trash', label: 'Trash', icon: Trash },
    ]

    return (
        <div className="flex h-screen bg-white">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-100 flex flex-col z-20">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black">Γ</div>
                            <span className="font-bold text-slate-900">GammaX</span>
                        </div>
                        <CaretDown className="text-slate-400 w-4 h-4 cursor-pointer" />
                    </div>

                    <div className="relative mb-6">
                        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            placeholder="Jump to..."
                            className="w-full bg-slate-50 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-white border border-slate-200 px-1 rounded text-slate-400">Ctrl+K</span>
                    </div>

                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onViewChange(item.id as AppView)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    currentView === item.id
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                <item.icon weight={currentView === item.id ? "fill" : "bold"} className="w-5 h-5" />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-3">Folders</div>
                    <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl mb-6">
                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed mb-3">
                            Organize your gammas by topic and share them with your team.
                        </p>
                        <button
                            onClick={() => setIsFolderModalOpen(true)}
                            className="text-[11px] font-black text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            Create or join a folder
                        </button>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-50 space-y-1">
                    {toolItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id as AppView)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                currentView === item.id
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-slate-500 hover:bg-slate-50"
                            )}
                        >
                            <item.icon weight={currentView === item.id ? "fill" : "bold"} className="w-4 h-4" />
                            {item.label}
                        </button>
                    ))}

                    <div className="pt-2">
                        <button
                            onClick={() => onViewChange('settings')}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1",
                                currentView === 'settings' ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            <Gear weight={currentView === 'settings' ? "fill" : "bold"} className="w-5 h-5" />
                            Settings & members
                        </button>
                        <button
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            <ChatCircleText weight="bold" className="w-5 h-5" />
                            Contact support
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 z-30">
                    <div className="flex items-center gap-4">
                        <h2 className="font-extrabold text-slate-800 capitalize tracking-tight">
                            {currentView === 'dashboard' ? 'Gammas' :
                                currentView === 'settings' ? 'Settings & members' :
                                    currentView === 'templates' ? 'Templates' :
                                        currentView === 'themes' ? 'Themes' :
                                            currentView}
                        </h2>
                    </div>

                    <div className="flex items-center gap-6 relative">
                        <button
                            onClick={() => setIsSubscriptionModalOpen(true)}
                            className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1"
                        >
                            <Plus weight="bold" className="w-3 h-3" /> Upgrade for more AI
                        </button>

                        <div
                            onClick={() => setIsCreditsModalOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100 cursor-pointer hover:bg-slate-100 group transition-all hover:scale-105 active:scale-95"
                        >
                            <Lightning weight="fill" className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-black text-slate-600">397 credits</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={onOpenNewGammaModal}
                                className="relative flex items-center gap-3 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#001c4d] via-[#103d8e] to-[#71b6f0] text-white shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 active:scale-[0.98] transition-all group overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Plus weight="bold" className="w-4 h-4" />
                                <span className="font-extrabold tracking-tight">Create new</span>
                                <span className="bg-white/20 backdrop-blur-sm text-[10px] font-black px-1.5 py-0.5 rounded-md leading-none border border-white/30">AI</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-100">
                            <button
                                onClick={() => setIsUpdatesOpen(!isUpdatesOpen)}
                                className={cn(
                                    "p-2 rounded-full relative transition-all active:scale-90",
                                    isUpdatesOpen ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:bg-slate-50"
                                )}
                            >
                                <Bell weight="bold" className="w-5 h-5" />
                                <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                            </button>

                            <div
                                onClick={() => setIsAccountModalOpen(true)}
                                className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 border-2 border-white shadow-md cursor-pointer hover:scale-110 active:scale-90 transition-all flex items-center justify-center text-[10px] text-white font-black"
                            >
                                HG
                            </div>
                        </div>

                        {/* Updates Dropdown */}
                        <UpdatesDropdown isOpen={isUpdatesOpen} onClose={() => setIsUpdatesOpen(false)} />
                    </div>
                </header>

                {/* Dynamic Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    {children}
                </div>
            </main>

            {/* Modals & Widgets */}
            <FolderModal
                isOpen={isFolderModalOpen}
                onClose={() => setIsFolderModalOpen(false)}
                onCreate={(name) => {
                    console.log('Create folder:', name)
                    setIsFolderModalOpen(false)
                }}
            />

            <CreditsModal
                isOpen={isCreditsModalOpen}
                onClose={() => setIsCreditsModalOpen(false)}
            />

            <AccountSettingsModal
                isOpen={isAccountModalOpen}
                onClose={() => setIsAccountModalOpen(false)}
            />

            <SubscriptionModal
                isOpen={isSubscriptionModalOpen}
                onClose={() => setIsSubscriptionModalOpen(false)}
            />

            <SupportWidget />
        </div>
    )
}
