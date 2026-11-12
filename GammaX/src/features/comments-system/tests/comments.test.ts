import { describe, it, expect, beforeEach } from 'vitest';
import { CommentsManager } from '../manager';
import { Comment } from '../types';
import fc from 'fast-check';

describe('Comments System', () => {
  let manager: CommentsManager;

  beforeEach(() => {
    manager = new CommentsManager();
  });

  // Unit Tests
  describe('Unit Tests for Comment Management', () => {
    it('should create and retrieve comment', () => {
      const comment: Comment = {
        id: 'comment-1',
        slideId: 'slide-1',
        content: 'Test comment',
        author: 'user1',
        createdAt: new Date(),
        resolved: false
      };

      manager.addComment(comment);
      const retrieved = manager.getComment('comment-1');

      expect(retrieved).toBeDefined();
      expect(retrieved.content).toBe('Test comment');
    });

    it('should support comment threading', () => {
      const parent: Comment = {
        id: 'comment-1',
        slideId: 'slide-1',
        content: 'Parent comment',
        author: 'user1',
        createdAt: new Date(),
        resolved: false
      };

      const reply: Comment = {
        id: 'comment-2',
        slideId: 'slide-1',
        content: 'Reply comment',
        author: 'user2',
        parentId: 'comment-1',
        createdAt: new Date(),
        resolved: false
      };

      manager.addComment(parent);
      manager.addComment(reply);

      const thread = manager.getThread('comment-1');
      expect(thread.replies.length).toBe(1);
      expect(thread.replies[0].id).toBe('comment-2');
    });

    it('should mark comment as resolved', () => {
      const comment: Comment = {
        id: 'comment-1',
        slideId: 'slide-1',
        content: 'Test',
        author: 'user1',
        createdAt: new Date(),
        resolved: false
      };

      manager.addComment(comment);
      manager.resolveComment('comment-1');

      const resolved = manager.getComment('comment-1');
      expect(resolved.resolved).toBe(true);
    });

    it('should enforce 24-hour edit window', () => {
      const comment: Comment = {
        id: 'comment-1',
        slideId: 'slide-1',
        content: 'Original',
        author: 'user1',
        createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
        resolved: false
      };

      manager.addComment(comment);

      expect(() =>
        manager.updateComment('comment-1', { content: 'Updated' })
      ).toThrow('Edit window expired');
    });
  });

  // Property-based Tests
  describe('Property-based Tests for Thread Structure', () => {
    it('should maintain thread integrity under unlimited nesting', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }),
          (depth) => {
            let parentId: string | undefined;

            for (let i = 0; i < depth; i++) {
              const comment: Comment = {
                id: `comment-${i}`,
                slideId: 'slide-1',
                content: `Comment level ${i}`,
                author: 'user1',
                parentId,
                createdAt: new Date(),
                resolved: false
              };

              manager.addComment(comment);
              parentId = `comment-${i}`;
            }

            const rootThread = manager.getThread('comment-0');
            let currentThread = rootThread;
            let level = 0;

            while (currentThread.replies.length > 0) {
              expect(currentThread.replies.length).toBe(1);
              currentThread = currentThread.replies[0];
              level++;
            }

            expect(level).toBe(depth - 1);
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  // Comment Filtering Tests
  describe('Property-based Tests for Comment Filtering', () => {
    it('should filter comments correctly by resolution state', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              content: fc.string({ minLength: 1, maxLength: 200 }),
              resolved: fc.boolean()
            }),
            { minLength: 1, maxLength: 50 }
          ),
          (comments) => {
            comments.forEach((c, i) => {
              const comment: Comment = {
                id: `comment-${i}`,
                slideId: 'slide-1',
                content: c.content,
                author: 'user1',
                createdAt: new Date(),
                resolved: c.resolved
              };
              manager.addComment(comment);
            });

            const resolved = manager.filterComments({ status: 'resolved' });
            const unresolved = manager.filterComments({ status: 'unresolved' });
            const all = manager.filterComments({ status: 'all' });

            expect(resolved.length).toBe(
              comments.filter(c => c.resolved).length
            );
            expect(unresolved.length).toBe(
              comments.filter(c => !c.resolved).length
            );
            expect(all.length).toBe(comments.length);
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  // Integration Tests
  describe('Integration Tests for Collaboration Workflow', () => {
    it('should handle complete collaboration workflow', () => {
      // Create initial comment
      const comment1: Comment = {
        id: 'comment-1',
        slideId: 'slide-1',
        content: 'Great slide!',
        author: 'user1',
        createdAt: new Date(),
        resolved: false
      };

      manager.addComment(comment1);

      // Add replies
      const reply1: Comment = {
        id: 'comment-2',
        slideId: 'slide-1',
        content: 'Thanks!',
        author: 'user2',
        parentId: 'comment-1',
        createdAt: new Date(),
        resolved: false
      };

      const reply2: Comment = {
        id: 'comment-3',
        slideId: 'slide-1',
        content: 'Agree!',
        author: 'user3',
        parentId: 'comment-1',
        createdAt: new Date(),
        resolved: false
      };

      manager.addComment(reply1);
      manager.addComment(reply2);

      // Get thread
      const thread = manager.getThread('comment-1');
      expect(thread.replies.length).toBe(2);

      // Resolve thread
      manager.resolveComment('comment-1');

      // Get stats
      const stats = manager.getCommentStats('slide-1');
      expect(stats.total).toBe(3);
      expect(stats.resolved).toBe(1);
      expect(stats.unresolved).toBe(2);
    });

    it('should handle soft deletion with thread preservation', () => {
      const parent: Comment = {
        id: 'comment-1',
        slideId: 'slide-1',
        content: 'Parent',
        author: 'user1',
        createdAt: new Date(),
        resolved: false
      };

      const reply: Comment = {
        id: 'comment-2',
        slideId: 'slide-1',
        content: 'Reply',
        author: 'user2',
        parentId: 'comment-1',
        createdAt: new Date(),
        resolved: false
      };

      manager.addComment(parent);
      manager.addComment(reply);

      // Soft delete parent
      manager.softDelete('comment-1');

      // Thread should still exist
      const thread = manager.getThread('comment-1');
      expect(thread).toBeDefined();
      expect(thread.deleted).toBe(true);
      expect(thread.replies.length).toBe(1);
    });
  });
});
