import { describe, it, expect, beforeEach } from 'vitest';
import { fc } from 'fast-check';
import { TemplateLibrary } from '../services/templateLibrary';
import { DiagramTemplate } from '../types';

describe('TemplateLibrary', () => {
  let library: TemplateLibrary;

  beforeEach(() => {
    library = new TemplateLibrary();
  });

  describe('Unit Tests - Template Management', () => {
    it('should load predefined templates', () => {
      const templates = library.getTemplates();
      expect(templates.length).toBeGreaterThanOrEqual(15);
    });

    it('should organize templates by category', () => {
      const categories = library.getCategories();
      expect(categories.length).toBeGreaterThanOrEqual(6);
    });

    it('should retrieve template by ID', () => {
      const template = library.getTemplateById('flowchart-basic');
      expect(template).toBeDefined();
      expect(template?.name).toBeDefined();
    });

    it('should filter templates by category', () => {
      const flowcharts = library.getTemplatesByCategory('flowchart');
      expect(flowcharts.length).toBeGreaterThan(0);
      flowcharts.forEach((t) => {
        expect(t.category).toBe('flowchart');
      });
    });

    it('should search templates', () => {
      const results = library.searchTemplates('flow');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Property-Based Tests - Template Application', () => {
    it('should apply template to any slide', () => {
      fc.assert(
        fc.property(
          fc.record({
            slideIndex: fc.integer({ min: 0, max: 100 }),
            templateId: fc.oneof(
              fc.constant('flowchart-basic'),
              fc.constant('swimlane-process'),
              fc.constant('mindmap-standard')
            ),
          }),
          (data) => {
            const result = library.applyTemplate(data.slideIndex, data.templateId);
            expect(typeof result).toBe('boolean');
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle custom template search queries', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (query) => {
            const results = library.searchTemplates(query);
            expect(Array.isArray(results)).toBe(true);
            results.forEach((t) => {
              expect(t.name || t.description).toBeDefined();
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Integration Tests - Template Workflow', () => {
    it('should track template popularity', () => {
      const template = library.getTemplateById('flowchart-basic');
      if (template) {
        const initialPopularity = template.popularity || 0;
        library.applyTemplate(0, 'flowchart-basic');
        const updated = library.getTemplateById('flowchart-basic');
        expect((updated?.popularity || 0)).toBeGreaterThanOrEqual(initialPopularity);
      }
    });

    it('should customize template after application', () => {
      const slide = library.applyTemplate(0, 'flowchart-basic');
      expect(slide).toBeDefined();

      if (slide) {
        const modified = library.customizeTemplate(slide, {
          primaryColor: '#FF0000',
          fontSize: 16,
        });

        expect(modified.primaryColor).toBe('#FF0000');
        expect(modified.fontSize).toBe(16);
      }
    });

    it('should generate template thumbnails', () => {
      const thumbnails = library.generateThumbnails();
      expect(thumbnails.length).toBeGreaterThanOrEqual(15);

      thumbnails.forEach((thumb) => {
        expect(thumb.templateId).toBeDefined();
        expect(thumb.imageUrl).toBeDefined();
      });
    });

    it('should support template favorites', () => {
      library.addFavorite('flowchart-basic');
      const favorites = library.getFavorites();
      expect(favorites.some((t) => t.id === 'flowchart-basic')).toBe(true);

      library.removeFavorite('flowchart-basic');
      const updated = library.getFavorites();
      expect(updated.some((t) => t.id === 'flowchart-basic')).toBe(false);
    });

    it('should handle recent templates', () => {
      library.applyTemplate(0, 'flowchart-basic');
      library.applyTemplate(1, 'swimlane-process');

      const recent = library.getRecentTemplates();
      expect(recent.length).toBeGreaterThan(0);
    });
  });
});
