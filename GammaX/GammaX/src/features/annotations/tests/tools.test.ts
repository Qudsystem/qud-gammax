import { describe, it, expect, beforeEach } from 'vitest';
import { ArrowTool } from '../tools/ArrowTool';
import { CircleTool } from '../tools/CircleTool';
import { RectangleTool } from '../tools/RectangleTool';
import { LineTool } from '../tools/LineTool';
import { FreehandTool } from '../tools/FreehandTool';
import { TextTool } from '../tools/TextTool';
import { HighlightTool } from '../tools/HighlightTool';
import { EraserTool } from '../tools/EraserTool';
import { Point, AnnotationStyle } from '../types';

describe('Drawing Tools', () => {
  const slideId = 'test-slide';
  const startPoint: Point = { x: 10, y: 10 };
  const endPoint: Point = { x: 100, y: 100 };
  const style: AnnotationStyle = {
    color: '#FF0000',
    strokeWidth: 2,
    opacity: 1
  };

  describe('ArrowTool', () => {
    it('should create an arrow annotation', () => {
      const tool = new ArrowTool(slideId);
      tool.startDrawing(startPoint, style);
      tool.updateDrawing(endPoint);
      const annotation = tool.finishDrawing();

      expect(annotation).not.toBeNull();
      expect(annotation?.type).toBe('arrow');
      expect(annotation?.slideId).toBe(slideId);
      expect(annotation?.geometry.points).toHaveLength(4); // Start, End, 2 arrow head points
    });

    it('should calculate correct bounds', () => {
      const tool = new ArrowTool(slideId);
      tool.startDrawing(startPoint, style);
      tool.updateDrawing(endPoint);
      const annotation = tool.finishDrawing();

      const bounds = annotation?.geometry.bounds;
      expect(bounds).toBeDefined();
      expect(bounds?.x).toBeLessThanOrEqual(startPoint.x);
      expect(bounds?.y).toBeLessThanOrEqual(startPoint.y);
      expect(bounds?.width).toBeGreaterThan(0);
      expect(bounds?.height).toBeGreaterThan(0);
    });
  });

  describe('CircleTool', () => {
    it('should create a circle annotation', () => {
      const tool = new CircleTool(slideId);
      tool.startDrawing(startPoint, style);
      tool.updateDrawing(endPoint);
      const annotation = tool.finishDrawing();

      expect(annotation).not.toBeNull();
      expect(annotation?.type).toBe('circle');
      expect(annotation?.geometry.points).toHaveLength(2); // Center, Radius point
    });
  });

  describe('RectangleTool', () => {
    it('should create a rectangle annotation', () => {
      const tool = new RectangleTool(slideId);
      tool.startDrawing(startPoint, style);
      tool.updateDrawing(endPoint);
      const annotation = tool.finishDrawing();

      expect(annotation).not.toBeNull();
      expect(annotation?.type).toBe('rectangle');
      expect(annotation?.geometry.points).toHaveLength(4); // 4 corners
      expect(annotation?.geometry.bounds).toEqual({
        x: 10,
        y: 10,
        width: 90,
        height: 90
      });
    });
  });

  describe('LineTool', () => {
    it('should create a line annotation', () => {
      const tool = new LineTool(slideId);
      tool.startDrawing(startPoint, style);
      tool.updateDrawing(endPoint);
      const annotation = tool.finishDrawing();

      expect(annotation).not.toBeNull();
      expect(annotation?.type).toBe('line');
      expect(annotation?.geometry.points).toHaveLength(2);
    });
  });

  describe('FreehandTool', () => {
    it('should create a freehand path annotation', () => {
      const tool = new FreehandTool(slideId);
      tool.startDrawing(startPoint, style);
      tool.updateDrawing({ x: 20, y: 20 });
      tool.updateDrawing({ x: 30, y: 30 });
      tool.updateDrawing(endPoint);
      const annotation = tool.finishDrawing();

      expect(annotation).not.toBeNull();
      expect(annotation?.type).toBe('freehand');
      expect(annotation?.geometry.points.length).toBeGreaterThan(2);
    });
  });

  describe('TextTool', () => {
    it('should create a text annotation', () => {
      const tool = new TextTool(slideId);
      tool.startDrawing(startPoint, style);
      tool.setText('Hello World');
      const annotation = tool.finishDrawing();

      expect(annotation).not.toBeNull();
      expect(annotation?.type).toBe('text');
      expect(annotation?.geometry.text).toBe('Hello World');
    });
  });

  describe('HighlightTool', () => {
    it('should create a highlight annotation with reduced opacity', () => {
      const tool = new HighlightTool(slideId);
      tool.startDrawing(startPoint, style);
      tool.updateDrawing(endPoint);
      const annotation = tool.finishDrawing();

      expect(annotation).not.toBeNull();
      expect(annotation?.type).toBe('highlight');
      expect(annotation?.style.opacity).toBe(0.3);
    });
  });

  describe('EraserTool', () => {
    it('should not create an annotation', () => {
      const tool = new EraserTool(slideId);
      tool.startDrawing(startPoint, style);
      tool.updateDrawing(endPoint);
      const annotation = tool.finishDrawing();

      expect(annotation).toBeNull();
    });
  });
});
