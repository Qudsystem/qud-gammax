import { DrawingTool, Point, Annotation, AnnotationStyle, AnnotationGeometry } from '../types';
import { generateId } from '@/lib/utils';

export class RectangleTool implements DrawingTool {
  type: 'rectangle' = 'rectangle';
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

    // Calculate rectangle geometry
    const geometry = this.calculateRectangleGeometry(this.startPoint, this.currentPoint);
    
    // Don't create rectangles that are too small
    if (geometry.bounds && (geometry.bounds.width < 5 || geometry.bounds.height < 5)) {
      this.reset();
      return null;
    }

    const annotation: Annotation = {
      id: generateId(),
      slideId: this.slideId,
      type: 'rectangle',
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

  private calculateRectangleGeometry(start: Point, end: Point): AnnotationGeometry {
    // Calculate rectangle bounds
    const minX = Math.min(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxX = Math.max(start.x, end.x);
    const maxY = Math.max(start.y, end.y);

    // Create rectangle corner points (clockwise from top-left)
    const points = [
      { x: minX, y: minY },     // Top-left
      { x: maxX, y: minY },     // Top-right
      { x: maxX, y: maxY },     // Bottom-right
      { x: minX, y: maxY }      // Bottom-left
    ];

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
    return this.calculateRectangleGeometry(this.startPoint, this.currentPoint);
  }

  // Static method to render rectangle to SVG
  static toSVGElement(geometry: AnnotationGeometry, style: AnnotationStyle): {
    element: 'rect';
    attributes: Record<string, string | number>;
  } {
    if (!geometry.bounds) {
      return {
        element: 'rect',
        attributes: { x: 0, y: 0, width: 0, height: 0 }
      };
    }

    return {
      element: 'rect',
      attributes: {
        x: geometry.bounds.x,
        y: geometry.bounds.y,
        width: geometry.bounds.width,
        height: geometry.bounds.height,
        fill: style.fillColor || 'none',
        stroke: style.color,
        'stroke-width': style.strokeWidth,
        opacity: style.opacity || 1,
        rx: 0, // No rounded corners by default
        ry: 0
      }
    };
  }

  // Static method to render rounded rectangle
  static toRoundedSVGElement(
    geometry: AnnotationGeometry, 
    style: AnnotationStyle, 
    borderRadius: number = 5
  ): {
    element: 'rect';
    attributes: Record<string, string | number>;
  } {
    const baseElement = this.toSVGElement(geometry, style);
    return {
      ...baseElement,
      attributes: {
        ...baseElement.attributes,
        rx: borderRadius,
        ry: borderRadius
      }
    };
  }

  // Static method to check if point is inside or near rectangle
  static hitTest(point: Point, geometry: AnnotationGeometry, tolerance: number = 5): boolean {
    if (!geometry.bounds) return false;

    const { x, y, width, height } = geometry.bounds;
    
    // Check if point is inside rectangle
    const insideX = point.x >= x && point.x <= x + width;
    const insideY = point.y >= y && point.y <= y + height;
    
    if (insideX && insideY) return true;

    // Check if point is near rectangle edges
    const nearLeft = Math.abs(point.x - x) <= tolerance && point.y >= y - tolerance && point.y <= y + height + tolerance;
    const nearRight = Math.abs(point.x - (x + width)) <= tolerance && point.y >= y - tolerance && point.y <= y + height + tolerance;
    const nearTop = Math.abs(point.y - y) <= tolerance && point.x >= x - tolerance && point.x <= x + width + tolerance;
    const nearBottom = Math.abs(point.y - (y + height)) <= tolerance && point.x >= x - tolerance && point.x <= x + width + tolerance;

    return nearLeft || nearRight || nearTop || nearBottom;
  }

  // Static method to check if point is inside rectangle (for filled rectangles)
  static isPointInside(point: Point, geometry: AnnotationGeometry): boolean {
    if (!geometry.bounds) return false;

    const { x, y, width, height } = geometry.bounds;
    return point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height;
  }

  // Get rectangle properties for editing
  static getRectangleProperties(geometry: AnnotationGeometry): {
    topLeft: Point;
    bottomRight: Point;
    width: number;
    height: number;
  } | null {
    if (!geometry.bounds) return null;

    const { x, y, width, height } = geometry.bounds;
    return {
      topLeft: { x, y },
      bottomRight: { x: x + width, y: y + height },
      width,
      height
    };
  }

  // Update rectangle geometry with new bounds
  static updateRectangleGeometry(
    topLeft: Point,
    bottomRight: Point
  ): AnnotationGeometry {
    const minX = Math.min(topLeft.x, bottomRight.x);
    const minY = Math.min(topLeft.y, bottomRight.y);
    const maxX = Math.max(topLeft.x, bottomRight.x);
    const maxY = Math.max(topLeft.y, bottomRight.y);

    const points = [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
      { x: minX, y: maxY }
    ];

    const bounds = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };

    return { points, bounds };
  }

  // Get resize handles for rectangle editing
  static getResizeHandles(geometry: AnnotationGeometry): Point[] {
    if (!geometry.bounds) return [];

    const { x, y, width, height } = geometry.bounds;
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    return [
      { x, y },                           // Top-left
      { x: centerX, y },                  // Top-center
      { x: x + width, y },                // Top-right
      { x: x + width, y: centerY },       // Middle-right
      { x: x + width, y: y + height },    // Bottom-right
      { x: centerX, y: y + height },      // Bottom-center
      { x, y: y + height },               // Bottom-left
      { x, y: centerY }                   // Middle-left
    ];
  }

  // Check which resize handle is being clicked
  static getResizeHandleIndex(point: Point, geometry: AnnotationGeometry, tolerance: number = 8): number {
    const handles = this.getResizeHandles(geometry);
    
    for (let i = 0; i < handles.length; i++) {
      const handle = handles[i];
      const distance = Math.sqrt(
        Math.pow(point.x - handle.x, 2) + Math.pow(point.y - handle.y, 2)
      );
      
      if (distance <= tolerance) {
        return i;
      }
    }
    
    return -1; // No handle clicked
  }
}