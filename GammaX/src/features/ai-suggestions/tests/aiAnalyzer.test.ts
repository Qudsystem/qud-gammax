import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fc } from 'fast-check';
import { AIAnalyzer } from '../services/aiAnalyzer';
import { EngagementData, Suggestion } from '../types';

describe('AIAnalyzer', () => {
  let analyzer: AIAnalyzer;

  beforeEach(() => {
    analyzer = new AIAnalyzer();
  });

  describe('Unit Tests', () => {
    it('should analyze engagement data correctly', () => {
      const data: EngagementData = {
        slideIndex: 0,
        timeSpent: 30,
        interactionCount: 5,
        fontSize: 16,
        colorContrast: 4.5,
      };

      const result = analyzer.analyze(data);
      expect(result).toBeDefined();
      expect(result.suggestions).toBeInstanceOf(Array);
    });

    it('should handle empty engagement data', () => {
      const data: EngagementData = {
        slideIndex: 0,
        timeSpent: 0,
        interactionCount: 0,
        fontSize: 16,
        colorContrast: 0,
      };

      const result = analyzer.analyze(data);
      expect(result.suggestions.length).toBeGreaterThanOrEqual(0);
    });

    it('should calculate confidence scores between 0 and 1', () => {
      const data: EngagementData = {
        slideIndex: 0,
        timeSpent: 25,
        interactionCount: 3,
        fontSize: 14,
        colorContrast: 3.5,
      };

      const result = analyzer.analyze(data);
      result.suggestions.forEach((suggestion) => {
        expect(suggestion.confidence).toBeGreaterThanOrEqual(0);
        expect(suggestion.confidence).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Property-Based Tests', () => {
    it('should handle any valid engagement data', () => {
      fc.assert(
        fc.property(
          fc.record({
            slideIndex: fc.integer({ min: 0, max: 100 }),
            timeSpent: fc.integer({ min: 0, max: 3600 }),
            interactionCount: fc.integer({ min: 0, max: 100 }),
            fontSize: fc.integer({ min: 8, max: 72 }),
            colorContrast: fc.float({ min: 1, max: 21 }),
          }),
          (data) => {
            const result = analyzer.analyze(data as EngagementData);
            expect(result).toBeDefined();
            expect(Array.isArray(result.suggestions)).toBe(true);
            result.suggestions.forEach((s) => {
              expect(s.confidence).toBeGreaterThanOrEqual(0);
              expect(s.confidence).toBeLessThanOrEqual(1);
              expect(typeof s.text).toBe('string');
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should produce consistent results for identical input', () => {
      fc.assert(
        fc.property(
          fc.record({
            slideIndex: fc.integer({ min: 0, max: 100 }),
            timeSpent: fc.integer({ min: 0, max: 3600 }),
            interactionCount: fc.integer({ min: 0, max: 100 }),
            fontSize: fc.integer({ min: 8, max: 72 }),
            colorContrast: fc.float({ min: 1, max: 21 }),
          }),
          (data) => {
            const result1 = analyzer.analyze(data as EngagementData);
            const result2 = analyzer.analyze(data as EngagementData);
            expect(result1.suggestions.length).toBe(result2.suggestions.length);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Performance Tests', () => {
    it('should analyze large datasets within acceptable time', () => {
      const largeDataset: EngagementData[] = Array.from({ length: 1000 }, (_, i) => ({
        slideIndex: i,
        timeSpent: Math.random() * 3600,
        interactionCount: Math.floor(Math.random() * 100),
        fontSize: Math.floor(Math.random() * 64) + 8,
        colorContrast: Math.random() * 20 + 1,
      }));

      const startTime = performance.now();
      for (const data of largeDataset) {
        analyzer.analyze(data);
      }
      const endTime = performance.now();

      const avgTime = (endTime - startTime) / largeDataset.length;
      expect(avgTime).toBeLessThan(50); // Should be less than 50ms per analysis
    });
  });
});
