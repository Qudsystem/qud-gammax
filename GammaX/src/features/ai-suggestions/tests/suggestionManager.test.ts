import { describe, it, expect, beforeEach } from 'vitest';
import { SuggestionManager } from '../services/suggestionManager';
import { Suggestion } from '../types';

describe('SuggestionManager', () => {
  let manager: SuggestionManager;

  beforeEach(() => {
    manager = new SuggestionManager();
  });

  describe('Unit Tests', () => {
    it('should add a suggestion', () => {
      const suggestion: Suggestion = {
        id: '1',
        text: 'Test suggestion',
        confidence: 0.8,
        type: 'design',
        slideIndex: 0,
        createdAt: new Date(),
      };

      manager.addSuggestion(suggestion);
      const retrieved = manager.getSuggestion('1');
      expect(retrieved).toEqual(suggestion);
    });

    it('should remove a suggestion', () => {
      const suggestion: Suggestion = {
        id: '1',
        text: 'Test suggestion',
        confidence: 0.8,
        type: 'design',
        slideIndex: 0,
        createdAt: new Date(),
      };

      manager.addSuggestion(suggestion);
      manager.removeSuggestion('1');
      expect(manager.getSuggestion('1')).toBeUndefined();
    });

    it('should list all suggestions', () => {
      const suggestions: Suggestion[] = [
        {
          id: '1',
          text: 'Suggestion 1',
          confidence: 0.8,
          type: 'design',
          slideIndex: 0,
          createdAt: new Date(),
        },
        {
          id: '2',
          text: 'Suggestion 2',
          confidence: 0.7,
          type: 'content',
          slideIndex: 1,
          createdAt: new Date(),
        },
      ];

      suggestions.forEach((s) => manager.addSuggestion(s));
      const all = manager.getAllSuggestions();
      expect(all.length).toBe(2);
    });

    it('should filter suggestions by status', () => {
      const suggestion: Suggestion = {
        id: '1',
        text: 'Test suggestion',
        confidence: 0.8,
        type: 'design',
        slideIndex: 0,
        createdAt: new Date(),
        dismissed: false,
      };

      manager.addSuggestion(suggestion);
      const activeSuggestions = manager.getActiveSuggestions();
      expect(activeSuggestions.some((s) => s.id === '1')).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should apply a suggestion to a slide', () => {
      const suggestion: Suggestion = {
        id: '1',
        text: 'Increase font size',
        confidence: 0.8,
        type: 'design',
        slideIndex: 0,
        createdAt: new Date(),
      };

      manager.addSuggestion(suggestion);
      const result = manager.applySuggestion('1');
      expect(result).toBe(true);
    });

    it('should track suggestion application history', () => {
      const suggestion: Suggestion = {
        id: '1',
        text: 'Test suggestion',
        confidence: 0.8,
        type: 'design',
        slideIndex: 0,
        createdAt: new Date(),
      };

      manager.addSuggestion(suggestion);
      manager.applySuggestion('1');
      const history = manager.getHistory('1');
      expect(history.length).toBeGreaterThan(0);
    });

    it('should handle dismissal of suggestions', () => {
      const suggestion: Suggestion = {
        id: '1',
        text: 'Test suggestion',
        confidence: 0.8,
        type: 'design',
        slideIndex: 0,
        createdAt: new Date(),
      };

      manager.addSuggestion(suggestion);
      manager.dismissSuggestion('1');
      const dismissed = manager.getDismissedSuggestions();
      expect(dismissed.some((s) => s.id === '1')).toBe(true);
    });
  });
});
