import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { CommentsManager } from '../services/CommentsManager';
import { kvStorage } from '../../../core/services/kvStorage';

vi.mock('../../../core/services/kvStorage');

describe('CommentsManager Property Tests', () => {
  let manager: CommentsManager;

  const commentArb = fc.record({
    presentationId: fc.uuid(),
    slideId: fc.uuid(),
    userId: fc.uuid(),
    userName: fc.string({ minLength: 1 }),
    content: fc.string({ minLength: 1 })
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (kvStorage as any).get = vi.fn().mockResolvedValue([]);
    (kvStorage as any).set = vi.fn().mockResolvedValue(undefined);
    (kvStorage as any).keys = vi.fn().mockResolvedValue([]);
    manager = CommentsManager.getInstance();
  });

  it('should create valid comment structure', async () => {
    await fc.assert(
      fc.asyncProperty(commentArb, async (dto) => {
        const comment = await manager.createComment(dto);
        
        expect(comment.id).toBeDefined();
        expect(comment.presentationId).toBe(dto.presentationId);
        expect(comment.slideId).toBe(dto.slideId);
        expect(comment.userId).toBe(dto.userId);
        expect(comment.userName).toBe(dto.userName);
        expect(comment.content).toBe(dto.content);
        expect(comment.createdAt).toBeLessThanOrEqual(Date.now());
        expect(comment.resolved).toBe(false);
      })
    );
  });
});
