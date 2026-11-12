/**
 * Tests for Fallback Suggestions Generator
 */

import { FallbackSuggestionsGenerator } from './fallbackSuggestions';
import { EngagementData } from './types';

describe('FallbackSuggestionsGenerator', () => {
  let generator: FallbackSuggestionsGenerator;

  beforeEach(() => {
    generator = new FallbackSuggestionsGenerator();
  });

  describe('isDataInsufficient', () => {
    it('should detect insufficient data with low views', () => {
      const data: EngagementData = {
        presentationId: 'test-1',
        views: 3,
        averageViewTime: 120,
        dropOffRates: new Map([[0, 0.1], [1, 0.2]]),
        comments: [],
        interactions: [],
        lastUpdated: new Date()
      };

      expect(generator.isDataInsufficient(data)).toBe(true);
    });

    it('should detect insufficient data with missing data types', () => {
      const data: EngagementData = {
        presentationId: 'test-2',
        views: 50,
        averageViewTime: 120,
        dropOffRates: new Map(),
        comments: [],
        interactions: [],
        lastUpdated: new Date()
      };

      expect(generator.isDataInsufficient(data)).toBe(true);
    });

    it('should detect sufficient data', () => {
      const data: EngagementData = {
        presentationId: 'test-3',
        views: 50,
        averageViewTime: 120,
        dropOffRates: new Map([[0, 0.1], [1, 0.2]]),
        comments: [
          {
            id: 'comment-1',
            slideIndex: 0,
            content: 'Good slide',
            timestamp: new Date(),
            userId: 'user-1'
          }
        ],
        interactions: [
          {
            type: 'click',
            slideIndex: 0,
            timestamp: new Date(),
            userId: 'user-1'
          }
        ],
        lastUpdated: new Date()
      };

      expect(generator.isDataInsufficient(data)).toBe(false);
    });
  });

  describe('generateFallbackSuggestions', () => {
    it('should generate fallback suggestions for insufficient data', () => {
      const data: EngagementData = {
        presentationId: 'test-4',
        views: 2,
        averageViewTime: 60,
        dropOffRates: new Map(),
        comments: [],
        interactions: [],
        lastUpdated: new Date()
      };

      const suggestions = generator.generateFallbackSuggestions(data);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.length).toBeLessThanOrEqual(5);

      // All suggestions should have confidence scores in fallback range (30-50)
      suggestions.forEach(suggestion => {
        expect(suggestion.confidenceScore).toBeGreaterThanOrEqual(30);
        expect(suggestion.confidenceScore).toBeLessThanOrEqual(50);
        expect(suggestion.presentationId).toBe('test-4');
        expect(suggestion.id).toContain('fallback');
      });
    });

    it('should generate contextual fallback suggestions', () => {
      const suggestions = generator.generateContextualFallbacks(
        {
          hasTextHeavySlides: true,
          hasLongSlides: true,
          hasNoVisuals: true
        },
        'test-5'
      );

      expect(suggestions.length).toBeGreaterThan(0);

      // Should include suggestions for the specified characteristics
      const suggestionTypes = suggestions.map(s => s.type);
      expect(suggestionTypes).toContain('visual-balance'); // for text-heavy slides
      expect(suggestionTypes).toContain('content-density'); // for long slides
      expect(suggestionTypes).toContain('layout-improvement'); // for no visuals
    });

    it('should generate emergency fallbacks', () => {
      const suggestions = generator.generateEmergencyFallbacks('test-6');

      expect(suggestions).toHaveLength(3);

      suggestions.forEach(suggestion => {
        expect(suggestion.presentationId).toBe('test-6');
        expect(suggestion.confidenceScore).toBeGreaterThanOrEqual(30);
        expect(suggestion.confidenceScore).toBeLessThanOrEqual(50);
        expect(['text-readability', 'layout-improvement', 'engagement-optimization'])
          .toContain(suggestion.type);
      });
    });
  });

  describe('configuration', () => {
    it('should respect configuration limits', () => {
      const customGenerator = new FallbackSuggestionsGenerator({
        maxSuggestions: 3,
        minConfidenceScore: 40,
        maxConfidenceScore: 45,
        prioritizeByImpact: false
      });

      const data: EngagementData = {
        presentationId: 'test-7',
        views: 1,
        averageViewTime: 30,
        dropOffRates: new Map(),
        comments: [],
        interactions: [],
        lastUpdated: new Date()
      };

      const suggestions = customGenerator.generateFallbackSuggestions(data);

      expect(suggestions.length).toBeLessThanOrEqual(3);
      suggestions.forEach(suggestion => {
        expect(suggestion.confidenceScore).toBeGreaterThanOrEqual(40);
        expect(suggestion.confidenceScore).toBeLessThanOrEqual(45);
      });
    });
  });
});