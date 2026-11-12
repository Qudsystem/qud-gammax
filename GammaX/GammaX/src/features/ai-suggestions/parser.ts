/**
 * Parser and validator for engagement data
 * Handles conversion from raw data to typed structures with validation
 */

import { 
  EngagementData, 
  CommentData, 
  InteractionEvent,
  RawEngagementData,
  RawCommentData,
  RawInteractionEvent,
  ValidationResult,
  ValidationError
} from './types';

export class EngagementDataParser {
  private errors: ValidationError[] = [];
  private warnings: ValidationError[] = [];

  /**
   * Parse and validate raw engagement data
   */
  parse(raw: RawEngagementData): { data: EngagementData | null; validation: ValidationResult } {
    this.errors = [];
    this.warnings = [];

    try {
      const data = this.parseEngagementData(raw);
      
      const validation: ValidationResult = {
        valid: this.errors.length === 0,
        errors: this.errors,
        warnings: this.warnings
      };

      return { data: validation.valid ? data : null, validation };
    } catch (error) {
      this.addError('general', 'Failed to parse engagement data', 'PARSE_ERROR');
      
      return {
        data: null,
        validation: {
          valid: false,
          errors: this.errors,
          warnings: this.warnings
        }
      };
    }
  }

  private parseEngagementData(raw: RawEngagementData): EngagementData {
    // Validate and parse presentationId
    const presentationId = this.validateString(raw.presentationId, 'presentationId', true);
    
    // Validate and parse views
    const views = this.validateNumber(raw.views, 'views', true, 0);
    
    // Validate and parse averageViewTime
    const averageViewTime = this.validateNumber(raw.averageViewTime, 'averageViewTime', true, 0);
    
    // Parse drop-off rates
    const dropOffRates = this.parseDropOffRates(raw.dropOffRates);
    
    // Parse comments
    const comments = this.parseComments(raw.comments);
    
    // Parse interactions
    const interactions = this.parseInteractions(raw.interactions);
    
    // Parse lastUpdated
    const lastUpdated = this.parseDate(raw.lastUpdated) || new Date();

    return {
      presentationId,
      views,
      averageViewTime,
      dropOffRates,
      comments,
      interactions,
      lastUpdated
    };
  }

  private parseDropOffRates(raw: Record<string, number | string>): Map<number, number> {
    const dropOffRates = new Map<number, number>();
    
    if (!raw || typeof raw !== 'object') {
      this.addWarning('dropOffRates', 'Drop-off rates not provided or invalid format', 'MISSING_DATA');
      return dropOffRates;
    }

    for (const [slideIndexStr, rateValue] of Object.entries(raw)) {
      const slideIndex = this.validateNumber(slideIndexStr, `dropOffRates.${slideIndexStr}`, true, 0);
      const rate = this.validateNumber(rateValue, `dropOffRates.${slideIndexStr}`, true, 0, 1);
      
      if (slideIndex !== null && rate !== null) {
        dropOffRates.set(slideIndex, rate);
      }
    }

    return dropOffRates;
  }

  private parseComments(raw: any[]): CommentData[] {
    if (!Array.isArray(raw)) {
      this.addWarning('comments', 'Comments data is not an array', 'INVALID_FORMAT');
      return [];
    }

    const comments: CommentData[] = [];
    
    for (let i = 0; i < raw.length; i++) {
      const comment = this.parseComment(raw[i], i);
      if (comment) {
        comments.push(comment);
      }
    }

    return comments;
  }

  private parseComment(raw: RawCommentData, index: number): CommentData | null {
    const prefix = `comments[${index}]`;
    
    const id = this.validateString(raw.id, `${prefix}.id`, true);
    const slideIndex = this.validateNumber(raw.slideIndex, `${prefix}.slideIndex`, true, 0);
    const content = this.validateString(raw.content, `${prefix}.content`, true);
    const timestamp = this.parseDate(raw.timestamp);
    const userId = this.validateString(raw.userId, `${prefix}.userId`, true);
    const resolved = this.parseBoolean(raw.resolved) || false;

    if (!id || slideIndex === null || !content || !timestamp || !userId) {
      return null;
    }

    return {
      id,
      slideIndex,
      content,
      timestamp,
      userId,
      resolved
    };
  }

  private parseInteractions(raw: any[]): InteractionEvent[] {
    if (!Array.isArray(raw)) {
      this.addWarning('interactions', 'Interactions data is not an array', 'INVALID_FORMAT');
      return [];
    }

    const interactions: InteractionEvent[] = [];
    
    for (let i = 0; i < raw.length; i++) {
      const interaction = this.parseInteraction(raw[i], i);
      if (interaction) {
        interactions.push(interaction);
      }
    }

    return interactions;
  }

  private parseInteraction(raw: RawInteractionEvent, index: number): InteractionEvent | null {
    const prefix = `interactions[${index}]`;
    
    const type = this.validateInteractionType(raw.type, `${prefix}.type`);
    const slideIndex = this.validateNumber(raw.slideIndex, `${prefix}.slideIndex`, true, 0);
    const timestamp = this.parseDate(raw.timestamp);
    const elementId = raw.elementId ? this.validateString(raw.elementId, `${prefix}.elementId`, false) : undefined;
    const userId = raw.userId ? this.validateString(raw.userId, `${prefix}.userId`, false) : undefined;
    const duration = raw.duration ? this.validateNumber(raw.duration, `${prefix}.duration`, false, 0) : undefined;

    if (!type || slideIndex === null || !timestamp) {
      return null;
    }

    return {
      type,
      slideIndex,
      elementId,
      timestamp,
      userId,
      duration
    };
  }

