import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import {
    X,
    User,
    Bell,
    ShieldCheck,
    Database,
    Camera,
    CaretDown,
    GoogleLogo,
    Trash,
    SignOut,
    Lock,
    Folder,
    Info
} from '@phosphor-icons/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

interface AccountSettingsModalProps {
    isOpen: boolean
    onClose: () => void
}

export function AccountSettingsModal({ isOpen, onClose }: AccountSettingsModalProps) {
    const [activeTab, setActiveTab] = useState('basic')

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl bg-white rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden scale-105">
                <div className="flex flex-col h-[550px]">
                    <DialogHeader className="p-8 pb-4">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Account settings</DialogTitle>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                                <X weight="bold" />
                            </button>
                        </div>
                    </DialogHeader>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-8 border-b border-slate-50 shrink-0">
                            <TabsList className="bg-transparent h-auto p-0 gap-6">
                                <TabsTrigger value="basic" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none py-3 px-0 text-sm font-bold text-slate-400 data-[state=active]:text-blue-600 transition-all gap-2">
                                    <User weight="bold" /> Basic info
                                </TabsTrigger>
                                <TabsTrigger value="notifications" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none py-3 px-0 text-sm font-bold text-slate-400 data-[state=active]:text-blue-600 transition-all gap-2">
                                    <Bell weight="bold" /> Email notifications
                                </TabsTrigger>
                                <TabsTrigger value="security" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none py-3 px-0 text-sm font-bold text-slate-400 data-[state=active]:text-blue-600 transition-all gap-2">
                                    <ShieldCheck weight="bold" /> Sign in & security
                                </TabsTrigger>
                                <TabsTrigger value="data" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none py-3 px-0 text-sm font-bold text-slate-400 data-[state=active]:text-blue-600 transition-all gap-2">
                                    <Database weight="bold" /> Data control
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                            <TabsContent value="basic" className="mt-0 space-y-10 animate-in fade-in slide-in-from-left-4">
                                <div className="flex gap-16">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative group">
                                            <div className="w-32 h-32 rounded-full bg-slate-900 border-4 border-white shadow-xl flex items-center justify-center text-4xl text-white font-black overflow-hidden">
                                                HG
                                            </div>
                                            <button className="absolute bottom-1 right-1 p-2 bg-white rounded-full shadow-lg border border-slate-100 text-slate-500 hover:text-blue-600 transition-colors">
                                                <Camera weight="bold" className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-lg font-black text-slate-900">Hussam Galal</h3>
                                            <p className="text-xs text-slate-400 font-bold">hussamgalal111@gmail.com</p>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">First name</label>
                                            <Input defaultValue="Hussam" className="h-12 bg-slate-50/50 border-slate-100 rounded-xl font-bold px-4 focus:ring-blue-500/20 transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Last name</label>
                                            <Input defaultValue="Galal" className="h-12 bg-slate-50/50 border-slate-100 rounded-xl font-bold px-4 focus:ring-blue-500/20 transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Language</label>
                                            <div className="relative">
                                                <Input defaultValue="English" readOnly className="h-12 bg-slate-50/50 border-slate-100 rounded-xl font-bold px-4 cursor-pointer" />
                                                <CaretDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" weight="bold" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="notifications" className="mt-0 animate-in fade-in slide-in-from-right-4">
                                <div className="space-y-8">
                                    <p className="text-sm font-bold text-slate-600 leading-relaxed">
                                        Choose which emails you want to receive from us. Note that you will still receive important notifications related to your account.
                                    </p>

                                    <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-black text-slate-900">Onboarding emails</span>
                                            <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer opacity-50"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all" /></div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-black text-slate-900">Product updates and announcement emails</span>
                                            <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer opacity-50"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all" /></div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="security" className="mt-0 animate-in fade-in slide-in-from-right-4 space-y-10">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Lock weight="bold" className="w-4 h-4 text-blue-600" />
                                        <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest leading-none">Authentication</h3>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sign in method</label>
                                            <button className="text-[12px] font-black text-blue-600 hover:underline">Add password</button>
                                        </div>
                                        <div className="flex items-center gap-4 bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                                            <GoogleLogo weight="bold" className="w-6 h-6 text-blue-500" />
                                            <span className="text-sm font-black text-slate-900 flex-1">hussamgalal111@gmail.com</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Folder weight="bold" className="w-4 h-4 text-blue-600" />
                                        <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest leading-none">Devices and sessions</h3>
                                    </div>
                                    <Button variant="outline" className="h-11 rounded-xl px-6 border-slate-200 text-blue-600 font-bold gap-2 hover:bg-blue-50/50">
                                        <SignOut weight="bold" className="w-5 h-5" />
                                        Sign out of all devices
                                    </Button>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-slate-50">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Trash weight="bold" className="w-4 h-4 text-rose-500" />
                                        <h3 className="text-[12px] font-black text-rose-500 uppercase tracking-widest leading-none">Danger zone</h3>
                                    </div>
                                    <Button variant="outline" className="h-11 rounded-xl px-6 border-rose-100 text-rose-500 font-bold gap-2 hover:bg-rose-50/50 transition-colors">
                                        <Trash weight="bold" className="w-5 h-5" />
                                        Delete my account
                                    </Button>
                                </div>
                            </TabsContent>

                            <TabsContent value="data" className="mt-0 animate-in fade-in slide-in-from-right-4">
                                <div className="space-y-8">
                                    <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest leading-none">Data control</h3>
                                    <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-slate-900">Allow my content to be used to improve Gamma's AI features</span>
                                            <Info weight="bold" className="w-3 h-3 text-slate-300" />
                                        </div>
                                        <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm" /></div>
                                    </div>
                                </div>
                            </TabsContent>
                        </div>

                        <div className="p-8 pt-0 flex justify-end shrink-0">
                            <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 h-14 px-10 rounded-2xl font-black shadow-lg shadow-blue-200">
                                Done
                            </Button>
                        </div>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    )
}
