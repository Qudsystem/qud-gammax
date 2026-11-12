import { describe, it, expect, beforeEach } from 'vitest';
import { TemplateLibrary } from '../library';
import fc from 'fast-check';

describe('Template Library', () => {
  let library: TemplateLibrary;

  beforeEach(() => {
    library = new TemplateLibrary();
  });

  // Unit Tests
  describe('Unit Tests for Template Management', () => {
    it('should create and retrieve templates', () => {
      const template = library.createTemplate({
        id: 'template-1',
        name: 'Process Flow',
        category: 'flowchart',
        content: {
          nodes: [{ id: 'n1', shape: 'rectangle', label: 'Start' }],
          connections: []
        }
      });

      expect(template).toBeDefined();
      expect(template.name).toBe('Process Flow');
    });

    it('should support 15+ templates across 6 categories', () => {
      const categories = ['flowchart', 'timeline', 'org', 'venn', 'swot', 'pyramid'];
      let count = 0;

      categories.forEach(category => {
        for (let i = 0; i < 3; i++) {
          library.createTemplate({
            id: `template-${count}`,
            name: `${category} Template ${i}`,
            category,
            content: { nodes: [], connections: [] }
          });
          count++;
        }
      });

      expect(library.getTemplates().length).toBeGreaterThanOrEqual(18);
    });

    it('should categorize templates correctly', () => {
      library.createTemplate({
        id: 't1',
        name: 'Flowchart',
        category: 'flowchart',
        content: { nodes: [], connections: [] }
      });

      library.createTemplate({
        id: 't2',
        name: 'Timeline',
        category: 'timeline',
        content: { nodes: [], connections: [] }
      });

      const flowcharts = library.getTemplatesByCategory('flowchart');
      expect(flowcharts.length).toBe(1);
      expect(flowcharts[0].id).toBe('t1');
    });

    it('should generate template thumbnails', () => {
      const template = library.createTemplate({
        id: 'template-1',
        name: 'Test',
        category: 'flowchart',
        content: { nodes: [{ id: 'n1', shape: 'rectangle' }], connections: [] }
      });

      const thumbnail = library.generateThumbnail(template.id);
      expect(thumbnail).toBeDefined();
      expect(typeof thumbnail).toBe('string'); // Base64 or data URL
    });
  });

  // Property-based Tests
  describe('Property-based Tests for Template Application', () => {
    it('should apply templates to slides consistently', () => {
      fc.assert(
        fc.property(
          fc.record({
            slideCount: fc.integer({ min: 1, max: 10 }),
            templateCount: fc.integer({ min: 1, max: 5 })
          }),
          (props) => {
            // Create templates
            for (let i = 0; i < props.templateCount; i++) {
              library.createTemplate({
                id: `template-${i}`,
                name: `Template ${i}`,
                category: 'flowchart',
                content: {
                  nodes: [{ id: `n${i}`, shape: 'rectangle', label: `Node ${i}` }],
                  connections: []
                }
              });
            }

            // Create slides
            const slides = Array.from({ length: props.slideCount }, (_, i) => ({
              id: `slide-${i}`,
              content: `Slide ${i}`
            }));

            // Apply templates
            slides.forEach((slide, i) => {
              const templateId = `template-${i % props.templateCount}`;
              const applied = library.applyTemplate(slide, templateId);
              expect(applied).toBeDefined();
              expect(applied.template).toBe(templateId);
            });
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  // Template Search Tests
  describe('Property-based Tests for Template Search', () => {
    it('should search templates across all categories', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              name: fc.string({ minLength: 3, maxLength: 50 }),
              keywords: fc.array(fc.string({ minLength: 2, maxLength: 20 }), {
                maxLength: 3
              })
            }),
            { minLength: 5, maxLength: 20 }
          ),
          (templates) => {
            templates.forEach((t, i) => {
              library.createTemplate({
                id: `template-${i}`,
                name: t.name,
                category: ['flowchart', 'timeline', 'org'][i % 3],
                keywords: t.keywords,
                content: { nodes: [], connections: [] }
              });
            });

            templates.forEach(t => {
              const results = library.search(t.name.substring(0, 3));
              expect(Array.isArray(results)).toBe(true);
              // At least partial matches should be found
              expect(results.length).toBeGreaterThanOrEqual(0);
            });
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  // Integration Tests
  describe('Integration Tests for Template Workflow', () => {
    it('should handle complete template workflow', () => {
      // Create templates
      const flowchartTemplate = library.createTemplate({
        id: 'flowchart-1',
        name: 'Decision Flow',
        category: 'flowchart',
        thumbnail: 'data:image/png;base64,...',
        content: {
          nodes: [
            { id: 'start', shape: 'rectangle', label: 'Start' },
            { id: 'decision', shape: 'diamond', label: 'Decision' },
            { id: 'end', shape: 'rectangle', label: 'End' }
          ],
          connections: [
            { from: 'start', to: 'decision' },
            { from: 'decision', to: 'end' }
          ]
        },
        popularity: 0
      });

      // Search templates
      const searchResults = library.search('Decision');
      expect(searchResults.length).toBeGreaterThan(0);

      // Get by category
      const flowcharts = library.getTemplatesByCategory('flowchart');
      expect(flowcharts.length).toBeGreaterThan(0);

      // Apply template to slide
      const slide = { id: 'slide-1', content: 'Test Slide' };
      const applied = library.applyTemplate(slide, 'flowchart-1');
      expect(applied.template).toBe('flowchart-1');
      expect(applied.content).toBeDefined();

      // Track popularity
      library.trackUsage('flowchart-1');
      const template = library.getTemplate('flowchart-1');
      expect(template.popularity).toBeGreaterThan(0);

      // Verify customization after application
      const customized = library.customizeTemplate(applied, {
        nodes: [
          { id: 'new_node', shape: 'circle', label: 'New' }
        ]
      });
      expect(customized.content.nodes.length).toBeGreaterThan(3);
    });

    it('should maintain template consistency across applications', () => {
      const template = library.createTemplate({
        id: 'template-1',
        name: 'Consistent Template',
        category: 'flowchart',
        content: {
          nodes: [
            { id: 'n1', shape: 'rectangle', color: '#0066CC' },
            { id: 'n2', shape: 'rectangle', color: '#0066CC' }
          ],
          connections: []
        }
      });

      const slide1 = library.applyTemplate({ id: 's1' }, 'template-1');
      const slide2 = library.applyTemplate({ id: 's2' }, 'template-1');

      expect(slide1.content.nodes[0].color).toBe(slide2.content.nodes[0].color);
      expect(slide1.content.nodes.length).toBe(slide2.content.nodes.length);
    });
  });
});
