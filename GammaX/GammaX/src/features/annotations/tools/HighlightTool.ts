import { DrawingTool, Point, Annotation, AnnotationStyle, AnnotationGeometry } from '../types';
import { generateId } from '@/lib/utils';

export class HighlightTool implements DrawingTool {
  type: 'highlight' = 'highlight';
  private startPoint: Point | null = null;
  private currentPoint: Point | null = null;
  private style: AnnotationStyle | null = null;
  private slideId: string = '';

  constructor(slideId: string) {
    this.slideId = slideId;
  }

  startDrawing(point: Point, style: AnnotationStyle): void {
    this.startPoint = { ...point };
    this.currentPoint = { ...point };
    this.style = { ...style, opacity: 0.3 }; // Forced low opacity for highlighting
  }

  updateDrawing(point: Point): void {
    if (!this.startPoint) return;
    this.currentPoint = { ...point };
  }

  finishDrawing(): Annotation | null {
    if (!this.startPoint || !this.currentPoint || !this.style) {
      return null;
    }

    const geometry: AnnotationGeometry = {
      points: [this.startPoint, this.currentPoint],
      bounds: this.calculateBounds(this.startPoint, this.currentPoint)
    };

    const annotation: Annotation = {
      id: generateId(),
      slideId: this.slideId,
      type: 'highlight',
      geometry,
      style: this.style,
      layer: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.reset();
    return annotation;
  }

  cancelDrawing(): void {
    this.reset();
  }

  private reset(): void {
    this.startPoint = null;
    this.currentPoint = null;
    this.style = null;
  }

  private calculateBounds(start: Point, end: Point) {
    const minX = Math.min(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxX = Math.max(start.x, end.x);
    const maxY = Math.max(start.y, end.y);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  getPreviewGeometry(): AnnotationGeometry | null {
    if (!this.startPoint || !this.currentPoint) return null;
    return {
      points: [this.startPoint, this.currentPoint],
      bounds: this.calculateBounds(this.startPoint, this.currentPoint)
    };
  }

  static toSVGAttributes(geometry: AnnotationGeometry): any {
    if (!geometry.bounds) return {};
    return {
      x: geometry.bounds.x,
      y: geometry.bounds.y,
      width: geometry.bounds.width,
      height: geometry.bounds.height
    };
  }

  static hitTest(point: Point, geometry: AnnotationGeometry): boolean {
    if (!geometry.bounds) return false;
    const { x, y, width, height } = geometry.bounds;
    return (
      point.x >= x &&
      point.x <= x + width &&
      point.y >= y &&
      point.y <= y + height
    );
  }
}
