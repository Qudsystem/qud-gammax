import { describe, it, expect, beforeEach } from 'vitest';
import { AnnotationManager } from '../manager';
import { DrawingTool, Annotation } from '../types';
import fc from 'fast-check';

describe('Annotation Tools', () => {
  let manager: AnnotationManager;

  beforeEach(() => {
    manager = new AnnotationManager();
  });

  // Unit Tests
  describe('Unit Tests for Drawing Tools', () => {
    it('should create arrow annotation', () => {
      const arrow = manager.createArrow({
        startX: 10,
        startY: 10,
        endX: 100,
        endY: 100,
        color: '#000000',
        strokeWidth: 2
      });

      expect(arrow).toBeDefined();
      expect(arrow.type).toBe('arrow');
    });

    it('should create circle annotation', () => {
      const circle = manager.createCircle({
        cx: 50,
        cy: 50,
        radius: 30,
        color: '#FF0000',
        strokeWidth: 2
      });

      expect(circle).toBeDefined();
      expect(circle.type).toBe('circle');
    });

    it('should create rectangle annotation', () => {
      const rect = manager.createRectangle({
        x: 10,
        y: 10,
        width: 100,
        height: 50,
        color: '#00FF00',
        strokeWidth: 2
      });

      expect(rect).toBeDefined();
      expect(rect.type).toBe('rectangle');
    });

    it('should create text annotation', () => {
      const text = manager.createText({
        x: 50,
        y: 50,
        content: 'Test',
        fontSize: 16,
        color: '#000000'
      });

      expect(text).toBeDefined();
      expect(text.type).toBe('text');
      expect(text.content).toBe('Test');
    });

    it('should add and retrieve annotations', () => {
      const annotation = manager.createRectangle({
        x: 10,
        y: 10,
        width: 100,
        height: 50,
        color: '#000000',
        strokeWidth: 2
      });

      manager.addAnnotation(annotation);
      const retrieved = manager.getAnnotation(annotation.id);

      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe(annotation.id);
    });
  });

  // Property-based Tests
  describe('Property-based Tests for Annotation Persistence', () => {
    it('should preserve annotation data through serialization', () => {
      fc.assert(
        fc.property(
          fc.record({
            x: fc.nat(500),
            y: fc.nat(500),
            width: fc.nat(500),
            height: fc.nat(500),
            color: fc.hexColor(),
            strokeWidth: fc.nat({ max: 10 })
          }),
          (props) => {
            const annotation = manager.createRectangle({
              x: props.x,
              y: props.y,
              width: props.width,
              height: props.height,
              color: props.color,
              strokeWidth: props.strokeWidth
            });

            const serialized = manager.serializeAnnotation(annotation);
            const deserialized = manager.deserializeAnnotation(serialized);

            expect(deserialized.x).toBe(props.x);
            expect(deserialized.y).toBe(props.y);
            expect(deserialized.color).toBe(props.color);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain correct layer ordering under property constraints', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 50 }),
          (count) => {
            const annotations: Annotation[] = [];
            for (let i = 0; i < count; i++) {
              const ann = manager.createRectangle({
                x: i * 10,
                y: i * 10,
                width: 50,
                height: 50,
                color: `#${i.toString().padStart(6, '0')}`,
                strokeWidth: 1
              });
              annotations.push(ann);
              manager.addAnnotation(ann);
            }

            const layers = manager.getLayerOrder();
            expect(layers.length).toBe(count);
            
            for (let i = 0; i < layers.length - 1; i++) {
              const zIndex1 = manager.getZIndex(layers[i]);
              const zIndex2 = manager.getZIndex(layers[i + 1]);
              expect(zIndex1).toBeLessThanOrEqual(zIndex2);
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  // Integration Tests
  describe('Integration Tests for Annotation Workflow', () => {
    it('should handle complete annotation workflow', () => {
      // Create annotations
      const circle = manager.createCircle({
        cx: 100,
        cy: 100,
        radius: 30,
        color: '#FF0000',
        strokeWidth: 2
      });

      const arrow = manager.createArrow({
        startX: 10,
        startY: 10,
        endX: 100,
        endY: 100,
        color: '#000000',
        strokeWidth: 2
      });

      manager.addAnnotation(circle);
      manager.addAnnotation(arrow);

      expect(manager.getAllAnnotations().length).toBe(2);

      // Test undo/redo
      manager.delete(circle.id);
      expect(manager.getAllAnnotations().length).toBe(1);

      manager.undo();
      expect(manager.getAllAnnotations().length).toBe(2);

      // Test serialization
      const serialized = manager.serialize();
      expect(serialized).toBeDefined();
      expect(JSON.parse(serialized).annotations.length).toBe(2);
    });

    it('should support layer manipulation', () => {
      const ann1 = manager.createRectangle({
        x: 10, y: 10, width: 50, height: 50,
        color: '#000000', strokeWidth: 1
      });
      const ann2 = manager.createRectangle({
        x: 20, y: 20, width: 50, height: 50,
        color: '#FF0000', strokeWidth: 1
      });

      manager.addAnnotation(ann1);
      manager.addAnnotation(ann2);

      manager.bringToFront(ann1.id);
      const layers = manager.getLayerOrder();
      expect(layers[layers.length - 1]).toBe(ann1.id);

      manager.sendToBack(ann1.id);
      const newLayers = manager.getLayerOrder();
      expect(newLayers[0]).toBe(ann1.id);
    });
  });
});
