import { describe, it, expect, beforeEach } from 'vitest';
import { BrandingManager } from '../manager';
import { BrandingPreset } from '../types';
import fc from 'fast-check';

describe('Branding Manager', () => {
  let manager: BrandingManager;

  beforeEach(() => {
    manager = new BrandingManager();
  });

  // Unit Tests
  describe('Unit Tests for Preset Management', () => {
    it('should create branding preset', () => {
      const preset: BrandingPreset = {
        id: 'preset-1',
        name: 'Tech Brand',
        colors: {
          primary: '#0066CC',
          secondary: '#FF6600',
          accent: '#00CC99'
        },
        fonts: {
          heading: 'Arial',
          body: 'Helvetica'
        },
        logo: { data: 'base64data', size: 50000 }
      };

      manager.createPreset(preset);
      const retrieved = manager.getPreset('preset-1');

      expect(retrieved).toBeDefined();
      expect(retrieved.name).toBe('Tech Brand');
    });

    it('should validate logo file size', () => {
      const largeImage = {
        data: 'x'.repeat(6 * 1024 * 1024), // 6MB
        size: 6 * 1024 * 1024
      };

      expect(() =>
        manager.validateLogo(largeImage)
      ).toThrow('Logo exceeds 5MB limit');
    });

    it('should update preset', () => {
      const preset: BrandingPreset = {
        id: 'preset-1',
        name: 'Old Name',
        colors: { primary: '#0066CC', secondary: '#FF6600', accent: '#00CC99' },
        fonts: { heading: 'Arial', body: 'Helvetica' }
      };

      manager.createPreset(preset);
      manager.updatePreset('preset-1', { name: 'New Name' });

      const updated = manager.getPreset('preset-1');
      expect(updated.name).toBe('New Name');
    });

    it('should delete preset', () => {
      const preset: BrandingPreset = {
        id: 'preset-1',
        name: 'Tech Brand',
        colors: { primary: '#0066CC', secondary: '#FF6600', accent: '#00CC99' },
        fonts: { heading: 'Arial', body: 'Helvetica' }
      };

      manager.createPreset(preset);
      manager.deletePreset('preset-1');

      expect(() => manager.getPreset('preset-1')).toThrow();
    });
  });

  // Property-based Tests
  describe('Property-based Tests for Preset Serialization', () => {
    it('should preserve preset data through serialization', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 100 }),
            primary: fc.hexColor(),
            secondary: fc.hexColor(),
            accent: fc.hexColor()
          }),
          (props) => {
            const preset: BrandingPreset = {
              id: 'test-preset',
              name: props.name,
              colors: {
                primary: props.primary,
                secondary: props.secondary,
                accent: props.accent
              },
              fonts: { heading: 'Arial', body: 'Helvetica' }
            };

            const serialized = manager.serialize(preset);
            const deserialized = manager.deserialize(serialized);

            expect(deserialized.name).toBe(props.name);
            expect(deserialized.colors.primary).toBe(props.primary);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain color consistency in presets', () => {
      fc.assert(
        fc.property(
          fc.array(fc.hexColor(), { minLength: 1, maxLength: 10 }),
          (colors) => {
            const presets = colors.map((color, i) => ({
              id: `preset-${i}`,
              name: `Preset ${i}`,
              colors: {
                primary: color,
                secondary: colors[(i + 1) % colors.length],
                accent: colors[(i + 2) % colors.length]
              },
              fonts: { heading: 'Arial', body: 'Helvetica' }
            }));

            presets.forEach(p => manager.createPreset(p));

            presets.forEach((p, i) => {
              const retrieved = manager.getPreset(`preset-${i}`);
              expect(retrieved.colors.primary).toBe(p.colors.primary);
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  // Branding Application Tests
  describe('Property-based Tests for Branding Application', () => {
    it('should apply branding consistently across presentations', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          (slideCount) => {
            const preset: BrandingPreset = {
              id: 'brand-1',
              name: 'Test Brand',
              colors: {
                primary: '#0066CC',
                secondary: '#FF6600',
                accent: '#00CC99'
              },
              fonts: { heading: 'Arial', body: 'Helvetica' }
            };

            manager.createPreset(preset);

            const result = manager.applyBranding(
              { slides: Array(slideCount).fill({}) },
              'brand-1'
            );

            expect(result.slides.length).toBe(slideCount);
            result.slides.forEach(slide => {
              expect(slide.branding).toBeDefined();
              expect(slide.branding.colors.primary).toBe('#0066CC');
            });
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  // Integration Tests
  describe('Integration Tests for Complete Branding Workflow', () => {
    it('should handle complete branding workflow', () => {
      // Create preset
      const preset: BrandingPreset = {
        id: 'brand-1',
        name: 'Corporate Brand',
        colors: {
          primary: '#0066CC',
          secondary: '#FF6600',
          accent: '#00CC99'
        },
        fonts: {
          heading: 'Arial',
          body: 'Helvetica'
        },
        logo: { data: 'logodata', size: 50000 }
      };

      manager.createPreset(preset);

      // Apply to presentation
      const presentation = {
        id: 'pres-1',
        slides: [
          { id: 'slide-1', content: 'Slide 1' },
          { id: 'slide-2', content: 'Slide 2' },
          { id: 'slide-3', content: 'Slide 3' }
        ]
      };

      const branded = manager.applyBranding(presentation, 'brand-1');
      expect(branded.slides.length).toBe(3);

      // Export with branding
      const exported = manager.export(branded);
      expect(exported).toBeDefined();

      branded.slides.forEach(slide => {
        expect(slide.branding).toBeDefined();
        expect(slide.branding.colors.primary).toBe('#0066CC');
      });
    });
  });
});
