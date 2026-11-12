import { DrawingTool, Point, Annotation, AnnotationStyle, AnnotationGeometry } from '../types';
import { generateId } from '@/lib/utils';

export class CircleTool implements DrawingTool {
  type: 'circle' = 'circle';
  private centerPoint: Point | null = null;
  private currentPoint: Point | null = null;
  private style: AnnotationStyle | null = null;
  private slideId: string = '';

  constructor(slideId: string) {
    this.slideId = slideId;
  }

  startDrawing(point: Point, style: AnnotationStyle): void {
    this.centerPoint = { ...point };
    this.currentPoint = { ...point };
    this.style = { ...style };
  }

  updateDrawing(point: Point): void {
    if (!this.centerPoint) return;
    this.currentPoint = { ...point };
  }

  finishDrawing(): Annotation | null {
    if (!this.centerPoint || !this.currentPoint || !this.style) {
      return null;
    }

    // Calculate circle geometry
    const geometry = this.calculateCircleGeometry(this.centerPoint, this.currentPoint);
    
    // Don't create circles that are too small
    if (geometry.bounds && (geometry.bounds.width < 10 || geometry.bounds.height < 10)) {
      this.reset();
      return null;
    }

    const annotation: Annotation = {
      id: generateId(),
      slideId: this.slideId,
      type: 'circle',
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
    this.centerPoint = null;
    this.currentPoint = null;
    this.style = null;
  }

  private calculateCircleGeometry(center: Point, edge: Point): AnnotationGeometry {
    // Calculate radius from center to edge point
    const radius = Math.sqrt(
      Math.pow(edge.x - center.x, 2) + Math.pow(edge.y - center.y, 2)
    );

    // Create circle points (center + radius info)
    const points = [
      center,
      { x: center.x + radius, y: center.y } // Point on circle edge for radius reference
    ];

    // Calculate bounding box
    const bounds = {
      x: center.x - radius,
      y: center.y - radius,
      width: radius * 2,
      height: radius * 2
    };

    return {
      points,
      bounds
    };
  }

  // Get current preview geometry for rendering during drawing
  getPreviewGeometry(): AnnotationGeometry | null {
    if (!this.centerPoint || !this.currentPoint) {
      return null;
    }
    return this.calculateCircleGeometry(this.centerPoint, this.currentPoint);
  }

  // Static method to render circle to SVG
  static toSVGElement(geometry: AnnotationGeometry, style: AnnotationStyle): {
    element: 'circle';
    attributes: Record<string, string | number>;
  } {
    if (geometry.points.length < 2 || !geometry.bounds) {
      return {
        element: 'circle',
        attributes: { cx: 0, cy: 0, r: 0 }
      };
    }

    const [center] = geometry.points;
    const radius = geometry.bounds.width / 2;

    return {
      element: 'circle',
      attributes: {
        cx: center.x,
        cy: center.y,
        r: radius,
        fill: style.fillColor || 'none',
        stroke: style.color,
        'stroke-width': style.strokeWidth,
        opacity: style.opacity || 1
      }
    };
  }

  // Static method to check if point is inside or near circle
  static hitTest(point: Point, geometry: AnnotationGeometry, tolerance: number = 5): boolean {
    if (geometry.points.length < 2 || !geometry.bounds) return false;

    const [center] = geometry.points;
    const radius = geometry.bounds.width / 2;
    
    // Calculate distance from point to center
    const distance = Math.sqrt(
      Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2)
    );

    // Check if point is near the circle edge (within tolerance)
    return Math.abs(distance - radius) <= tolerance;
  }

  // Static method to check if point is inside circle
  static isPointInside(point: Point, geometry: AnnotationGeometry): boolean {
    if (geometry.points.length < 2 || !geometry.bounds) return false;

    const [center] = geometry.points;
    const radius = geometry.bounds.width / 2;
    
    const distance = Math.sqrt(
      Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2)
    );

    return distance <= radius;
  }

  // Get circle properties for editing
  static getCircleProperties(geometry: AnnotationGeometry): {
    center: Point;
    radius: number;
  } | null {
    if (geometry.points.length < 2 || !geometry.bounds) return null;

    const [center] = geometry.points;
    const radius = geometry.bounds.width / 2;

    return { center, radius };
  }

  // Update circle geometry with new center and radius
  static updateCircleGeometry(
    center: Point, 
    radius: number
  ): AnnotationGeometry {
    const points = [
      center,
      { x: center.x + radius, y: center.y }
    ];

    const bounds = {
      x: center.x - radius,
      y: center.y - radius,
      width: radius * 2,
      height: radius * 2
    };

    return { points, bounds };
  }
}