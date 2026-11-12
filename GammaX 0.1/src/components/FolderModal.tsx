import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { X } from '@phosphor-icons/react'

interface FolderModalProps {
    isOpen: boolean
    onClose: () => void
    onCreate: (name: string) => void
}

export function FolderModal({ isOpen, onClose, onCreate }: FolderModalProps) {
    const [name, setName] = React.useState('')

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white rounded-[2rem] p-8 border-none shadow-2xl overflow-hidden">
                {/* Decorative background */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none" />

                <DialogHeader className="relative mb-6">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Create or join a folder</DialogTitle>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                            <X weight="bold" />
                        </button>
                    </div>
                    <p className="text-slate-500 text-sm font-medium mt-1">You can join a folder to keep track of what folks are working on.</p>
                </DialogHeader>

                <div className="space-y-6 relative">
                    <div className="flex gap-3">
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Find or create a new folder"
                            className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:ring-blue-500/20 text-sm font-medium"
                        />
                        <Button
                            onClick={() => {
                                if (name) onCreate(name)
                            }}
                            className="bg-blue-600 hover:bg-blue-700 h-12 px-6 rounded-xl font-bold shadow-lg shadow-blue-200"
                        >
                            Create folder
                        </Button>
                    </div>

                    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                        <div className="relative mb-4">
                            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-4xl">🎈</div>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 mb-2">No folders... yet</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest px-8">Start using folders to organize your gammas.</p>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button onClick={onClose} className="h-12 px-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-200">
                            Done
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
