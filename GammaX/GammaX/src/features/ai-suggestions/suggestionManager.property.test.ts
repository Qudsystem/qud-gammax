import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { SuggestionManager } from './suggestionManager';
import { kvStorage } from '../../core/services/kvStorage';
import { Suggestion, SuggestionType, ImpactLevel } from './types';

// Mock dependencies
vi.mock('../../core/services/kvStorage');
vi.mock('../../core/services/eventBus');

const mockKvStorage = vi.mocked(kvStorage);

describe('SuggestionManager Property-Based Tests', () => {
  let suggestionManager: SuggestionManager;

  // Arbitraries for generating test data
  const suggestionTypeArb = fc.constantFrom<SuggestionType>(
    'content-density',
    'visual-balance',
    'text-readability',
    'engagement-optimization',
    'layout-improvement'
  );

  const impactLevelArb = fc.constantFrom<ImpactLevel>('High', 'Medium', 'Low');

  const suggestionArb = fc.record({
    id: fc.string({ minLength: 1, maxLength: 50 }),
    presentationId: fc.string({ minLength: 1, maxLength: 50 }),
    type: suggestionTypeArb,
    targetSlideIndex: fc.integer({ min: 0, max: 100 }),
    title: fc.string({ minLength: 1, maxLength: 100 }),
    description: fc.string({ minLength: 1, maxLength: 500 }),
    rationale: fc.string({ minLength: 1, maxLength: 300 }),
    confidenceScore: fc.integer({ min: 0, max: 100 }),
    impactLevel: impactLevelArb,
    action: fc.record({
      type: fc.constantFrom('modify-text', 'adjust-layout', 'add-visual', 'simplify-content'),
      parameters: fc.dictionary(fc.string(), fc.anything())
    }),
    createdAt: fc.date(),
    applied: fc.option(fc.boolean()),
    dismissed: fc.option(fc.boolean())
  }) as fc.Arbitrary<Suggestion>;

  beforeEach(() => {
    vi.clearAllMocks();
    suggestionManager = new SuggestionManager();
    // @ts-ignore
    suggestionManager.cache.clear();
    // @ts-ignore
    suggestionManager.dismissalCache.clear();
  });

  describe('Property 8: Suggestion Dismissal Effect', () => {
    // Feature: gammax-completion-phase, Property 8: Suggestion Dismissal Effect
    it('should remove dismissed suggestions from suggestion list', async () => {
      await fc.assert(fc.asyncProperty(
        fc.array(suggestionArb, { minLength: 1, maxLength: 10 }),
        fc.array(fc.integer({ min: 0, max: 9 }), { maxLength: 5 }),
        async (suggestions, dismissIndices) => {
          const presentationId = 'test-presentation';

          // Clear cache for each property run
          // @ts-ignore
          suggestionManager.cache.clear();
          // @ts-ignore
          suggestionManager.dismissalCache.clear();

          // Ensure all suggestions have the same presentationId
          const normalizedSuggestions = suggestions.map(s => ({
            ...s,
            presentationId
          }));

          // Get unique dismiss indices within bounds
          const validDismissIndices = [...new Set(dismissIndices)]
            .filter(i => i < normalizedSuggestions.length);

          const dismissedSuggestionIds = validDismissIndices.map(i => normalizedSuggestions[i].id);

          // Mock storage responses
          mockKvStorage.get.mockImplementation((key: string) => {
            if (key === `engagement:test-presentation`) {
              return Promise.resolve({ views: 100 });
            }
            if (key === `suggestions:dismissals:${presentationId}`) {
              return Promise.resolve(
                dismissedSuggestionIds.map(id => ({
                  suggestionId: id,
                  presentationId,
                  type: 'content-density',
                  dismissedAt: new Date()
                }))
              );
            }
            return Promise.resolve([]);
          });

          // Mock AI Analyzer to return our suggestions
          // @ts-ignore
          vi.spyOn(suggestionManager.aiAnalyzer, 'analyzeEngagement').mockResolvedValue({});
          // @ts-ignore
          vi.spyOn(suggestionManager.aiAnalyzer, 'generateSuggestions').mockResolvedValue(normalizedSuggestions);
          // @ts-ignore
          vi.spyOn(suggestionManager.confidenceScorer, 'calculateConfidence').mockImplementation((s) => ({
            finalScore: s.confidenceScore,
            factors: []
          }));

          const result = await suggestionManager.fetchSuggestions(presentationId);

          // Verify dismissed suggestions are not in the result
          dismissedSuggestionIds.forEach(dismissedId => {
            expect(result.find(s => s.id === dismissedId)).toBeUndefined();
          });

          // Verify non-dismissed suggestions are still present
          const expectedCount = normalizedSuggestions.length - dismissedSuggestionIds.length;
          expect(result.length).toBe(expectedCount);
        }
      ), { numRuns: 50 });
    });
  });

  describe('Property 5: Suggestion Ranking Order', () => {
    // Feature: gammax-completion-phase, Property 5: Suggestion Ranking Order
    it('should rank suggestions by confidence score in descending order', () => {
      fc.assert(fc.property(
        fc.array(suggestionArb, { minLength: 2, maxLength: 20 }),
        (suggestions) => {
          const ranked = suggestionManager.rankSuggestions(suggestions);

          // Verify descending order
          for (let i = 0; i < ranked.length - 1; i++) {
            expect(ranked[i].confidenceScore).toBeGreaterThanOrEqual(ranked[i + 1].confidenceScore);
          }

          // Verify all suggestions are preserved
          expect(ranked).toHaveLength(suggestions.length);

          // Verify no suggestions are lost or duplicated
          const originalIds = suggestions.map(s => s.id).sort();
          const rankedIds = ranked.map(s => s.id).sort();
          expect(rankedIds).toEqual(originalIds);
        }
      ), { numRuns: 100 });
    });
  });

  describe('Property 3: Confidence Score Bounds', () => {
    // Feature: gammax-completion-phase, Property 3: Confidence Score Bounds
    it('should maintain confidence score bounds after ranking', () => {
      fc.assert(fc.property(
        fc.array(suggestionArb, { minLength: 1, maxLength: 10 }),
        (suggestions) => {
          const ranked = suggestionManager.rankSuggestions(suggestions);

          ranked.forEach(suggestion => {
            expect(suggestion.confidenceScore).toBeGreaterThanOrEqual(0);
            expect(suggestion.confidenceScore).toBeLessThanOrEqual(100);
          });
        }
      ), { numRuns: 100 });
    });
  });

  describe('Dismissal Persistence Properties', () => {
    it('should persist dismissal state correctly', async () => {
      await fc.assert(fc.asyncProperty(
        suggestionArb,
        async (suggestion) => {
          const presentationId = 'test-presentation';
          suggestion.presentationId = presentationId;

          // Clear cache for each property run
          // @ts-ignore
          suggestionManager.cache.clear();
          // @ts-ignore
          suggestionManager.dismissalCache.clear();

          // Setup cache so getSuggestionById finds it
          // @ts-ignore
          suggestionManager.cache.set(presentationId, {
            suggestions: [suggestion],
            timestamp: Date.now(),
            presentationId
          });

          mockKvStorage.get.mockResolvedValue([]);
          mockKvStorage.set.mockResolvedValue(undefined);

          await suggestionManager.dismissSuggestion(suggestion.id);

          // Verify storage key and format
          expect(mockKvStorage.set).toHaveBeenCalledWith(
            `suggestions:dismissals:${presentationId}`,
            expect.arrayContaining([
              expect.objectContaining({
                suggestionId: suggestion.id,
                presentationId
              })
            ])
          );
        }
      ), { numRuns: 50 });
    });

    it('should handle multiple dismissals without duplication', async () => {
      await fc.assert(fc.asyncProperty(
        fc.array(suggestionArb, { minLength: 1, maxLength: 5 }),
        async (suggestions) => {
          const presentationId = 'test-presentation';
          const normalized = suggestions.map(s => ({ ...s, presentationId }));

          // Clear cache for each property run
          // @ts-ignore
          suggestionManager.cache.clear();
          // @ts-ignore
          suggestionManager.dismissalCache.clear();

          // @ts-ignore
          suggestionManager.cache.set(presentationId, {
            suggestions: normalized,
            timestamp: Date.now(),
            presentationId
          });

          // Reset storage for each run
          let stored: any[] = [];
          mockKvStorage.get.mockImplementation(() => Promise.resolve(stored));
          mockKvStorage.set.mockImplementation((_, data) => {
            stored = data;
            return Promise.resolve(undefined);
          });

          // Dismiss the same suggestion twice
          const targetId = normalized[0].id;
          await suggestionManager.dismissSuggestion(targetId);
          await suggestionManager.dismissSuggestion(targetId);

          // Verify no duplicates in storage
          expect(stored.filter(d => d.suggestionId === targetId)).toHaveLength(1);
        }
      ), { numRuns: 30 });
    });
  });

  describe('Cache Consistency Properties', () => {
    it('should maintain cache consistency across operations', async () => {
      await fc.assert(fc.asyncProperty(
        fc.array(suggestionArb, { minLength: 1, maxLength: 5 }),
        async (suggestions) => {
          const presentationId = 'test-presentation';
          const normalized = suggestions.map(s => ({ ...s, presentationId }));

          // Clear cache for each property run
          // @ts-ignore
          suggestionManager.cache.clear();
          // @ts-ignore
          suggestionManager.dismissalCache.clear();

          // @ts-ignore
          suggestionManager.cache.set(presentationId, {
            suggestions: normalized,
            timestamp: Date.now(),
            presentationId
          });

          mockKvStorage.get.mockResolvedValue([]);

          const targetId = normalized[0].id;
          await suggestionManager.dismissSuggestion(targetId);

          // After dismissal, the results cache should be cleared/invalidated
          // @ts-ignore
          expect(suggestionManager.cache.has(presentationId)).toBe(false);
        }
      ), { numRuns: 30 });
    });
  });
});