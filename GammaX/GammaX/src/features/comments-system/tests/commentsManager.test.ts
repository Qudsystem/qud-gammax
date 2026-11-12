import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommentsManager } from '../services/CommentsManager';
import { kvStorage } from '../../../core/services/kvStorage';
import { eventBus } from '../../../core/services/eventBus';

vi.mock('../../../core/services/kvStorage');
vi.mock('../../../core/services/eventBus');

describe('CommentsManager', () => {
  let manager: CommentsManager;

  beforeEach(() => {
    vi.clearAllMocks();
    (kvStorage as any).get = vi.fn().mockResolvedValue([]);
    (kvStorage as any).set = vi.fn().mockResolvedValue(undefined);
    (kvStorage as any).keys = vi.fn().mockResolvedValue([]);
    manager = CommentsManager.getInstance();
  });

  it('should create a comment', async () => {
    const comment = await manager.createComment({
      presentationId: 'p1',
      slideId: 's1',
      userId: 'u1',
      userName: 'User 1',
      content: 'Test comment'
    });

    expect(comment.id).toBeDefined();
    expect(comment.content).toBe('Test comment');
    expect(kvStorage.set).toHaveBeenCalled();
  });

  it('should get comments for a presentation', async () => {
    const mockComments = [{ id: 'c1', content: 'test' }];
    (kvStorage.get as any).mockResolvedValue(mockComments);

    const comments = await manager.getComments('p1');
    expect(comments).toEqual(mockComments);
  });
});
