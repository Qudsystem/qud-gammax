import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { AnnotationManager } from '../AnnotationManager';
import { KVStorageService } from '../../../core/services/kvStorage';
import { eventBus } from '../../../core/services/eventBus';
import { Annotation, AnnotationStyle } from '../types';

// Mock dependencies
vi.mock('../../../core/services/kvStorage');
vi.mock('../../../core/services/eventBus');

describe('AnnotationManager', () => {
  let manager: AnnotationManager;
  let mockStorage: any;
  let mockEventBus: any;

  const mockAnnotation: Annotation = {
    id: 'test-annotation',
    slideId: 'slide-1',
    type: 'arrow',
    geometry: {
      points: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
      bounds: { x: 0, y: 0, width: 100, height: 100 }
    },
    style: {
      color: '#000',
      strokeWidth: 2,
      opacity: 1
    },
    layer: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockStorage = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn()
    };
    
    mockEventBus = {
      emit: vi.fn()
    };

    (KVStorageService as any).mockImplementation(() => mockStorage);
    (eventBus.emit as Mock) = mockEventBus.emit;

    manager = new AnnotationManager({ autoSaveInterval: 0 }); // Disable auto-save for tests
  });

  describe('createAnnotation', () => {
    it('should add an annotation and emit event', async () => {
      await manager.createAnnotation('slide-1', mockAnnotation);

      const annotations = await manager.getAnnotations('slide-1');
      expect(annotations).toHaveLength(1);
      expect(annotations[0].id).toBe(mockAnnotation.id);

      expect(mockEventBus.emit).toHaveBeenCalledWith(
        'annotation:change',
        expect.objectContaining({ type: 'created', annotation: mockAnnotation })
      );
    });
  });

  describe('updateAnnotation', () => {
    it('should update an existing annotation', async () => {
      await manager.createAnnotation('slide-1', mockAnnotation);
      
      const updates = { style: { ...mockAnnotation.style, color: '#F00' } };
      await manager.updateAnnotation(mockAnnotation.id, updates);

      const annotations = await manager.getAnnotations('slide-1');
      expect(annotations[0].style.color).toBe('#F00');
    });

    it('should throw error if annotation not found', async () => {
      await expect(manager.updateAnnotation('non-existent', {}))
        .rejects.toThrow('Annotation not found');
    });
  });

  describe('deleteAnnotation', () => {
    it('should remove an annotation', async () => {
      await manager.createAnnotation('slide-1', mockAnnotation);
      await manager.deleteAnnotation(mockAnnotation.id);

      const annotations = await manager.getAnnotations('slide-1');
      expect(annotations).toHaveLength(0);
    });
  });

  describe('undo/redo', () => {
    it('should undo last action', async () => {
      await manager.createAnnotation('slide-1', mockAnnotation);
      expect(manager.canUndo()).toBe(true);

      manager.undo();
      const annotations = await manager.getAnnotations('slide-1');
      expect(annotations).toHaveLength(0);
    });

    it('should redo undone action', async () => {
      await manager.createAnnotation('slide-1', mockAnnotation);
      manager.undo();
      expect(manager.canRedo()).toBe(true);

      manager.redo();
      const annotations = await manager.getAnnotations('slide-1');
      expect(annotations).toHaveLength(1);
    });
  });

  describe('Layer Management', () => {
    it('should return annotations sorted by layer', async () => {
      const a1 = { ...mockAnnotation, id: '1', layer: 10 };
      const a2 = { ...mockAnnotation, id: '2', layer: 5 };
      const a3 = { ...mockAnnotation, id: '3', layer: 15 };

      await manager.createAnnotation('slide-1', a1);
      await manager.createAnnotation('slide-1', a2);
      await manager.createAnnotation('slide-1', a3);

      const annotations = await manager.getAnnotations('slide-1');
      expect(annotations.map(a => a.id)).toEqual(['2', '1', '3']);
    });
  });
});
