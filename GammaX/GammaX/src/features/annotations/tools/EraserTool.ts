import { DrawingTool, Point, Annotation, AnnotationStyle, AnnotationGeometry } from '../types';

export class EraserTool implements DrawingTool {
  type: 'eraser' = 'eraser';
  private currentPoint: Point | null = null;
  private slideId: string = '';

  constructor(slideId: string) {
    this.slideId = slideId;
  }

  startDrawing(point: Point, style: AnnotationStyle): void {
    this.currentPoint = { ...point };
  }

  updateDrawing(point: Point): void {
    this.currentPoint = { ...point };
  }

  finishDrawing(): Annotation | null {
    // Eraser doesn't create new annotations
    this.reset();
    return null;
  }

  cancelDrawing(): void {
    this.reset();
  }

  private reset(): void {
    this.currentPoint = null;
  }

  getEraserPoint(): Point | null {
    return this.currentPoint;
  }

  // Logic for deleting annotations would be handled by the AnnotationManager
  // using this tool's current position and a hit test
}
