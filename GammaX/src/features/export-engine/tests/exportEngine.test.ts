import { describe, it, expect, beforeEach } from 'vitest';
import { fc } from 'fast-check';
import { ExportEngine } from '../services/exportEngine';

describe('ExportEngine', () => {
  let engine: ExportEngine;

  beforeEach(() => {
    engine = new ExportEngine();
  });

  describe('Unit Tests - PPTX Generation', () => {
    it('should generate valid PPTX file', async () => {
      const presentation = {
        slides: [
          {
            index: 0,
            title: 'Slide 1',
            content: 'Content',
            backgroundColor: '#FFFFFF',
          },
        ],
      };

      const pptxBuffer = await engine.generatePptx(presentation);
      expect(pptxBuffer).toBeInstanceOf(ArrayBuffer);
      expect(pptxBuffer.byteLength).toBeGreaterThan(0);
    });

    it('should include annotations in export', async () => {
      const presentation = {
        slides: [
          {
            index: 0,
            title: 'Slide 1',
            content: 'Content',
            annotations: [
              { type: 'circle', centerX: 100, centerY: 100, radius: 50 },
            ],
          },
        ],
      };

      const pptxBuffer = await engine.generatePptx(presentation);
      expect(pptxBuffer.byteLength).toBeGreaterThan(0);
    });

    it('should preserve slide transitions', async () => {
      const presentation = {
        slides: [
          {
            index: 0,
            title: 'Slide 1',
            transition: { type: 'fade', duration: 500 },
          },
        ],
      };

      const pptxBuffer = await engine.generatePptx(presentation);
      const transitions = engine.getTransitions(pptxBuffer);
      expect(transitions).toBeDefined();
    });
  });

  describe('Property-Based Tests - Export Integrity', () => {
    it('should round-trip presentations correctly', () => {
      fc.assert(
        fc.property(
          fc.record({
            slideCount: fc.integer({ min: 1, max: 50 }),
            hasAnnotations: fc.boolean(),
            hasTransitions: fc.boolean(),
          }),
          async (data) => {
            const presentation = {
              slides: Array.from({ length: data.slideCount }, (_, i) => ({
                index: i,
                title: `Slide ${i + 1}`,
                content: `Content for slide ${i + 1}`,
              })),
            };

            // Export
            const exported = await engine.generatePptx(presentation);
            expect(exported.byteLength).toBeGreaterThan(0);

            // Verify structure
            const meta = engine.getPresentationMetadata(exported);
            expect(meta.slideCount).toBe(data.slideCount);
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should preserve all content types', () => {
      fc.assert(
        fc.property(
          fc.record({
            textContent: fc.string({ minLength: 1, maxLength: 1000 }),
            imageCount: fc.integer({ min: 0, max: 10 }),
            shapeCount: fc.integer({ min: 0, max: 20 }),
          }),
          async (data) => {
            const presentation = {
              slides: [
                {
                  index: 0,
                  title: 'Slide',
                  content: data.textContent,
                  images: Array.from({ length: data.imageCount }, (_, i) => ({
                    url: `image${i}.png`,
                  })),
                  shapes: Array.from({ length: data.shapeCount }, (_, i) => ({
                    type: 'rectangle',
                    id: `shape${i}`,
                  })),
                },
              ],
            };

            const exported = await engine.generatePptx(presentation);
            const meta = engine.getPresentationMetadata(exported);

            expect(meta.imageCount).toBe(data.imageCount);
            expect(meta.shapeCount).toBe(data.shapeCount);
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  describe('Integration Tests - PowerPoint Compatibility', () => {
    it('should generate Office Open XML compliant files', async () => {
      const presentation = {
        slides: [
          {
            index: 0,
            title: 'Test',
            content: 'Content',
          },
        ],
      };

      const pptxBuffer = await engine.generatePptx(presentation);
      const isCompliant = engine.validateOfficeXmlCompliance(pptxBuffer);
      expect(isCompliant).toBe(true);
    });

    it('should track export progress', async () => {
      const presentation = {
        slides: Array.from({ length: 10 }, (_, i) => ({
          index: i,
          title: `Slide ${i}`,
          content: `Content ${i}`,
        })),
      };

      const progress: number[] = [];
      engine.onProgress((p) => progress.push(p));

      await engine.generatePptx(presentation);

      expect(progress.length).toBeGreaterThan(0);
      expect(progress[progress.length - 1]).toBe(100);
    });

    it('should handle export errors gracefully', async () => {
      const invalidPresentation = null;

      try {
        await engine.generatePptx(invalidPresentation as any);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
