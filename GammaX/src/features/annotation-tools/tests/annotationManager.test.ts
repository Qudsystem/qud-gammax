import { describe, it, expect, beforeEach } from 'vitest';
import { fc } from 'fast-check';
import { AnnotationManager } from '../services/annotationManager';
import { Annotation, DrawingTool } from '../types';

describe('AnnotationManager', () => {
  let manager: AnnotationManager;

  beforeEach(() => {
    manager = new AnnotationManager();
  });

  describe('Unit Tests - Drawing Tools', () => {
    it('should create arrow annotation', () => {
      const annotation: Annotation = {
        id: '1',
        type: 'arrow',
        startX: 10,
        startY: 10,
        endX: 100,
        endY: 100,
        color: '#FF0000',
        strokeWidth: 2,
        createdAt: new Date(),
      };

      manager.addAnnotation(annotation);
      expect(manager.getAnnotation('1')).toEqual(annotation);
    });

    it('should create circle annotation', () => {
      const annotation: Annotation = {
        id: '1',
        type: 'circle',
        centerX: 50,
        centerY: 50,
        radius: 30,
        color: '#00FF00',
        strokeWidth: 2,
        createdAt: new Date(),
      };

      manager.addAnnotation(annotation);
      expect(manager.getAnnotation('1')?.type).toBe('circle');
    });

    it('should create rectangle annotation', () => {
      const annotation: Annotation = {
        id: '1',
        type: 'rectangle',
        x: 10,
        y: 10,
        width: 200,
        height: 100,
        color: '#0000FF',
        strokeWidth: 2,
        createdAt: new Date(),
      };

      manager.addAnnotation(annotation);
      expect(manager.getAnnotation('1')?.type).toBe('rectangle');
    });

    it('should create text annotation', () => {
      const annotation: Annotation = {
        id: '1',
        type: 'text',
        x: 10,
        y: 10,
        text: 'Sample text',
        fontSize: 14,
        color: '#000000',
        createdAt: new Date(),
      };

      manager.addAnnotation(annotation);
      expect(manager.getAnnotation('1')?.type).toBe('text');
    });
  });

  describe('Property-Based Tests - Persistence', () => {
    it('should preserve annotations through serialization', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.uuid(),
            type: fc.oneof(
              fc.constant('arrow'),
              fc.constant('circle'),
              fc.constant('rectangle')
            ),
            color: fc.hexColor(),
            strokeWidth: fc.integer({ min: 1, max: 10 }),
          }),
          (data) => {
            const annotation: Annotation = {
              ...data,
              startX: 0,
              startY: 0,
              endX: 100,
              endY: 100,
              createdAt: new Date(),
            };

            manager.addAnnotation(annotation);
            const serialized = manager.serialize();
            manager.clear();
            manager.deserialize(serialized);

            const retrieved = manager.getAnnotation(data.id);
            expect(retrieved).toBeDefined();
            expect(retrieved?.color).toBe(data.color);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should maintain layer order after operations', () => {
      fc.assert(
        fc.property(
          fc.array(fc.uuid(), { minLength: 1, maxLength: 20 }),
          (ids) => {
            ids.forEach((id, index) => {
              const annotation: Annotation = {
                id,
                type: 'circle',
                centerX: 50 + index * 5,
                centerY: 50 + index * 5,
                radius: 20,
                color: '#000000',
                strokeWidth: 1,
                createdAt: new Date(),
              };
              manager.addAnnotation(annotation);
            });

            const layers = manager.getLayers();
            expect(layers.length).toBe(ids.length);
            expect(layers[0]).toBe(ids[0]);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Integration Tests', () => {
    it('should support undo/redo operations', () => {
      const annotation: Annotation = {
        id: '1',
        type: 'circle',
        centerX: 50,
        centerY: 50,
        radius: 30,
        color: '#FF0000',
        strokeWidth: 2,
        createdAt: new Date(),
      };

      manager.addAnnotation(annotation);
      expect(manager.getAnnotation('1')).toBeDefined();

      manager.undo();
      expect(manager.getAnnotation('1')).toBeUndefined();

      manager.redo();
      expect(manager.getAnnotation('1')).toBeDefined();
    });

    it('should manage layer visibility', () => {
      const annotation: Annotation = {
        id: '1',
        type: 'rectangle',
        x: 10,
        y: 10,
        width: 100,
        height: 100,
        color: '#0000FF',
        strokeWidth: 2,
        createdAt: new Date(),
      };

      manager.addAnnotation(annotation);
      manager.toggleLayerVisibility('1');
      const layers = manager.getVisibleLayers();
      expect(layers.some((l) => l === '1')).toBe(false);

      manager.toggleLayerVisibility('1');
      const visibleLayers = manager.getVisibleLayers();
      expect(visibleLayers.some((l) => l === '1')).toBe(true);
    });
  });
});
