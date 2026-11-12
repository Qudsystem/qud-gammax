import { useState, useCallback } from 'react'
import { Comment, CommentReply } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChatCircle, 
  PaperPlaneRight, 
  CheckCircle, 
  Trash,
  ArrowBendDownRight,
  X
} from '@phosphor-icons/react'

interface CommentsPanelProps {
  slideId: string
  comments: Comment[]
  currentUser: { login: string; avatarUrl: string }
  onAddComment: (content: string) => void
  onAddReply: (commentId: string, content: string) => void
  onResolveComment: (commentId: string) => void
  onDeleteComment: (commentId: string) => void
}

export function CommentsPanel({
  slideId,
  comments,
  currentUser,
  onAddComment,
  onAddReply,
  onResolveComment,
  onDeleteComment
}: CommentsPanelProps) {
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [filter, setFilter] = useState<'all' | 'unresolved'>('all')

  const slideComments = comments.filter(c => c.slideId === slideId)
  const filteredComments = filter === 'unresolved' 
    ? slideComments.filter(c => !c.resolved)
    : slideComments

  const handleAddComment = useCallback(() => {
    if (!newComment.trim()) return
    onAddComment(newComment.trim())
    setNewComment('')
  }, [newComment, onAddComment])

  const handleAddReply = useCallback((commentId: string) => {
    if (!replyContent.trim()) return
    onAddReply(commentId, replyContent.trim())
    setReplyContent('')
    setReplyingTo(null)
  }, [replyContent, onAddReply])

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = Date.now()
    const diff = now - timestamp
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <ChatCircle className="w-5 h-5 text-primary" weight="fill" />
          <h3 className="font-semibold text-foreground">Comments</h3>
          <Badge variant="secondary">{slideComments.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'unresolved' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('unresolved')}
          >
            Unresolved
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredComments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-4 rounded-lg border-2 ${
                  comment.resolved 
                    ? 'border-muted bg-muted/30' 
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                    <AvatarFallback>{comment.userName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {comment.userName}
                        </span>
                        {comment.resolved && (
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" weight="fill" />
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>

                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-11 space-y-3 mb-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-2">
                        <ArrowBendDownRight className="w-4 h-4 text-muted-foreground mt-1" />
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={reply.userAvatar} alt={reply.userName} />
                          <AvatarFallback>{reply.userName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-foreground">
                              {reply.userName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-foreground whitespace-pre-wrap break-words">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {replyingTo === comment.id ? (
                  <div className="ml-11 mt-3 space-y-2">
                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      className="min-h-[60px] text-sm"
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAddReply(comment.id)}
                        disabled={!replyContent.trim()}
                      >
                        <PaperPlaneRight className="w-3 h-3 mr-1" weight="fill" />
                        Reply
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReplyingTo(null)
                          setReplyContent('')
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 ml-11 mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(comment.id)}
                    >
                      <ArrowBendDownRight className="w-3 h-3 mr-1" />
                      Reply
                    </Button>
                    {!comment.resolved && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onResolveComment(comment.id)}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolve
                      </Button>
                    )}
                    {comment.userId === currentUser.login && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteComment(comment.id)}
                      >
                        <Trash className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredComments.length === 0 && (
            <div className="text-center py-12">
              <ChatCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {filter === 'unresolved' 
                  ? 'No unresolved comments on this slide'
                  : 'No comments yet. Start a conversation!'}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[80px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleAddComment()
              }
            }}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Press {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+Enter to send
            </span>
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="bg-gradient-to-r from-primary to-accent"
            >
              <PaperPlaneRight className="w-4 h-4 mr-2" weight="fill" />
              Comment
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
