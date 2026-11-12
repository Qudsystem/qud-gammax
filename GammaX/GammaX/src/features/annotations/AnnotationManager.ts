import { 
  Annotation, 
  AnnotationManager as IAnnotationManager, 
  AnnotationHistory, 
  AnnotationState, 
  AnnotationError,
  AnnotationEvent,
  AnnotationConfig,
  DEFAULT_ANNOTATION_CONFIG
} from './types';
import { kvStorage } from '@/core/services/kvStorage';
import { eventBus } from '@/core/services/eventBus';
import { generateId } from '@/lib/utils';

export class AnnotationManager implements IAnnotationManager {
  private history: AnnotationHistory;
  private config: AnnotationConfig;
  private autoSaveTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<AnnotationConfig> = {}) {
    this.config = { ...DEFAULT_ANNOTATION_CONFIG, ...config };
    this.history = {
      past: [],
      present: {
        annotations: new Map(),
        timestamp: new Date()
      },
      future: []
    };

    this.setupAutoSave();
  }

  async createAnnotation(slideId: string, annotation: Annotation): Promise<void> {
    try {
      // Validate annotation
      this.validateAnnotation(annotation);

      // Ensure annotation has correct slideId
      const annotationWithSlideId = { ...annotation, slideId };

      // Add to current state
      const newState = this.createNewState();
      newState.annotations.set(annotation.id, annotationWithSlideId);

      // Update history
      this.pushState(newState);

      // Save to storage
      await this.saveAnnotations(slideId);

      // Emit event
      this.emitEvent({
        type: 'created',
        annotation: annotationWithSlideId,
        timestamp: new Date()
      });

    } catch (error) {
      throw new AnnotationError(
        `Failed to create annotation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CREATE_FAILED',
        annotation.id
      );
    }
  }

  async updateAnnotation(id: string, updates: Partial<Annotation>): Promise<void> {
    try {
      const currentAnnotation = this.history.present.annotations.get(id);
      if (!currentAnnotation) {
        throw new AnnotationError('Annotation not found', 'NOT_FOUND', id);
      }

      // Create updated annotation
      const updatedAnnotation: Annotation = {
        ...currentAnnotation,
        ...updates,
        id, // Ensure ID doesn't change
        updatedAt: new Date()
      };

      // Validate updated annotation
      this.validateAnnotation(updatedAnnotation);

      // Update state
      const newState = this.createNewState();
      newState.annotations.set(id, updatedAnnotation);

      // Update history
      this.pushState(newState);

      // Save to storage
      await this.saveAnnotations(updatedAnnotation.slideId);

      // Emit event
      this.emitEvent({
        type: 'updated',
        annotation: updatedAnnotation,
        timestamp: new Date()
      });

    } catch (error) {
      throw new AnnotationError(
        `Failed to update annotation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UPDATE_FAILED',
        id
      );
    }
  }

  async deleteAnnotation(id: string): Promise<void> {
    try {
      const annotation = this.history.present.annotations.get(id);
      if (!annotation) {
        throw new AnnotationError('Annotation not found', 'NOT_FOUND', id);
      }

      // Remove from state
      const newState = this.createNewState();
      newState.annotations.delete(id);

      // Update history
      this.pushState(newState);

      // Save to storage
      await this.saveAnnotations(annotation.slideId);

      // Emit event
      this.emitEvent({
        type: 'deleted',
        annotation,
        timestamp: new Date()
      });

    } catch (error) {
      throw new AnnotationError(
        `Failed to delete annotation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DELETE_FAILED',
        id
      );
    }
  }

  async getAnnotations(slideId: string): Promise<Annotation[]> {
    try {
      // Load from storage first
      await this.loadAnnotations(slideId);

      // Filter annotations for the specific slide
      const slideAnnotations = Array.from(this.history.present.annotations.values())
        .filter(annotation => annotation.slideId === slideId)
        .sort((a, b) => a.layer - b.layer); // Sort by layer for correct rendering order

      return slideAnnotations;

    } catch (error) {
      throw new AnnotationError(
        `Failed to get annotations: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GET_FAILED'
      );
    }
  }

  undo(): void {
    if (!this.canUndo()) return;

    // Move current state to future
    this.history.future.unshift(this.history.present);

    // Restore previous state
    this.history.present = this.history.past.pop()!;

    // Limit future history size
    if (this.history.future.length > this.config.maxHistorySize) {
      this.history.future = this.history.future.slice(0, this.config.maxHistorySize);
    }

    // Auto-save after undo
    this.scheduleAutoSave();
  }

  redo(): void {
    if (!this.canRedo()) return;

    // Move current state to past
    this.history.past.push(this.history.present);

    // Restore next state
    this.history.present = this.history.future.shift()!;

    // Limit past history size
    if (this.history.past.length > this.config.maxHistorySize) {
      this.history.past = this.history.past.slice(-this.config.maxHistorySize);
    }

    // Auto-save after redo
    this.scheduleAutoSave();
  }

  canUndo(): boolean {
    return this.history.past.length > 0;
  }

  canRedo(): boolean {
    return this.history.future.length > 0;
  }

  // Additional utility methods

  getAnnotationById(id: string): Annotation | undefined {
    return this.history.present.annotations.get(id);
  }

  getAnnotationsByLayer(slideId: string): Annotation[][] {
    const annotations = Array.from(this.history.present.annotations.values())
      .filter(annotation => annotation.slideId === slideId);

    // Group by layer
    const layerMap = new Map<number, Annotation[]>();
    annotations.forEach(annotation => {
      const layer = annotation.layer;
      if (!layerMap.has(layer)) {
        layerMap.set(layer, []);
      }
      layerMap.get(layer)!.push(annotation);
    });

    // Convert to sorted array
    return Array.from(layerMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([, annotations]) => annotations);
  }

  clearAnnotations(slideId: string): void {
    const newState = this.createNewState();
    
    // Remove all annotations for the slide
    for (const [id, annotation] of newState.annotations) {
      if (annotation.slideId === slideId) {
        newState.annotations.delete(id);
      }
    }

    this.pushState(newState);
    this.scheduleAutoSave();
  }

  // Private methods

  private createNewState(): AnnotationState {
    return {
      annotations: new Map(this.history.present.annotations),
      timestamp: new Date()
    };
  }

  private pushState(newState: AnnotationState): void {
    // Add current state to past
    this.history.past.push(this.history.present);

    // Set new state as present
    this.history.present = newState;

    // Clear future (new action invalidates redo history)
    this.history.future = [];

    // Limit past history size
    if (this.history.past.length > this.config.maxHistorySize) {
      this.history.past = this.history.past.slice(-this.config.maxHistorySize);
    }
  }

  private validateAnnotation(annotation: Annotation): void {
    if (!annotation.id) {
      throw new Error('Annotation must have an ID');
    }
    if (!annotation.slideId) {
      throw new Error('Annotation must have a slide ID');
    }
    if (!annotation.type) {
      throw new Error('Annotation must have a type');
    }
    if (!annotation.geometry || !annotation.geometry.points || annotation.geometry.points.length === 0) {
      throw new Error('Annotation must have valid geometry');
    }
    if (!annotation.style) {
      throw new Error('Annotation must have style information');
    }
  }

  private async saveAnnotations(slideId: string): Promise<void> {
    const slideAnnotations = Array.from(this.history.present.annotations.values())
      .filter(annotation => annotation.slideId === slideId);

    const serializedAnnotations = slideAnnotations.map(annotation => ({
      ...annotation,
      createdAt: annotation.createdAt.toISOString(),
      updatedAt: annotation.updatedAt.toISOString()
    }));

    await kvStorage.set(`annotations:${slideId}`, serializedAnnotations);
  }

  private async loadAnnotations(slideId: string): Promise<void> {
    try {
      const stored = await kvStorage.get(`annotations:${slideId}`);
      if (!stored) return;

      const annotations = Array.isArray(stored) ? stored : [];
      
      // Deserialize and add to current state
      annotations.forEach((data: any) => {
        const annotation: Annotation = {
          ...data,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt)
        };
        this.history.present.annotations.set(annotation.id, annotation);
      });

    } catch (error) {
      console.error('Failed to load annotations:', error);
    }
  }

  private setupAutoSave(): void {
    if (this.config.autoSaveInterval > 0) {
      this.scheduleAutoSave();
    }
  }

  private scheduleAutoSave(): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }

    this.autoSaveTimer = setTimeout(() => {
      this.performAutoSave();
    }, this.config.autoSaveInterval);
  }

  private async performAutoSave(): Promise<void> {
    try {
      // Group annotations by slide and save each slide
      const slideGroups = new Map<string, Annotation[]>();
      
      for (const annotation of this.history.present.annotations.values()) {
        if (!slideGroups.has(annotation.slideId)) {
          slideGroups.set(annotation.slideId, []);
        }
        slideGroups.get(annotation.slideId)!.push(annotation);
      }

      // Save each slide's annotations
      for (const [slideId] of slideGroups) {
        await this.saveAnnotations(slideId);
      }

    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  private emitEvent(event: AnnotationEvent): void {
    eventBus.emit('annotation:change', event);
  }

  // Cleanup
  destroy(): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }
}

// Export singleton instance
export const annotationManager = new AnnotationManager();