/**
 * Integration tests for SuggestionManager with fallback suggestions
 */

import { SuggestionManager } from './suggestionManager';
import { kvStorage } from '../../core/services/kvStorage';
import { EngagementData } from './types';

// Mock the kvStorage
jest.mock('../../core/services/kvStorage', () => ({
  kvStorage: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn()
  }
}));

describe('SuggestionManager Integration', () => {
  let manager: SuggestionManager;
  const mockKvStorage = kvStorage as jest.Mocked<typeof kvStorage>;

  beforeEach(() => {
    manager = new SuggestionManager({
      enableAIAnalysis: false, // Disable AI to test fallback path
      enableFallbackSuggestions: true,
      cacheResults: false // Disable cache for testing
    });
    
    jest.clearAllMocks();
  });

  describe('fetchSuggestions with insufficient data', () => {
    it('should return fallback suggestions when data is insufficient', async () => {
      const insufficientData: EngagementData = {
        presentationId: 'test-presentation',
        views: 2,
        averageViewTime: 30,
        dropOffRates: new Map(),
        comments: [],
        interactions: [],
        lastUpdated: new Date()
      };

      // Mock engagement data retrieval
      mockKvStorage.get.mockImplementation((key: string) => {
        if (key === 'engagement:test-presentation') {
          return Promise.resolve(insufficientData);
        }
        if (key === 'suggestions:dismissals:test-presentation') {
          return Promise.resolve([]);
        }
        return Promise.resolve(null);
      });

      const suggestions = await manager.fetchSuggestions('test-presentation');

      expect(suggestions).toHaveLength.greaterThan(0);
      expect(suggestions).toHaveLength.lessThanOrEqual(8);
      
      // All suggestions should be fallback suggestions with appropriate confidence scores
      suggestions.forEach(suggestion => {
        expect(suggestion.confidenceScore).toBeGreaterThanOrEqual(30);
        expect(suggestion.confidenceScore).toBeLessThanOrEqual(50);
        expect(suggestion.presentationId).toBe('test-presentation');
      });
    });

    it('should filter out dismissed suggestions', async () => {
      const insufficientData: EngagementData = {
        presentationId: 'test-presentation-2',
        views: 3,
        averageViewTime: 45,
        dropOffRates: new Map(),
        comments: [],
        interactions: [],
        lastUpdated: new Date()
      };

      // Mock dismissed suggestions
      const dismissedSuggestions = [
        {
          suggestionId: 'fallback-text-readability-123',
          type: 'text-readability',
          dismissedAt: new Date().toISOString()
        }
      ];

      mockKvStorage.get.mockImplementation((key: string) => {
        if (key === 'engagement:test-presentation-2') {
          return Promise.resolve(insufficientData);
        }
        if (key === 'suggestions:dismissals:test-presentation-2') {
          return Promise.resolve(dismissedSuggestions);
        }
        return Promise.resolve(null);
      });

      const suggestions = await manager.fetchSuggestions('test-presentation-2');

      // Should not include dismissed suggestions
      const suggestionIds = suggestions.map(s => s.id);
      expect(suggestionIds).not.toContain('fallback-text-readability-123');
    });

    it('should return emergency fallbacks when no engagement data exists', async () => {
      // Mock no engagement data
      mockKvStorage.get.mockImplementation((key: string) => {
        if (key === 'engagement:no-data-presentation') {
          return Promise.resolve(null);
        }
        return Promise.resolve([]);
      });

      const suggestions = await manager.fetchSuggestions('no-data-presentation');

      expect(suggestions).toHaveLength(3); // Emergency fallbacks
      suggestions.forEach(suggestion => {
        expect(suggestion.presentationId).toBe('no-data-presentation');
        expect(['text-readability', 'layout-improvement', 'engagement-optimization'])
          .toContain(suggestion.type);
      });
    });
  });

  describe('suggestion dismissal', () => {
    it('should handle dismissal of fallback suggestions', async () => {
      const testSuggestion = {
        id: 'fallback-test-123',
        presentationId: 'test-presentation-3',
        type: 'text-readability',
        targetSlideIndex: 0,
        title: 'Test Suggestion',
        description: 'Test description',
        rationale: 'Test rationale',
        confidenceScore: 40,
        impactLevel: 'Medium' as const,
        action: {
          type: 'modify-text' as const,
          parameters: {}
        },
        createdAt: new Date()
      };

      // Mock suggestion retrieval and storage
      mockKvStorage.get.mockImplementation((key: string) => {
        if (key === 'suggestion:fallback-test-123') {
          return Promise.resolve(testSuggestion);
        }
        if (key === 'suggestions:dismissals:test-presentation-3') {
          return Promise.resolve([]);
        }
        return Promise.resolve(null);
      });

      mockKvStorage.set.mockResolvedValue(undefined);

      await manager.dismissSuggestion('fallback-test-123');

      // Should have stored the dismissal
      expect(mockKvStorage.set).toHaveBeenCalledWith(
        'suggestions:dismissals:test-presentation-3',
        expect.arrayContaining([
          expect.objectContaining({
            suggestionId: 'fallback-test-123',
            type: 'text-readability'
          })
        ])
      );
    });
  });

  describe('analytics and stats', () => {
    it('should provide dismissal statistics', async () => {
      const dismissals = [
        {
          suggestionId: 'fallback-1',
          type: 'text-readability',
          dismissedAt: new Date().toISOString()
        },
        {
          suggestionId: 'fallback-2',
          type: 'visual-balance',
          dismissedAt: new Date().toISOString()
        },
        {
          suggestionId: 'fallback-3',
          type: 'text-readability',
          dismissedAt: new Date().toISOString()
        }
      ];

      mockKvStorage.get.mockResolvedValue(dismissals);

      const stats = await manager.getDismissalStats('test-presentation-4');

      expect(stats.totalDismissed).toBe(3);
      expect(stats.dismissedByType['text-readability']).toBe(2);
      expect(stats.dismissedByType['visual-balance']).toBe(1);
      expect(stats.recentDismissals).toHaveLength(3);
    });

    it('should check if suggestion is dismissed', async () => {
      const dismissals = [
        {
          suggestionId: 'fallback-dismissed',
          type: 'layout-improvement',
          dismissedAt: new Date().toISOString()
        }
      ];

      mockKvStorage.get.mockResolvedValue(dismissals);

      const isDismissed = await manager.isSuggestionDismissed(
        'test-presentation-5',
        'fallback-dismissed'
      );
      const isNotDismissed = await manager.isSuggestionDismissed(
        'test-presentation-5',
        'fallback-not-dismissed'
      );

      expect(isDismissed).toBe(true);
      expect(isNotDismissed).toBe(false);
    });
  });

  describe('configuration', () => {
    it('should respect fallback configuration settings', async () => {
      const customManager = new SuggestionManager({
        enableAIAnalysis: false,
        enableFallbackSuggestions: true,
        maxSuggestions: 4,
        minConfidenceScore: 35,
        cacheResults: false
      });

      const insufficientData: EngagementData = {
        presentationId: 'test-config',
        views: 1,
        averageViewTime: 20,
        dropOffRates: new Map(),
        comments: [],
        interactions: [],
        lastUpdated: new Date()
      };

      mockKvStorage.get.mockImplementation((key: string) => {
        if (key === 'engagement:test-config') {
          return Promise.resolve(insufficientData);
        }
        return Promise.resolve([]);
      });

      const suggestions = await customManager.fetchSuggestions('test-config');

      expect(suggestions).toHaveLength.lessThanOrEqual(4);
      suggestions.forEach(suggestion => {
        expect(suggestion.confidenceScore).toBeGreaterThanOrEqual(35);
      });
    });
  });
});