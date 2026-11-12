import { DrawingTool, Point, Annotation, AnnotationStyle, AnnotationGeometry } from '../types';
import { generateId } from '@/lib/utils';

export class ArrowTool implements DrawingTool {
  type: 'arrow' = 'arrow';
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

    // Calculate arrow geometry
    const geometry = this.calculateArrowGeometry(this.startPoint, this.currentPoint);
    
    const annotation: Annotation = {
      id: generateId(),
      slideId: this.slideId,
      type: 'arrow',
      geometry,
      style: this.style,
      layer: Date.now(), // Use timestamp as layer for ordering
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

  private calculateArrowGeometry(start: Point, end: Point): AnnotationGeometry {
    // Calculate arrow head size based on line length
    const lineLength = Math.sqrt(
      Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
    );
    const arrowHeadSize = Math.min(lineLength * 0.2, 20); // Max 20px arrow head

    // Calculate arrow head angle
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const arrowAngle = Math.PI / 6; // 30 degrees

    // Calculate arrow head points
    const arrowHead1: Point = {
      x: end.x - arrowHeadSize * Math.cos(angle - arrowAngle),
      y: end.y - arrowHeadSize * Math.sin(angle - arrowAngle)
    };

    const arrowHead2: Point = {
      x: end.x - arrowHeadSize * Math.cos(angle + arrowAngle),
      y: end.y - arrowHeadSize * Math.sin(angle + arrowAngle)
    };

    // Create points array: [start, end, arrowHead1, arrowHead2]
    const points = [start, end, arrowHead1, arrowHead2];

    // Calculate bounding box
    const minX = Math.min(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxX = Math.max(...points.map(p => p.x));
    const maxY = Math.max(...points.map(p => p.y));

    const bounds = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };

    return {
      points,
      bounds
    };
  }

  // Get current preview geometry for rendering during drawing
  getPreviewGeometry(): AnnotationGeometry | null {
    if (!this.startPoint || !this.currentPoint) {
      return null;
    }
    return this.calculateArrowGeometry(this.startPoint, this.currentPoint);
  }

  // Static method to render arrow to SVG path
  static toSVGPath(geometry: AnnotationGeometry, style: AnnotationStyle): string {
    if (geometry.points.length < 4) return '';

    const [start, end, arrowHead1, arrowHead2] = geometry.points;

    // Create SVG path for arrow line and head
    const pathData = [
      `M ${start.x} ${start.y}`, // Move to start
      `L ${end.x} ${end.y}`,     // Line to end
      `M ${end.x} ${end.y}`,     // Move to arrow tip
      `L ${arrowHead1.x} ${arrowHead1.y}`, // First arrow head line
      `M ${end.x} ${end.y}`,     // Move back to arrow tip
      `L ${arrowHead2.x} ${arrowHead2.y}`  // Second arrow head line
    ].join(' ');

    return pathData;
  }

  // Static method to check if point is near arrow
  static hitTest(point: Point, geometry: AnnotationGeometry, tolerance: number = 5): boolean {
    if (geometry.points.length < 2) return false;

    const [start, end] = geometry.points;
    
    // Check distance from point to line segment
    const distance = this.pointToLineDistance(point, start, end);
    return distance <= tolerance;
  }

  private static pointToLineDistance(point: Point, lineStart: Point, lineEnd: Point): number {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) {
      // Line start and end are the same point
      return Math.sqrt(A * A + B * B);
    }

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

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }
}