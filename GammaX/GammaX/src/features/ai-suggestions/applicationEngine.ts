/**
 * AI Suggestions Application Engine
 * 
 * Handles the application of AI suggestions to presentations.
 * Modifies presentation state according to suggestion action parameters.
 */

import { kvStorage, STORAGE_KEYS } from '../../core/services/kvStorage';
import { eventBus } from '../../core/services/eventBus';
import { Suggestion, SuggestionAction, SuggestionError } from './types';
import { Presentation, Slide } from '../../lib/types';

export interface ApplicationResult {
  success: boolean;
  changes: ApplicationChange[];
  error?: string;
}

export interface ApplicationChange {
  type: 'slide-modified' | 'layout-changed' | 'content-added' | 'content-removed' | 'style-updated';
  slideId: string;
  description: string;
  oldValue?: any;
  newValue?: any;
}

export class SuggestionApplicationEngine {
  /**
   * Apply a suggestion to a presentation
   */
  async applySuggestion(
    presentationId: string, 
    suggestionId: string
  ): Promise<ApplicationResult> {
    try {
      // Load presentation and suggestion
      const presentation = await this.loadPresentation(presentationId);
      const suggestion = await this.loadSuggestion(presentationId, suggestionId);

      if (!presentation) {
        throw new SuggestionError(
          'PRESENTATION_NOT_FOUND',
          `Presentation ${presentationId} not found`,
          suggestionId
        );
      }

      if (!suggestion) {
        throw new SuggestionError(
          'SUGGESTION_NOT_FOUND',
          `Suggestion ${suggestionId} not found`,
          suggestionId
        );
      }

      // Apply the suggestion based on its action type
      const result = await this.executeAction(presentation, suggestion);

      if (result.success) {
        // Save the updated presentation
        await this.savePresentation(presentation);

        // Emit event for successful application
        eventBus.emit('ai:suggestions:applied', {
          suggestionId,
          presentationId
        });

        // Update presentation metadata
        eventBus.emit('presentation:updated', {
          presentationId,
          changes: result.changes
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Emit error event
      eventBus.emit('error:occurred', {
        module: 'SuggestionApplicationEngine',
        error: error as Error,
        context: { presentationId, suggestionId }
      });

      return {
        success: false,
        changes: [],
        error: errorMessage
      };
    }
  }

  /**
   * Execute the specific action based on suggestion type
   */
  private async executeAction(
    presentation: Presentation,
    suggestion: Suggestion
  ): Promise<ApplicationResult> {
    const changes: ApplicationChange[] = [];
    
    try {
      switch (suggestion.action.type) {
        case 'modify-text':
          await this.applyTextModification(presentation, suggestion, changes);
          break;
          
        case 'adjust-layout':
          await this.applyLayoutAdjustment(presentation, suggestion, changes);
          break;
          
        case 'add-visual':
          await this.applyVisualAddition(presentation, suggestion, changes);
          break;
          
        case 'simplify-content':
          await this.applyContentSimplification(presentation, suggestion, changes);
          break;
          
        default:
          throw new SuggestionError(
            'UNSUPPORTED_ACTION',
            `Action type ${suggestion.action.type} is not supported`,
            suggestion.id
          );
      }

      // Update presentation timestamp
      presentation.updatedAt = Date.now();

      return {
        success: true,
        changes
      };
    } catch (error) {
      throw new SuggestionError(
        'ACTION_EXECUTION_FAILED',
        `Failed to execute action: ${error instanceof Error ? error.message : 'Unknown error'}`,
        suggestion.id
      );
    }
  }

  /**
   * Apply text modification action
   */
  private async applyTextModification(
    presentation: Presentation,
    suggestion: Suggestion,
    changes: ApplicationChange[]
  ): Promise<void> {
    const { parameters } = suggestion.action;
    const targetSlide = this.getTargetSlide(presentation, suggestion.targetSlideIndex);

    if (!targetSlide) {
      throw new Error(`Target slide ${suggestion.targetSlideIndex} not found`);
    }

    const oldContent = [...targetSlide.content];

    // Apply text modifications based on parameters
    if (parameters.newText && typeof parameters.newText === 'string') {
      // Replace specific text content
      if (parameters.targetIndex !== undefined && parameters.targetIndex < targetSlide.content.length) {
        targetSlide.content[parameters.targetIndex] = parameters.newText;
      } else {
        // Add new text content
        targetSlide.content.push(parameters.newText);
      }
    }

    if (parameters.fontSize && typeof parameters.fontSize === 'number') {
      // This would typically be handled by updating slide styling
      // For now, we'll track it as a style change
    }

    if (parameters.removeText && Array.isArray(parameters.removeText)) {
      // Remove specified text content
      targetSlide.content = targetSlide.content.filter(
        (content, index) => !parameters.removeText.includes(index)
      );
    }

    changes.push({
      type: 'slide-modified',
      slideId: targetSlide.id,
      description: `Modified text content based on ${suggestion.type} suggestion`,
      oldValue: oldContent,
      newValue: [...targetSlide.content]
    });
  }

  /**
   * Apply layout adjustment action
   */
  private async applyLayoutAdjustment(
    presentation: Presentation,
    suggestion: Suggestion,
    changes: ApplicationChange[]
  ): Promise<void> {
    const { parameters } = suggestion.action;
    const targetSlide = this.getTargetSlide(presentation, suggestion.targetSlideIndex);

    if (!targetSlide) {
      throw new Error(`Target slide ${suggestion.targetSlideIndex} not found`);
    }

    const oldLayout = targetSlide.layout;

    // Apply layout changes based on parameters
    if (parameters.newLayout && typeof parameters.newLayout === 'string') {
      targetSlide.layout = parameters.newLayout as any; // Type assertion for layout
    }

    if (parameters.backgroundColor && typeof parameters.backgroundColor === 'string') {
      targetSlide.backgroundColor = parameters.backgroundColor;
    }

    if (parameters.splitContent === true && targetSlide.content.length > 1) {
      // Split content into multiple slides if suggested
      const midpoint = Math.ceil(targetSlide.content.length / 2);
      const newSlideContent = targetSlide.content.splice(midpoint);
      
      // Create new slide with remaining content
      const newSlide: Slide = {
        id: `slide-${Date.now()}`,
        layout: targetSlide.layout,
        title: `${targetSlide.title} (continued)`,
        content: newSlideContent,
        backgroundColor: targetSlide.backgroundColor,
        notes: targetSlide.notes
      };

      // Insert new slide after current one
      const slideIndex = presentation.slides.findIndex(s => s.id === targetSlide.id);
      presentation.slides.splice(slideIndex + 1, 0, newSlide);

      changes.push({
        type: 'content-added',
        slideId: newSlide.id,
        description: 'Created new slide from split content',
        newValue: newSlide
      });
    }

    changes.push({
      type: 'layout-changed',
      slideId: targetSlide.id,
      description: `Adjusted layout based on ${suggestion.type} suggestion`,
      oldValue: oldLayout,
      newValue: targetSlide.layout
    });
  }

  /**
   * Apply visual addition action
   */
  private async applyVisualAddition(
    presentation: Presentation,
    suggestion: Suggestion,
    changes: ApplicationChange[]
  ): Promise<void> {
    const { parameters } = suggestion.action;
    const targetSlide = this.getTargetSlide(presentation, suggestion.targetSlideIndex);

    if (!targetSlide) {
      throw new Error(`Target slide ${suggestion.targetSlideIndex} not found`);
    }

    // Apply visual enhancements based on parameters
    if (parameters.addImage === true) {
      // Switch to a layout that supports images
      const oldLayout = targetSlide.layout;
      if (!targetSlide.imageUrl && ['content', 'bullets'].includes(targetSlide.layout)) {
        targetSlide.layout = 'image-text';
        
        changes.push({
          type: 'layout-changed',
          slideId: targetSlide.id,
          description: 'Changed layout to support image content',
          oldValue: oldLayout,
          newValue: targetSlide.layout
        });
      }
    }

    if (parameters.addDiagram && typeof parameters.addDiagram === 'string') {
      // Add diagram based on type
      targetSlide.diagram = {
        type: parameters.addDiagram as any,
        nodes: [],
        edges: [],
        config: {}
      };

      changes.push({
        type: 'content-added',
        slideId: targetSlide.id,
        description: `Added ${parameters.addDiagram} diagram`,
        newValue: targetSlide.diagram
      });
    }

    if (parameters.enhanceVisuals === true) {
      // Add visual enhancements like animations
      if (!targetSlide.animation) {
        targetSlide.animation = 'fade-in';
        targetSlide.animationDuration = 0.5;
        
        changes.push({
          type: 'style-updated',
          slideId: targetSlide.id,
          description: 'Added slide animation for visual enhancement',
          newValue: { animation: targetSlide.animation, duration: targetSlide.animationDuration }
        });
      }
    }
  }

  /**
   * Apply content simplification action
   */
  private async applyContentSimplification(
    presentation: Presentation,
    suggestion: Suggestion,
    changes: ApplicationChange[]
  ): Promise<void> {
    const { parameters } = suggestion.action;
    const targetSlide = this.getTargetSlide(presentation, suggestion.targetSlideIndex);

    if (!targetSlide) {
      throw new Error(`Target slide ${suggestion.targetSlideIndex} not found`);
    }

    const oldContent = [...targetSlide.content];

    // Apply content simplification based on parameters
    if (parameters.maxBulletPoints && typeof parameters.maxBulletPoints === 'number') {
      // Limit number of bullet points
      if (targetSlide.content.length > parameters.maxBulletPoints) {
        targetSlide.content = targetSlide.content.slice(0, parameters.maxBulletPoints);
      }
    }

    if (parameters.shortenText === true) {
      // Shorten text content (simplified approach)
      targetSlide.content = targetSlide.content.map(content => {
        if (typeof content === 'string' && content.length > 100) {
          // Truncate long text and add ellipsis
          return content.substring(0, 97) + '...';
        }
        return content;
      });
    }

    if (parameters.removeRedundancy === true) {
      // Remove duplicate or similar content
      const uniqueContent = targetSlide.content.filter((content, index, array) => {
        return array.findIndex(item => 
          typeof item === 'string' && typeof content === 'string' 
            ? item.toLowerCase().trim() === content.toLowerCase().trim()
            : item === content
        ) === index;
      });
      targetSlide.content = uniqueContent;
    }

    if (parameters.focusKeyPoints === true && Array.isArray(parameters.keyPoints)) {
      // Keep only specified key points
      targetSlide.content = parameters.keyPoints.filter(point => 
        typeof point === 'string' && point.trim().length > 0
      );
    }

    changes.push({
      type: 'content-removed',
      slideId: targetSlide.id,
      description: `Simplified content based on ${suggestion.type} suggestion`,
      oldValue: oldContent,
      newValue: [...targetSlide.content]
    });
  }

  /**
   * Get target slide by index
   */
  private getTargetSlide(presentation: Presentation, slideIndex: number): Slide | null {
    if (slideIndex < 0 || slideIndex >= presentation.slides.length) {
      return null;
    }
    return presentation.slides[slideIndex];
  }

  /**
   * Load presentation from storage
   */
  private async loadPresentation(presentationId: string): Promise<Presentation | null> {
    try {
      return await kvStorage.get<Presentation>(STORAGE_KEYS.presentation(presentationId));
    } catch (error) {
      throw new SuggestionError(
        'STORAGE_READ_ERROR',
        `Failed to load presentation: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Load suggestion from storage
   */
  private async loadSuggestion(presentationId: string, suggestionId: string): Promise<Suggestion | null> {
    try {
      const suggestions = await kvStorage.get<Suggestion[]>(STORAGE_KEYS.suggestions(presentationId));
      return suggestions?.find(s => s.id === suggestionId) || null;
    } catch (error) {
      throw new SuggestionError(
        'STORAGE_READ_ERROR',
        `Failed to load suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Save presentation to storage
   */
  private async savePresentation(presentation: Presentation): Promise<void> {
    try {
      await kvStorage.set(STORAGE_KEYS.presentation(presentation.id), presentation);
    } catch (error) {
      throw new SuggestionError(
        'STORAGE_WRITE_ERROR',
        `Failed to save presentation: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validate suggestion action parameters
   */
  validateAction(action: SuggestionAction): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!action.type) {
      errors.push('Action type is required');
    }

    if (!action.parameters || typeof action.parameters !== 'object') {
      errors.push('Action parameters must be an object');
      return { valid: false, errors };
    }

    // Validate specific action types
    switch (action.type) {
      case 'modify-text':
        if (!action.parameters.newText && !action.parameters.removeText) {
          errors.push('Text modification requires newText or removeText parameter');
        }
        break;
        
      case 'adjust-layout':
        if (!action.parameters.newLayout && !action.parameters.backgroundColor && !action.parameters.splitContent) {
          errors.push('Layout adjustment requires at least one layout parameter');
        }
        break;
        
      case 'add-visual':
        if (!action.parameters.addImage && !action.parameters.addDiagram && !action.parameters.enhanceVisuals) {
          errors.push('Visual addition requires at least one visual parameter');
        }
        break;
        
      case 'simplify-content':
        if (!action.parameters.maxBulletPoints && !action.parameters.shortenText && 
            !action.parameters.removeRedundancy && !action.parameters.focusKeyPoints) {
          errors.push('Content simplification requires at least one simplification parameter');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Preview what changes would be made without applying them
   */
  async previewSuggestion(
    presentationId: string,
    suggestionId: string
  ): Promise<ApplicationChange[]> {
    try {
      const presentation = await this.loadPresentation(presentationId);
      const suggestion = await this.loadSuggestion(presentationId, suggestionId);

      if (!presentation || !suggestion) {
        return [];
      }

      // Create a deep copy to avoid modifying the original
      const presentationCopy = JSON.parse(JSON.stringify(presentation)) as Presentation;
      const result = await this.executeAction(presentationCopy, suggestion);

      return result.changes;
    } catch (error) {
      console.error('Failed to preview suggestion:', error);
      return [];
    }
  }
}

// Export singleton instance
export const suggestionApplicationEngine = new SuggestionApplicationEngine();