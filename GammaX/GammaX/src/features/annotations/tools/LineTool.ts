import { DrawingTool, Point, Annotation, AnnotationStyle, AnnotationGeometry } from '../types';
import { generateId } from '@/lib/utils';

export class LineTool implements DrawingTool {
  type: 'line' = 'line';
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
    this.style = { ...style };
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
      points: [{ ...this.startPoint }, { ...this.currentPoint }],
      bounds: this.calculateBounds(this.startPoint, this.currentPoint)
    };

    const annotation: Annotation = {
      id: generateId(),
      slideId: this.slideId,
      type: 'line',
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

  static toSVGPath(geometry: AnnotationGeometry): string {
    if (geometry.points.length < 2) return '';
    const [start, end] = geometry.points;
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  }

  static hitTest(point: Point, geometry: AnnotationGeometry, tolerance: number = 5): boolean {
    if (geometry.points.length < 2) return false;
    const [start, end] = geometry.points;
    return this.pointToLineDistance(point, start, end) <= tolerance;
  }

  private static pointToLineDistance(point: Point, lineStart: Point, lineEnd: Point): number {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    if (lenSq === 0) return Math.sqrt(A * A + B * B);

    let param = dot / lenSq;
    let xx, yy;

    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }

    return Math.sqrt(Math.pow(point.x - xx, 2) + Math.pow(point.y - yy, 2));
  }
}
