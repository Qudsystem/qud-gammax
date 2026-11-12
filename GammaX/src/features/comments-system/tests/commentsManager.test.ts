import { describe, it, expect, beforeEach } from 'vitest';
import { fc } from 'fast-check';
import { CommentsManager } from '../services/commentsManager';
import { Comment } from '../types';

describe('CommentsManager', () => {
  let manager: CommentsManager;

  beforeEach(() => {
    manager = new CommentsManager();
  });

  describe('Unit Tests - Comment Management', () => {
    it('should create a comment', () => {
      const comment: Comment = {
        id: '1',
        text: 'Great slide',
        author: 'user1',
        slideIndex: 0,
        createdAt: new Date(),
        resolved: false,
      };

      manager.addComment(comment);
      expect(manager.getComment('1')).toEqual(comment);
    });

    it('should create threaded comments', () => {
      const parent: Comment = {
        id: '1',
        text: 'Parent comment',
        author: 'user1',
        slideIndex: 0,
        createdAt: new Date(),
        resolved: false,
      };

      const reply: Comment = {
        id: '2',
        text: 'Reply to parent',
        author: 'user2',
        slideIndex: 0,
        parentId: '1',
        createdAt: new Date(),
        resolved: false,
      };

      manager.addComment(parent);
      manager.addComment(reply);
      const thread = manager.getThread('1');
      expect(thread.replies.length).toBe(1);
    });

    it('should resolve comments', () => {
      const comment: Comment = {
        id: '1',
        text: 'Issue to fix',
        author: 'user1',
        slideIndex: 0,
        createdAt: new Date(),
        resolved: false,
      };

      manager.addComment(comment);
      manager.resolveComment('1');
      expect(manager.getComment('1')?.resolved).toBe(true);
    });

    it('should filter comments by status', () => {
      const comment1: Comment = {
        id: '1',
        text: 'Unresolved',
        author: 'user1',
        slideIndex: 0,
        createdAt: new Date(),
        resolved: false,
      };

      const comment2: Comment = {
        id: '2',
        text: 'Resolved',
        author: 'user1',
        slideIndex: 0,
        createdAt: new Date(),
        resolved: true,
      };

      manager.addComment(comment1);
      manager.addComment(comment2);
      const unresolved = manager.getUnresolvedComments();
      expect(unresolved.length).toBe(1);
    });
  });

  describe('Property-Based Tests - Thread Structure', () => {
    it('should maintain thread structure under nested comments', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              text: fc.string({ minLength: 1, maxLength: 500 }),
              author: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (commentData) => {
            // Add root comment
            const root: Comment = {
              ...commentData[0],
              slideIndex: 0,
              createdAt: new Date(),
              resolved: false,
            };
            manager.addComment(root);

            // Add replies
            for (let i = 1; i < commentData.length; i++) {
              const reply: Comment = {
                ...commentData[i],
                slideIndex: 0,
                parentId: root.id,
                createdAt: new Date(),
                resolved: false,
              };
              manager.addComment(reply);
            }

            const thread = manager.getThread(root.id);
            expect(thread.replies.length).toBe(commentData.length - 1);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Integration Tests - Collaboration Workflow', () => {
    it('should track comments per slide', () => {
      const comment1: Comment = {
        id: '1',
        text: 'Comment on slide 0',
        author: 'user1',
        slideIndex: 0,
        createdAt: new Date(),
        resolved: false,
      };

      const comment2: Comment = {
        id: '2',
        text: 'Comment on slide 1',
        author: 'user1',
        slideIndex: 1,
        createdAt: new Date(),
        resolved: false,
      };

      manager.addComment(comment1);
      manager.addComment(comment2);
      const slideComments = manager.getCommentsBySlide(0);
      expect(slideComments.length).toBe(1);
    });

    it('should enforce 24-hour edit window', () => {
      const now = new Date();
      const oldDate = new Date(now.getTime() - 25 * 60 * 60 * 1000); // 25 hours ago

      const comment: Comment = {
        id: '1',
        text: 'Old comment',
        author: 'user1',
        slideIndex: 0,
        createdAt: oldDate,
        resolved: false,
      };

      manager.addComment(comment);
      const canEdit = manager.canEditComment('1');
      expect(canEdit).toBe(false);
    });

    it('should preserve thread on soft delete', () => {
      const parent: Comment = {
        id: '1',
        text: 'Parent',
        author: 'user1',
        slideIndex: 0,
        createdAt: new Date(),
        resolved: false,
      };

      const reply: Comment = {
        id: '2',
        text: 'Reply',
        author: 'user2',
        slideIndex: 0,
        parentId: '1',
        createdAt: new Date(),
        resolved: false,
      };

      manager.addComment(parent);
      manager.addComment(reply);
      manager.softDeleteComment('1');

      const thread = manager.getThread('1');
      expect(thread).toBeDefined();
      expect(thread?.replies.length).toBe(1);
    });
  });
});
