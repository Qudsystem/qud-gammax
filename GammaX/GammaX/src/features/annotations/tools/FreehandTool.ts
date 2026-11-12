import { DrawingTool, Point, Annotation, AnnotationStyle, AnnotationGeometry } from '../types';
import { generateId } from '@/lib/utils';

export class FreehandTool implements DrawingTool {
  type: 'freehand' = 'freehand';
  private points: Point[] = [];
  private style: AnnotationStyle | null = null;
  private slideId: string = '';

  constructor(slideId: string) {
    this.slideId = slideId;
  }

  startDrawing(point: Point, style: AnnotationStyle): void {
    this.points = [{ ...point }];
    this.style = { ...style };
  }

  updateDrawing(point: Point): void {
    if (this.points.length === 0) return;
    this.points.push({ ...point });
  }

  finishDrawing(): Annotation | null {
    if (this.points.length < 2 || !this.style) {
      return null;
    }

    const geometry: AnnotationGeometry = {
      points: [...this.points],
      bounds: this.calculateBounds(this.points)
    };

    const annotation: Annotation = {
      id: generateId(),
      slideId: this.slideId,
      type: 'freehand',
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
    this.points = [];
    this.style = null;
  }

  private calculateBounds(points: Point[]) {
    const minX = Math.min(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxX = Math.max(...points.map(p => p.x));
    const maxY = Math.max(...points.map(p => p.y));

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  getPreviewGeometry(): AnnotationGeometry | null {
    if (this.points.length < 2) return null;
    return {
      points: this.points,
      bounds: this.calculateBounds(this.points)
    };
  }

  static toSVGPath(geometry: AnnotationGeometry): string {
    if (geometry.points.length < 2) return '';
    const [start, ...rest] = geometry.points;
    return `M ${start.x} ${start.y} ${rest.map(p => `L ${p.x} ${p.y}`).join(' ')}`;
  }

  static hitTest(point: Point, geometry: AnnotationGeometry, tolerance: number = 5): boolean {
    if (geometry.points.length < 2) return false;
    
    for (let i = 0; i < geometry.points.length - 1; i++) {
      const start = geometry.points[i];
      const end = geometry.points[i + 1];
      if (this.pointToLineDistance(point, start, end) <= tolerance) {
        return true;
      }
    }
    return false;
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
