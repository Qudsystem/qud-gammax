// Annotation Types
export type AnnotationTool = 
  | 'arrow'
  | 'circle'
  | 'rectangle'
  | 'line'
  | 'freehand'
  | 'text'
  | 'highlight'
  | 'eraser';

export interface Point {
  x: number;
  y: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AnnotationGeometry {
  points: Point[];
  bounds?: BoundingBox;
  text?: string;
}

export interface AnnotationStyle {
  color: string;
  strokeWidth: number;
  fillColor?: string;
  opacity?: number;
  fontSize?: number;
  fontFamily?: string;
}

export interface Annotation {
  id: string;
  slideId: string;
  type: AnnotationTool;
  geometry: AnnotationGeometry;
  style: AnnotationStyle;
  layer: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnnotationState {
  annotations: Map<string, Annotation>;
  timestamp: Date;
}

export interface AnnotationHistory {
  past: AnnotationState[];
  present: AnnotationState;
  future: AnnotationState[];
}

// Drawing tool interfaces
export interface DrawingTool {
  type: AnnotationTool;
  startDrawing(point: Point, style: AnnotationStyle): void;
  updateDrawing(point: Point): void;
  finishDrawing(): Annotation | null;
  cancelDrawing(): void;
}

export interface AnnotationManager {
  createAnnotation(slideId: string, annotation: Annotation): Promise<void>;
  updateAnnotation(id: string, updates: Partial<Annotation>): Promise<void>;
  deleteAnnotation(id: string): Promise<void>;
  getAnnotations(slideId: string): Promise<Annotation[]>;
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
}

// Color palette for annotations
export const ANNOTATION_COLORS = [
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
  '#FFC0CB', // Pink
  '#A52A2A', // Brown
  '#808080', // Gray
  '#000000', // Black
  '#FFFFFF', // White
  '#FFD700', // Gold
  '#32CD32', // Lime Green
  '#FF69B4'  // Hot Pink
];

// Default styles
export const DEFAULT_ANNOTATION_STYLE: AnnotationStyle = {
  color: '#FF0000',
  strokeWidth: 2,
  opacity: 1,
  fontSize: 16,
  fontFamily: 'Arial, sans-serif'
};

// Stroke width options
export const STROKE_WIDTH_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Error types
export class AnnotationError extends Error {
  constructor(
    message: string,
    public code: string,
    public annotationId?: string
  ) {
    super(message);
    this.name = 'AnnotationError';
  }
}

// Events
export interface AnnotationEvent {
  type: 'created' | 'updated' | 'deleted' | 'selected' | 'deselected';
  annotation: Annotation;
  timestamp: Date;
}

// Configuration
export interface AnnotationConfig {
  maxHistorySize: number;
  autoSaveInterval: number;
  defaultStyle: AnnotationStyle;
  enableSnapping: boolean;
  snapTolerance: number;
}

export const DEFAULT_ANNOTATION_CONFIG: AnnotationConfig = {
  maxHistorySize: 20,
  autoSaveInterval: 5000, // 5 seconds
  defaultStyle: DEFAULT_ANNOTATION_STYLE,
  enableSnapping: true,
  snapTolerance: 10
};