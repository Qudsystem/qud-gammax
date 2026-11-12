/**
 * Tests for Suggestion Application Engine
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SuggestionApplicationEngine } from './applicationEngine';
import { Suggestion, SuggestionAction } from './types';
import { Presentation, Slide } from '../../lib/types';
import { kvStorage } from '../../core/services/kvStorage';

// Mock the storage service but keep STORAGE_KEYS
vi.mock('../../core/services/kvStorage', async (importActual) => {
  const actual = await importActual<typeof import('../../core/services/kvStorage')>();
  return {
    ...actual,
    kvStorage: {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
      has: vi.fn(),
      keys: vi.fn()
    }
  };
});
vi.mock('../../core/services/eventBus');

const mockKvStorage = vi.mocked(kvStorage);

describe('SuggestionApplicationEngine', () => {
  let engine: SuggestionApplicationEngine;
  let mockPresentation: Presentation;
  let mockSuggestion: Suggestion;

  beforeEach(() => {
    engine = new SuggestionApplicationEngine();

    // Create mock presentation
    mockPresentation = {
      id: 'test-presentation',
      title: 'Test Presentation',
      description: 'Test Description',
      slides: [
        {
          id: 'slide-1',
          layout: 'content',
          title: 'Test Slide',
          content: ['Point 1', 'Point 2', 'Point 3'],
          backgroundColor: '#ffffff'
        } as Slide
      ],
      style: 'minimal',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // Create mock suggestion
    mockSuggestion = {
      id: 'test-suggestion',
      type: 'content-density',
      targetSlideIndex: 0,
      title: 'Reduce Content Density',
      description: 'Simplify slide content',
      rationale: 'Too much content on slide',
      confidenceScore: 85,
      impactLevel: 'High',
      action: {
        type: 'simplify-content',
        parameters: {
          maxBulletPoints: 2,
          shortenText: true
        }
      },
      createdAt: new Date()
    };

    // Reset mocks
    vi.clearAllMocks();
  });

  describe('applySuggestion', () => {
    it('should successfully apply a content simplification suggestion', async () => {
      // Setup mocks
      mockKvStorage.get
        .mockResolvedValueOnce(mockPresentation) // Load presentation
        .mockResolvedValueOnce([mockSuggestion]); // Load suggestions
      mockKvStorage.set.mockResolvedValueOnce(undefined);

      const result = await engine.applySuggestion('test-presentation', 'test-suggestion');

      expect(result.success).toBe(true);
      expect(result.changes).toHaveLength(1);
      expect(result.changes[0].type).toBe('content-removed');
      expect(result.changes[0].slideId).toBe('slide-1');

      // Verify presentation was saved
      expect(mockKvStorage.set).toHaveBeenCalledWith(
        'presentation:test-presentation',
        expect.objectContaining({
          id: 'test-presentation',
          updatedAt: expect.any(Number)
        })
      );
    });

    it('should handle text modification suggestions', async () => {
      const textModificationSuggestion: Suggestion = {
        ...mockSuggestion,
        action: {
          type: 'modify-text',
          parameters: {
            targetIndex: 0,
            newText: 'Improved Point 1'
          }
        }
      };

      mockKvStorage.get
        .mockResolvedValueOnce(mockPresentation)
        .mockResolvedValueOnce([textModificationSuggestion]);
      mockKvStorage.set.mockResolvedValueOnce(undefined);

      const result = await engine.applySuggestion('test-presentation', 'test-suggestion');

      expect(result.success).toBe(true);
      expect(result.changes[0].type).toBe('slide-modified');
    });

    it('should handle layout adjustment suggestions', async () => {
      const layoutSuggestion: Suggestion = {
        ...mockSuggestion,
        action: {
          type: 'adjust-layout',
          parameters: {
            newLayout: 'two-column',
            backgroundColor: '#f0f0f0'
          }
        }
      };

      mockKvStorage.get
        .mockResolvedValueOnce(mockPresentation)
        .mockResolvedValueOnce([layoutSuggestion]);
      mockKvStorage.set.mockResolvedValueOnce(undefined);

      const result = await engine.applySuggestion('test-presentation', 'test-suggestion');

      expect(result.success).toBe(true);
      expect(result.changes[0].type).toBe('layout-changed');
    });

    it('should handle visual addition suggestions', async () => {
      const visualSuggestion: Suggestion = {
        ...mockSuggestion,
        action: {
          type: 'add-visual',
          parameters: {
            addImage: true,
            enhanceVisuals: true
          }
        }
      };

      mockKvStorage.get
        .mockResolvedValueOnce(mockPresentation)
        .mockResolvedValueOnce([visualSuggestion]);
      mockKvStorage.set.mockResolvedValueOnce(undefined);

      const result = await engine.applySuggestion('test-presentation', 'test-suggestion');

      expect(result.success).toBe(true);
      expect(result.changes.length).toBeGreaterThan(0);
    });

    it('should return error when presentation not found', async () => {
      mockKvStorage.get.mockResolvedValue(null);

      const result = await engine.applySuggestion('nonexistent', 'test-suggestion');

      expect(result.success).toBe(false);
      expect(result.error).toContain('PRESENTATION_NOT_FOUND');
    });

    it('should return error when suggestion not found', async () => {
      mockKvStorage.get
        .mockResolvedValueOnce(mockPresentation)
        .mockResolvedValueOnce([]); // No suggestions found

      const result = await engine.applySuggestion('test-presentation', 'nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('SUGGESTION_NOT_FOUND');
    });
  });

  describe('validateAction', () => {
    it('should validate correct action parameters', () => {
      const action: SuggestionAction = {
        type: 'modify-text',
        parameters: {
          newText: 'Updated text'
        }
      };

      const result = engine.validateAction(action);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject action without type', () => {
      const action = {
        parameters: {}
      } as SuggestionAction;

      const result = engine.validateAction(action);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Action type is required');
    });

    it('should reject action without parameters', () => {
      const action = {
        type: 'modify-text'
      } as SuggestionAction;

      const result = engine.validateAction(action);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Action parameters must be an object');
    });
  });

  describe('previewSuggestion', () => {
    it('should return preview changes without modifying presentation', async () => {
      mockKvStorage.get
        .mockResolvedValueOnce(mockPresentation)
        .mockResolvedValueOnce([mockSuggestion]);

      const changes = await engine.previewSuggestion('test-presentation', 'test-suggestion');

      expect(changes).toHaveLength(1);
      expect(changes[0].type).toBe('content-removed');

      // Verify original presentation wasn't modified
      expect(mockPresentation.slides[0].content).toHaveLength(3);
    });
  });
});