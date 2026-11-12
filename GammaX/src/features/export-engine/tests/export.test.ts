import { describe, it, expect, beforeEach } from 'vitest';
import { ExportEngine } from '../engine';
import fc from 'fast-check';

describe('Export Engine', () => {
  let engine: ExportEngine;

  beforeEach(() => {
    engine = new ExportEngine();
  });

  // Unit Tests
  describe('Unit Tests for PPTX Generation', () => {
    it('should generate valid PPTX file', async () => {
      const presentation = {
        title: 'Test',
        slides: [
          { id: '1', content: 'Slide 1', shapes: [] },
          { id: '2', content: 'Slide 2', shapes: [] }
        ]
      };

      const buffer = await engine.generatePPTX(presentation);
      expect(buffer).toBeDefined();
      expect(buffer.byteLength).toBeGreaterThan(0);
    });

    it('should include annotations in export', async () => {
      const presentation = {
        title: 'Test',
        slides: [
          {
            id: '1',
            content: 'Slide',
            annotations: [
              { type: 'arrow', startX: 10, startY: 10, endX: 100, endY: 100 }
            ]
          }
        ]
      };

      const buffer = await engine.generatePPTX(presentation);
      expect(buffer).toBeDefined();
    });

    it('should preserve slide transitions', async () => {
      const presentation = {
        title: 'Test',
        slides: [
          {
            id: '1',
            content: 'Slide 1',
            transition: { type: 'fade', duration: 500 }
          }
        ]
      };

      const buffer = await engine.generatePPTX(presentation);
      const exported = await engine.parsePPTX(buffer);
      
      expect(exported.slides[0].transition).toBeDefined();
      expect(exported.slides[0].transition.type).toBe('fade');
    });
  });

  // Property-based Tests
  describe('Property-based Tests for Export-Import Round-Trip', () => {
    it('should preserve presentation data through round-trip', () => {
      fc.assert(
        fc.property(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 100 }),
            slideCount: fc.integer({ min: 1, max: 20 })
          }),
          async (props) => {
            const slides = Array.from({ length: props.slideCount }, (_, i) => ({
              id: `slide-${i}`,
              content: `Slide ${i + 1}`,
              shapes: []
            }));

            const original = {
              title: props.title,
              slides
            };

            const buffer = await engine.generatePPTX(original);
            const imported = await engine.parsePPTX(buffer);

            expect(imported.title).toBe(props.title);
            expect(imported.slides.length).toBe(props.slideCount);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should preserve content through export-import cycle', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 200 }), {
            minLength: 1,
            maxLength: 10
          }),
          async (contents) => {
            const presentation = {
              title: 'Test',
              slides: contents.map((content, i) => ({
                id: `slide-${i}`,
                content,
                shapes: []
              }))
            };

            const buffer = await engine.generatePPTX(presentation);
            const imported = await engine.parsePPTX(buffer);

            imported.slides.forEach((slide, i) => {
              expect(slide.content).toBe(contents[i]);
            });
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  // Content Preservation Tests
  describe('Property-based Tests for Content Preservation', () => {
    it('should maintain formatting in exported content', () => {
      fc.assert(
        fc.property(
          fc.record({
            slides: fc.array(
              fc.record({
                content: fc.string({ minLength: 1, maxLength: 300 }),
                fontSize: fc.integer({ min: 8, max: 72 }),
                color: fc.hexColor()
              }),
              { minLength: 1, maxLength: 10 }
            )
          }),
          async (props) => {
            const presentation = {
              title: 'Test',
              slides: props.slides.map((s, i) => ({
                id: `slide-${i}`,
                content: s.content,
                formatting: { fontSize: s.fontSize, color: s.color },
                shapes: []
              }))
            };

            const buffer = await engine.generatePPTX(presentation);
            const imported = await engine.parsePPTX(buffer);

            imported.slides.forEach((slide, i) => {
              expect(slide.content).toBe(props.slides[i].content);
            });
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  // Integration Tests
  describe('Integration Tests with PowerPoint Compatibility', () => {
    it('should generate Office Open XML compliant PPTX', async () => {
      const presentation = {
        title: 'Compliance Test',
        slides: [
          {
            id: '1',
            content: 'Test Slide',
            shapes: [
              { type: 'rectangle', x: 10, y: 10, width: 100, height: 50 }
            ]
          }
        ]
      };

      const buffer = await engine.generatePPTX(presentation);
      const signature = new Uint8Array(buffer, 0, 4);

      // Check for PK (ZIP) signature
      expect(signature[0]).toBe(0x50);
      expect(signature[1]).toBe(0x4b);
    });

    it('should complete full export workflow', async () => {
      const presentation = {
        title: 'Complete Test',
        slides: [
          {
            id: '1',
            content: 'Slide 1',
            transition: { type: 'fade' },
            shapes: []
          },
          {
            id: '2',
            content: 'Slide 2',
            transition: { type: 'wipe' },
            shapes: []
          }
        ]
      };

      const buffer = await engine.generatePPTX(presentation);
      expect(buffer.byteLength).toBeGreaterThan(1000);

      const exported = await engine.parsePPTX(buffer);
      expect(exported.slides.length).toBe(2);

      const filename = engine.generateFilename(presentation);
      expect(filename).toContain('Complete Test');
      expect(filename).toContain('.pptx');
    });
  });
});
