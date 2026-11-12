import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    ChatCircleText,
    CheckCircle,
    PaperPlaneRight,
    User,
    Trash
} from '@phosphor-icons/react'
import { Comment } from '@/lib/types'
import { Input } from './ui/input'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from '@/lib/date-utils'

interface CommentsSidebarProps {
    isOpen: boolean
    onClose: () => void
    comments: Comment[]
    onAddComment: (text: string) => void
    onResolve: (id: string) => void
    onDelete: (id: string) => void
}

export function CommentsSidebar({
    isOpen,
    onClose,
    comments,
    onAddComment,
    onResolve,
    onDelete
}: CommentsSidebarProps) {
    const [newComment, setNewComment] = useState('')
    const [filter, setFilter] = useState<'all' | 'unresolved'>('unresolved')

    const filteredComments = comments.filter(c => filter === 'all' || !c.resolved)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (newComment.trim()) {
            onAddComment(newComment.trim())
            setNewComment('')
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.aside
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed top-0 right-0 w-80 h-full bg-white border-l border-slate-100 z-50 shadow-2xl flex flex-col"
                >
                    <header className="p-4 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ChatCircleText weight="fill" className="w-5 h-5 text-blue-600" />
                            <h3 className="font-black text-slate-900 tracking-tight">Comments</h3>
                            <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                                {comments.length}
                            </span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                        >
                            <X weight="bold" className="w-4 h-4" />
                        </button>
                    </header>

                    <div className="flex p-2 gap-1 border-b border-slate-50 bg-slate-50/50">
                        <button
                            onClick={() => setFilter('unresolved')}
                            className={cn(
                                "flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                                filter === 'unresolved' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Unresolved
                        </button>
                        <button
                            onClick={() => setFilter('all')}
                            className={cn(
                                "flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                                filter === 'all' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            All activity
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">
                        {filteredComments.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-30">
                                <ChatCircleText weight="thin" className="w-12 h-12 mb-2" />
                                <p className="text-sm font-bold">No comments yet</p>
                                <p className="text-[11px]">Start a conversation by adding feedback below.</p>
                            </div>
                        ) : (
                            filteredComments.map((comment) => (
                                <div key={comment.id} className="group flex gap-3 relative">
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                                        {comment.avatar ? (
                                            <img src={comment.avatar} alt={comment.author} className="w-full h-full object-cover" />
                                        ) : (
                                            <User weight="bold" className="w-4 h-4 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <span className="text-sm font-black text-slate-900 truncate">{comment.author}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">
                                                {formatDistanceToNow(comment.timestamp)} ago
                                            </span>
                                        </div>
                                        <p className={cn(
                                            "text-xs text-slate-600 leading-relaxed break-words",
                                            comment.resolved && "line-through opacity-50"
                                        )}>
                                            {comment.text}
                                        </p>

                                        <div className="flex items-center gap-3 mt-2">
                                            {!comment.resolved && (
                                                <button
                                                    onClick={() => onResolve(comment.id)}
                                                    className="flex items-center gap-1 text-[10px] font-black text-slate-400 hover:text-emerald-500 transition-colors uppercase tracking-tight"
                                                >
                                                    <CheckCircle weight="bold" /> Resolve
                                                </button>
                                            )}
                                            <button className="text-[10px] font-black text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-tight">
                                                Reply
                                            </button>
                                        </div>
                                    </div>

                                    <div className="absolute top-0 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onDelete(comment.id)}
                                            className="p-1 text-slate-300 hover:text-rose-500 rounded"
                                        >
                                            <Trash weight="bold" className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <footer className="p-4 border-t border-slate-50 bg-white">
                        <form onSubmit={handleSubmit} className="relative">
                            <Input
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="pr-12 bg-slate-50 border-slate-100 rounded-xl focus:ring-blue-500/20 active:scale-[0.99] transition-all text-xs h-10"
                            />
                            <button
                                type="submit"
                                disabled={!newComment.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-200 transition-all shadow-sm"
                            >
                                <PaperPlaneRight weight="fill" className="w-3.5 h-3.5" />
                            </button>
                        </form>
                        <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">
                            Press Enter to post · <span className="text-slate-300">@mention for team</span>
                        </p>
                    </footer>
                </motion.aside>
            )}
        </AnimatePresence>
    )
}
