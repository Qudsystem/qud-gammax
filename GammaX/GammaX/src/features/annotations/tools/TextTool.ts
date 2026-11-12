import { DrawingTool, Point, Annotation, AnnotationStyle, AnnotationGeometry } from '../types';
import { generateId } from '@/lib/utils';

export class TextTool implements DrawingTool {
  type: 'text' = 'text';
  private startPoint: Point | null = null;
  private style: AnnotationStyle | null = null;
  private slideId: string = '';
  private text: string = '';

  constructor(slideId: string) {
    this.slideId = slideId;
  }

  startDrawing(point: Point, style: AnnotationStyle): void {
    this.startPoint = { ...point };
    this.style = { ...style };
    // In a real UI, this would trigger a text input dialog
    // For now, we'll assume the text is provided later or via a prompt
  }

  updateDrawing(point: Point): void {
    // Text tool usually doesn't update via mouse move, but we could use it for positioning
    this.startPoint = { ...point };
  }

  setText(text: string): void {
    this.text = text;
  }

  finishDrawing(): Annotation | null {
    if (!this.startPoint || !this.style || !this.text) {
      return null;
    }

    const geometry: AnnotationGeometry = {
      points: [this.startPoint],
      text: this.text,
      bounds: {
        x: this.startPoint.x,
        y: this.startPoint.y,
        width: 100, // Approximate
        height: 20  // Approximate
      }
    };

    const annotation: Annotation = {
      id: generateId(),
      slideId: this.slideId,
      type: 'text',
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
    this.style = null;
    this.text = '';
  }

  getPreviewGeometry(): AnnotationGeometry | null {
    if (!this.startPoint) return null;
    return {
      points: [this.startPoint],
      text: this.text || 'Type something...'
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
