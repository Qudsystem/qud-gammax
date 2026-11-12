import { Comment, CommentCreateDTO, CommentUpdateDTO, CommentsManager as ICommentsManager } from '../types';
import { kvStorage } from '@/core/services/kvStorage';
import { eventBus } from '@/core/services/eventBus';
import { generateId } from '@/lib/utils';

export class CommentsManager implements ICommentsManager {
  private static instance: CommentsManager;

  private constructor() {}

  public static getInstance(): CommentsManager {
    if (!CommentsManager.instance) {
      CommentsManager.instance = new CommentsManager();
    }
    return CommentsManager.instance;
  }

  async createComment(dto: CommentCreateDTO): Promise<Comment> {
    const comment: Comment = {
      id: generateId(),
      ...dto,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      resolved: false,
      replies: []
    };

    const comments = await this.getComments(dto.presentationId);
    
    // If it's a reply, add to parent
    if (dto.parentId) {
      const parent = comments.find(c => c.id === dto.parentId);
      if (parent) {
        if (!parent.replies) parent.replies = [];
        parent.replies.push(comment);
        // Also add to top level for storage but with parentId
        comments.push(comment);
      } else {
        throw new Error('Parent comment not found');
      }
    } else {
      comments.push(comment);
    }

    await this.saveComments(dto.presentationId, comments);
    eventBus.emit('comment:created', comment);
    
    return comment;
  }

  async updateComment(id: string, updates: CommentUpdateDTO): Promise<Comment> {
    // This is a simplified implementation - in real world we'd need to find the presentationId first
    // For now assuming we can get it from context or search all (inefficient)
    // Or simpler: assume caller passes presentationId, but interface doesn't have it.
    // Let's search all keys for now or change interface.
    // Actually, let's assume we store comments by presentationId.
    
    // Without presentationId, this is hard. Let's assume we fetch all active presentations? 
    // Or maybe we just search the storage keys.
    const keys = await kvStorage.keys();
    const commentKeys = keys.filter(k => k.startsWith('comments:'));
    
    for (const key of commentKeys) {
      const comments = await kvStorage.get<Comment[]>(key) || [];
      const index = comments.findIndex(c => c.id === id);
      
      if (index !== -1) {
        const comment = comments[index];
        const updatedComment = {
          ...comment,
          ...updates,
          updatedAt: Date.now()
        };
        
        comments[index] = updatedComment;
        await kvStorage.set(key, comments);
        eventBus.emit('comment:updated', updatedComment);
        return updatedComment;
      }
    }
    
    throw new Error('Comment not found');
  }

  async deleteComment(id: string): Promise<void> {
    const keys = await kvStorage.keys();
    const commentKeys = keys.filter(k => k.startsWith('comments:'));
    
    for (const key of commentKeys) {
      const comments = await kvStorage.get<Comment[]>(key) || [];
      const index = comments.findIndex(c => c.id === id);
      
      if (index !== -1) {
        // Soft delete could be implemented here, but for now hard delete
        const deleted = comments.splice(index, 1)[0];
        await kvStorage.set(key, comments);
        eventBus.emit('comment:deleted', deleted);
        return;
      }
    }
    
    throw new Error('Comment not found');
  }

  async getComments(presentationId: string): Promise<Comment[]> {
    const comments = await kvStorage.get<Comment[]>(`comments:${presentationId}`);
    return comments || [];
  }

  async getCommentsBySlide(presentationId: string, slideId: string): Promise<Comment[]> {
    const allComments = await this.getComments(presentationId);
    return allComments.filter(c => c.slideId === slideId && !c.parentId); // Only top-level comments
  }

  async resolveComment(id: string, userId: string): Promise<Comment> {
    return this.updateComment(id, { resolved: true });
    // In a real implementation we would add resolvedBy/resolvedAt
  }

  private async saveComments(presentationId: string, comments: Comment[]): Promise<void> {
    await kvStorage.set(`comments:${presentationId}`, comments);
  }
}

export const commentsManager = CommentsManager.getInstance();
