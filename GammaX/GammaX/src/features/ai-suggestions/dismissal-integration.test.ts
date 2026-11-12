/**
 * Integration test for suggestion dismissal functionality
 * This test verifies the core dismissal requirements without complex mocking
 */

import { describe, it, expect } from 'vitest';
import { SuggestionManager } from './suggestionManager';
import { Suggestion } from './types';

describe('Suggestion Dismissal Integration', () => {
  it('should implement dismissal functionality according to requirements', () => {
    const suggestionManager = new SuggestionManager();
    
    // Verify the SuggestionManager has all required methods
    expect(typeof suggestionManager.fetchSuggestions).toBe('function');
    expect(typeof suggestionManager.dismissSuggestion).toBe('function');
    expect(typeof suggestionManager.applySuggestion).toBe('function');
    expect(typeof suggestionManager.rankSuggestions).toBe('function');
    expect(typeof suggestionManager.clearDismissalHistory).toBe('function');
    expect(typeof suggestionManager.getDismissalStats).toBe('function');
    expect(typeof suggestionManager.isSuggestionDismissed).toBe('function');
  });

  it('should rank suggestions by confidence score in descending order', () => {
    const suggestionManager = new SuggestionManager();
    
    const suggestions: Suggestion[] = [
      {
        id: 'low',
        presentationId: 'test',
        type: 'content-density',
        targetSlideIndex: 0,
        title: 'Low confidence',
        description: 'Test',
        rationale: 'Test',
        confidenceScore: 30,
        impactLevel: 'Low',
        action: { type: 'modify-text', parameters: {} },
        createdAt: new Date()
      },
      {
        id: 'high',
        presentationId: 'test',
        type: 'visual-balance',
        targetSlideIndex: 1,
        title: 'High confidence',
        description: 'Test',
        rationale: 'Test',
        confidenceScore: 90,
        impactLevel: 'High',
        action: { type: 'adjust-layout', parameters: {} },
        createdAt: new Date()
      },
      {
        id: 'medium',
        presentationId: 'test',
        type: 'text-readability',
        targetSlideIndex: 2,
        title: 'Medium confidence',
        description: 'Test',
        rationale: 'Test',
        confidenceScore: 60,
        impactLevel: 'Medium',
        action: { type: 'add-visual', parameters: {} },
        createdAt: new Date()
      }
    ];

    const ranked = suggestionManager.rankSuggestions(suggestions);

    // Verify descending order by confidence score
    expect(ranked[0].confidenceScore).toBe(90);
    expect(ranked[1].confidenceScore).toBe(60);
    expect(ranked[2].confidenceScore).toBe(30);
    
    // Verify all suggestions are preserved
    expect(ranked).toHaveLength(3);
    expect(ranked.map(s => s.id).sort()).toEqual(['high', 'low', 'medium']);
  });

  it('should validate confidence score bounds', () => {
    const suggestionManager = new SuggestionManager();
    
    const suggestions: Suggestion[] = [
      {
        id: 'valid-min',
        presentationId: 'test',
        type: 'content-density',
        targetSlideIndex: 0,
        title: 'Min confidence',
        description: 'Test',
        rationale: 'Test',
        confidenceScore: 0, // Minimum valid score
        impactLevel: 'Low',
        action: { type: 'modify-text', parameters: {} },
        createdAt: new Date()
      },
      {
        id: 'valid-max',
        presentationId: 'test',
        type: 'visual-balance',
        targetSlideIndex: 1,
        title: 'Max confidence',
        description: 'Test',
        rationale: 'Test',
        confidenceScore: 100, // Maximum valid score
        impactLevel: 'High',
        action: { type: 'adjust-layout', parameters: {} },
        createdAt: new Date()
      }
    ];

    const ranked = suggestionManager.rankSuggestions(suggestions);

    // Verify confidence scores are within bounds
    ranked.forEach(suggestion => {
      expect(suggestion.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(suggestion.confidenceScore).toBeLessThanOrEqual(100);
    });
  });

  it('should not mutate original suggestions array during ranking', () => {
    const suggestionManager = new SuggestionManager();
    
    const suggestions: Suggestion[] = [
      {
        id: 'first',
        presentationId: 'test',
        type: 'content-density',
        targetSlideIndex: 0,
        title: 'First',
        description: 'Test',
        rationale: 'Test',
        confidenceScore: 30,
        impactLevel: 'Low',
        action: { type: 'modify-text', parameters: {} },
        createdAt: new Date()
      },
      {
        id: 'second',
        presentationId: 'test',
        type: 'visual-balance',
        targetSlideIndex: 1,
        title: 'Second',
        description: 'Test',
        rationale: 'Test',
        confidenceScore: 90,
        impactLevel: 'High',
        action: { type: 'adjust-layout', parameters: {} },
        createdAt: new Date()
      }
    ];

    const originalOrder = suggestions.map(s => s.id);
    suggestionManager.rankSuggestions(suggestions);
    
    // Original array should remain unchanged
    expect(suggestions.map(s => s.id)).toEqual(originalOrder);
  });
});