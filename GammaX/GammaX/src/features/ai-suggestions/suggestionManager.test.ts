import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { SuggestionManager } from './suggestionManager';
import { KVStorageService } from '../../core/services/kvStorage';
import { eventBus } from '../../core/services/eventBus';
import { Suggestion, SuggestionError } from './types';

// Mock dependencies
vi.mock('../../core/services/kvStorage');
vi.mock('../../core/services/eventBus');
vi.mock('./analyzer', () => ({
  AIAnalyzer: vi.fn().mockImplementation(() => ({
    analyzeEngagement: vi.fn(),
    generateSuggestions: vi.fn(),
  }))
}));
vi.mock('./confidenceScorer', () => ({
  ConfidenceScorer: vi.fn().mockImplementation(() => ({
    calculateConfidence: vi.fn(),
  }))
}));

describe('SuggestionManager', () => {
  let suggestionManager: SuggestionManager;
  let mockStorage: Mock;
  let mockEventBus: Mock;

  const mockSuggestion: Suggestion = {
    id: 'suggestion-1',
    presentationId: 'presentation-1',
    type: 'content-density',
    targetSlideIndex: 0,
    title: 'Test Suggestion',
    description: 'Test description',
    rationale: 'Test rationale',
    confidenceScore: 85,
    impactLevel: 'High',
    action: {
      type: 'modify-text',
      parameters: { fontSize: 16 }
    },
    createdAt: new Date('2024-01-01T00:00:00Z')
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock KVStorageService
    mockStorage = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      keys: vi.fn(),
      has: vi.fn(),
      clear: vi.fn()
    };

    // Mock EventBus
    mockEventBus = {
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn()
    };

    (KVStorageService as any).mockImplementation(() => mockStorage);
    (eventBus.emit as Mock) = mockEventBus.emit;

    suggestionManager = new SuggestionManager();
    // @ts-ignore - clear private caches
    suggestionManager.cache.clear();
    // @ts-ignore
    suggestionManager.dismissalCache.clear();
  });

  describe('fetchSuggestions', () => {
    it('should return suggestions excluding dismissed ones', async () => {
      // Setup: AI analysis will return these
      const allSuggestions = [
        mockSuggestion,
        { ...mockSuggestion, id: 'suggestion-2' },
        { ...mockSuggestion, id: 'suggestion-3' }
      ];

      const dismissedSuggestions = [
        {
          suggestionId: 'suggestion-2',
          presentationId: 'presentation-1',
          type: 'content-density',
          dismissedAt: new Date()
        }
      ];

      // Mock engagement data to trigger AI analysis
      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'engagement:presentation-1') {
          return Promise.resolve({
            presentationId: 'presentation-1',
            views: 100,
            averageViewTime: 120,
            dropOffRates: new Map(),
            comments: [],
            interactions: [],
            lastUpdated: new Date()
          });
        }
        if (key === 'suggestions:dismissals:presentation-1') {
          return Promise.resolve(dismissedSuggestions);
        }
        return Promise.resolve(null);
      });

      // Get the mocked instances from the class
      const { AIAnalyzer } = await import('./analyzer');
      const { ConfidenceScorer } = await import('./confidenceScorer');
      const mockAnalyzer = (AIAnalyzer as any).mock.results[0].value;
      const mockScorer = (ConfidenceScorer as any).mock.results[0].value;

      mockAnalyzer.analyzeEngagement.mockResolvedValue({});
      mockAnalyzer.generateSuggestions.mockResolvedValue(allSuggestions);
      mockScorer.calculateConfidence.mockReturnValue({ finalScore: 85, factors: [] });

      const result = await suggestionManager.fetchSuggestions('presentation-1');

      expect(result).toHaveLength(2);
      expect(result.find(s => s.id === 'suggestion-2')).toBeUndefined();
      expect(result.find(s => s.id === 'suggestion-1')).toBeDefined();
      expect(result.find(s => s.id === 'suggestion-3')).toBeDefined();
    });

    it('should rank suggestions by confidence score in descending order', async () => {
      const suggestions = [
        { ...mockSuggestion, id: 'low', confidenceScore: 30 },
        { ...mockSuggestion, id: 'high', confidenceScore: 90 },
        { ...mockSuggestion, id: 'medium', confidenceScore: 60 }
      ];

      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'engagement:presentation-1') {
          return Promise.resolve({ views: 10 }); // Minimal engagement
        }
        if (key === 'suggestions:dismissals:presentation-1') {
          return Promise.resolve([]);
        }
        return Promise.resolve(null);
      });

      // Get the mocked instances from the class
      const { AIAnalyzer } = await import('./analyzer');
      const { ConfidenceScorer } = await import('./confidenceScorer');
      const mockAnalyzer = (AIAnalyzer as any).mock.results[0].value;
      const mockScorer = (ConfidenceScorer as any).mock.results[0].value;

      mockAnalyzer.analyzeEngagement.mockResolvedValue({});
      mockAnalyzer.generateSuggestions.mockResolvedValue(suggestions);

      // Override calculateConfidence to return our scores
      mockScorer.calculateConfidence.mockImplementation((s) => {
        return { finalScore: s.confidenceScore, factors: [] };
      });

      const result = await suggestionManager.fetchSuggestions('presentation-1');

      expect(result[0].id).toBe('high');
      expect(result[1].id).toBe('medium');
      expect(result[2].id).toBe('low');
    });

    it('should handle empty suggestions list', async () => {
      mockStorage.get
        .mockResolvedValueOnce([]) // Empty suggestions
        .mockResolvedValueOnce([]); // No dismissed suggestions

      const result = await suggestionManager.fetchSuggestions('presentation-1');

      expect(result).toHaveLength(0);
    });

    it('should throw SuggestionError on storage failure', async () => {
      mockStorage.get.mockRejectedValue(new Error('Storage error'));

      await expect(suggestionManager.fetchSuggestions('presentation-1'))
        .rejects.toThrow(SuggestionError);
    });
  });

  describe('dismissSuggestion', () => {
    beforeEach(async () => {
      // Setup cache so getSuggestionById finds it
      // @ts-ignore - accessing private cache for testing
      suggestionManager.cache.set('presentation-1', {
        suggestions: [mockSuggestion],
        timestamp: Date.now(),
        presentationId: 'presentation-1'
      });

      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'suggestions:dismissals:presentation-1') {
          return Promise.resolve([]);
        }
        return Promise.resolve(null);
      });
    });

    it('should dismiss a suggestion successfully', async () => {
      await suggestionManager.dismissSuggestion('suggestion-1');

      // Verify storage calls
      expect(mockStorage.set).toHaveBeenCalledWith(
        'suggestions:dismissals:presentation-1',
        expect.arrayContaining([
          expect.objectContaining({
            suggestionId: 'suggestion-1',
            presentationId: 'presentation-1',
            type: 'content-density'
          })
        ])
      );

      // Verify event emission
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        'suggestion-dismissed',
        expect.objectContaining({
          suggestionId: 'suggestion-1',
          presentationId: 'presentation-1'
        })
      );
    });

    it('should throw error when suggestion not found', async () => {
      // Clear cache
      // @ts-ignore
      suggestionManager.cache.clear();

      await expect(suggestionManager.dismissSuggestion('nonexistent'))
        .rejects.toThrow(SuggestionError);
    });

    it('should handle storage errors gracefully', async () => {
      mockStorage.set.mockRejectedValue(new Error('Storage error'));

      await expect(suggestionManager.dismissSuggestion('suggestion-1'))
        .rejects.toThrow(SuggestionError);
    });

    it('should avoid duplicate dismissals', async () => {
      const existingDismissed = [{
        suggestionId: 'suggestion-1',
        presentationId: 'presentation-1',
        type: 'content-density',
        dismissedAt: new Date('2024-01-01T00:00:00Z')
      }];

      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'suggestions:dismissals:presentation-1') {
          return Promise.resolve(existingDismissed);
        }
        return Promise.resolve([]);
      });

      await suggestionManager.dismissSuggestion('suggestion-1');

      // Should not call set if already dismissed
      expect(mockStorage.set).not.toHaveBeenCalled();
    });
  });

  describe('applySuggestion', () => {
    beforeEach(() => {
      // Setup cache so getSuggestionById finds it
      // @ts-ignore
      suggestionManager.cache.set('presentation-1', {
        suggestions: [mockSuggestion],
        timestamp: Date.now(),
        presentationId: 'presentation-1'
      });
    });

    it('should apply a suggestion and emit event', async () => {
      await suggestionManager.applySuggestion('suggestion-1');

      expect(mockEventBus.emit).toHaveBeenCalledWith(
        'suggestion-applied',
        expect.objectContaining({
          suggestionId: 'suggestion-1',
          presentationId: 'presentation-1'
        })
      );
    });

    it('should store application record', async () => {
      mockStorage.get.mockResolvedValue([]); // Empty history

      await suggestionManager.applySuggestion('suggestion-1');

      expect(mockStorage.set).toHaveBeenCalledWith(
        'suggestions:applied:presentation-1',
        expect.arrayContaining([
          expect.objectContaining({
            suggestionId: 'suggestion-1',
            presentationId: 'presentation-1'
          })
        ])
      );
    });
  });

  describe('rankSuggestions', () => {
    it('should rank suggestions by confidence score descending', () => {
      const suggestions = [
        { ...mockSuggestion, id: '1', confidenceScore: 30 },
        { ...mockSuggestion, id: '2', confidenceScore: 90 },
        { ...mockSuggestion, id: '3', confidenceScore: 60 }
      ];

      const ranked = suggestionManager.rankSuggestions(suggestions);

      expect(ranked[0].confidenceScore).toBe(90);
      expect(ranked[1].confidenceScore).toBe(60);
      expect(ranked[2].confidenceScore).toBe(30);
    });

    it('should not mutate original array', () => {
      const suggestions = [
        { ...mockSuggestion, id: '1', confidenceScore: 30 },
        { ...mockSuggestion, id: '2', confidenceScore: 90 }
      ];

      const original = [...suggestions];
      suggestionManager.rankSuggestions(suggestions);

      expect(suggestions).toEqual(original);
    });
  });

  describe('clearDismissalHistory', () => {
    it('should clear dismissal history for presentation', async () => {
      await suggestionManager.clearDismissalHistory('presentation-1');

      expect(mockStorage.delete).toHaveBeenCalledWith(
        'suggestions:dismissed:presentation-1'
      );
    });

    it('should handle storage errors', async () => {
      mockStorage.delete.mockRejectedValue(new Error('Storage error'));

      await expect(suggestionManager.clearDismissalHistory('presentation-1'))
        .rejects.toThrow(SuggestionError);
    });
  });

  describe('getDismissalStats', () => {
    it('should return dismissal statistics', async () => {
      const dismissedSuggestions = [
        {
          id: 'suggestion-1',
          presentationId: 'presentation-1',
          type: 'content-density',
          targetSlideIndex: 0,
          dismissedAt: new Date('2024-01-01T00:00:00Z')
        },
        {
          id: 'suggestion-2',
          presentationId: 'presentation-1',
          type: 'content-density',
          targetSlideIndex: 1,
          dismissedAt: new Date('2024-01-02T00:00:00Z')
        },
        {
          id: 'suggestion-3',
          presentationId: 'presentation-1',
          type: 'visual-balance',
          targetSlideIndex: 2,
          dismissedAt: new Date('2024-01-03T00:00:00Z')
        }
      ];

      mockStorage.get.mockResolvedValue(dismissedSuggestions);

      const stats = await suggestionManager.getDismissalStats('presentation-1');

      expect(stats.totalDismissed).toBe(3);
      expect(stats.dismissedByType['content-density']).toBe(2);
      expect(stats.dismissedByType['visual-balance']).toBe(1);
      expect(stats.recentDismissals).toHaveLength(3);
      expect(stats.recentDismissals[0].id).toBe('suggestion-3'); // Most recent first
    });

    it('should handle empty dismissal history', async () => {
      mockStorage.get.mockResolvedValue([]);

      const stats = await suggestionManager.getDismissalStats('presentation-1');

      expect(stats.totalDismissed).toBe(0);
      expect(stats.dismissedByType).toEqual({});
      expect(stats.recentDismissals).toHaveLength(0);
    });
  });

  describe('isSuggestionDismissed', () => {
    it('should return true for dismissed suggestion', async () => {
      const dismissedSuggestions = [
        {
          id: 'suggestion-1',
          presentationId: 'presentation-1',
          type: 'content-density',
          targetSlideIndex: 0,
          dismissedAt: new Date()
        }
      ];

      mockStorage.get.mockResolvedValue(dismissedSuggestions);

      const isDismissed = await suggestionManager.isSuggestionDismissed(
        'presentation-1',
        'suggestion-1'
      );

      expect(isDismissed).toBe(true);
    });

    it('should return false for non-dismissed suggestion', async () => {
      mockStorage.get.mockResolvedValue([]);

      const isDismissed = await suggestionManager.isSuggestionDismissed(
        'presentation-1',
        'suggestion-1'
      );

      expect(isDismissed).toBe(false);
    });

    it('should use cache on subsequent calls', async () => {
      const dismissedSuggestions = [
        {
          id: 'suggestion-1',
          presentationId: 'presentation-1',
          type: 'content-density',
          targetSlideIndex: 0,
          dismissedAt: new Date()
        }
      ];

      mockStorage.get.mockResolvedValue(dismissedSuggestions);

      // First call
      await suggestionManager.isSuggestionDismissed('presentation-1', 'suggestion-1');

      // Second call should use cache
      await suggestionManager.isSuggestionDismissed('presentation-1', 'suggestion-1');

      // Storage should only be called once
      expect(mockStorage.get).toHaveBeenCalledTimes(1);
    });
  });
});