  private validateString(value: any, field: string, required: boolean): string | null {
    if (value === undefined || value === null) {
      if (required) {
        this.addError(field, `${field} is required`, 'REQUIRED_FIELD');
      }
      return null;
    }

    if (typeof value !== 'string') {
      this.addError(field, `${field} must be a string`, 'INVALID_TYPE');
      return null;
    }

    if (required && value.trim().length === 0) {
      this.addError(field, `${field} cannot be empty`, 'EMPTY_VALUE');
      return null;
    }

    return value.trim();
  }

  private validateNumber(
    value: any, 
    field: string, 
    required: boolean, 
    min?: number, 
    max?: number
  ): number | null {
    if (value === undefined || value === null) {
      if (required) {
        this.addError(field, `${field} is required`, 'REQUIRED_FIELD');
      }
      return null;
    }

    let num: number;
    
    if (typeof value === 'string') {
      num = parseFloat(value);
    } else if (typeof value === 'number') {
      num = value;
    } else {
      this.addError(field, `${field} must be a number`, 'INVALID_TYPE');
      return null;
    }

    if (isNaN(num)) {
      this.addError(field, `${field} is not a valid number`, 'INVALID_NUMBER');
      return null;
    }

    if (min !== undefined && num < min) {
      this.addError(field, `${field} must be at least ${min}`, 'MIN_VALUE');
      return null;
    }

    if (max !== undefined && num > max) {
      this.addError(field, `${field} must be at most ${max}`, 'MAX_VALUE');
      return null;
    }

    return num;
  }

  private validateInteractionType(value: any, field: string): InteractionEvent['type'] | null {
    const validTypes: InteractionEvent['type'][] = ['click', 'hover', 'scroll', 'annotation', 'comment'];
    
    if (typeof value !== 'string') {
      this.addError(field, `${field} must be a string`, 'INVALID_TYPE');
      return null;
    }

    if (!validTypes.includes(value as InteractionEvent['type'])) {
      this.addError(field, `${field} must be one of: ${validTypes.join(', ')}`, 'INVALID_VALUE');
      return null;
    }

    return value as InteractionEvent['type'];
  }

  private parseDate(value: any): Date | null {
    if (!value) return null;

    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }

    if (typeof value === 'number') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }

    return null;
  }

  private parseBoolean(value: any): boolean | null {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (lower === 'true' || lower === '1') return true;
      if (lower === 'false' || lower === '0') return false;
    }

    if (typeof value === 'number') {
      return value !== 0;
    }

    return null;
  }

  private addError(field: string, message: string, code: string): void {
    this.errors.push({ field, message, code });
  }

  private addWarning(field: string, message: string, code: string): void {
    this.warnings.push({ field, message, code });
  }

  /**
   * Validate engagement data quality and completeness
   */
  validateDataQuality(data: EngagementData): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Check data freshness
    const daysSinceUpdate = (Date.now() - data.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate > 7) {
      warnings.push({
        field: 'lastUpdated',
        message: 'Engagement data is more than 7 days old',
        code: 'STALE_DATA'
      });
    }

    // Check minimum data requirements
    if (data.views < 10) {
      warnings.push({
        field: 'views',
        message: 'Low view count may result in less accurate suggestions',
        code: 'LOW_SAMPLE_SIZE'
      });
    }

    // Check drop-off rates coverage
    if (data.dropOffRates.size === 0) {
      warnings.push({
        field: 'dropOffRates',
        message: 'No drop-off rate data available',
        code: 'MISSING_DROPOFF_DATA'
      });
    }

    // Check interaction data
    if (data.interactions.length === 0) {
      warnings.push({
        field: 'interactions',
        message: 'No interaction data available',
        code: 'MISSING_INTERACTION_DATA'
      });
    }

    // Validate drop-off rate values
    for (const [slideIndex, rate] of data.dropOffRates) {
      if (rate < 0 || rate > 1) {
        errors.push({
          field: `dropOffRates[${slideIndex}]`,
          message: 'Drop-off rate must be between 0 and 1',
          code: 'INVALID_RATE'
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Create sample engagement data for testing
   */
  static createSampleData(presentationId: string): EngagementData {
    const dropOffRates = new Map<number, number>();
    dropOffRates.set(0, 0.1);
    dropOffRates.set(1, 0.15);
    dropOffRates.set(2, 0.25);
    dropOffRates.set(3, 0.2);
    dropOffRates.set(4, 0.3);

    return {
      presentationId,
      views: 150,
      averageViewTime: 180,
      dropOffRates,
      comments: [
        {
          id: 'comment-1',
          slideIndex: 2,
          content: 'This slide is confusing',
          timestamp: new Date(Date.now() - 86400000),
          userId: 'user-1',
          resolved: false
        },
        {
          id: 'comment-2',
          slideIndex: 4,
          content: 'Great visualization!',
          timestamp: new Date(Date.now() - 43200000),
          userId: 'user-2',
          resolved: true
        }
      ],
      interactions: [
        {
          type: 'click',
          slideIndex: 0,
          elementId: 'title-1',
          timestamp: new Date(Date.now() - 3600000),
          userId: 'user-3'
        },
        {
          type: 'hover',
          slideIndex: 2,
          elementId: 'chart-1',
          timestamp: new Date(Date.now() - 1800000),
          userId: 'user-4',
          duration: 5000
        }
      ],
      lastUpdated: new Date()
    };
  }
}