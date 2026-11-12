import { describe, it, expect, beforeEach } from 'vitest';
import { fc } from 'fast-check';
import { BrandingManager } from '../services/brandingManager';
import { BrandingPreset } from '../types';

describe('BrandingManager', () => {
  let manager: BrandingManager;

  beforeEach(() => {
    manager = new BrandingManager();
  });

  describe('Unit Tests - Preset Management', () => {
    it('should create a new branding preset', () => {
      const preset: BrandingPreset = {
        id: '1',
        name: 'Corporate Brand',
        primaryColor: '#0066CC',
        secondaryColor: '#F0F0F0',
        fontFamily: 'Arial',
        logoUrl: 'https://example.com/logo.png',
        createdAt: new Date(),
      };

      manager.addPreset(preset);
      expect(manager.getPreset('1')).toEqual(preset);
    });

    it('should list all presets', () => {
      const presets: BrandingPreset[] = [
        {
          id: '1',
          name: 'Corporate',
          primaryColor: '#0066CC',
          secondaryColor: '#F0F0F0',
          fontFamily: 'Arial',
          createdAt: new Date(),
        },
        {
          id: '2',
          name: 'Creative',
          primaryColor: '#FF6600',
          secondaryColor: '#FFFFFF',
          fontFamily: 'Helvetica',
          createdAt: new Date(),
        },
      ];

      presets.forEach((p) => manager.addPreset(p));
      expect(manager.getAllPresets().length).toBe(2);
    });

    it('should update a preset', () => {
      const preset: BrandingPreset = {
        id: '1',
        name: 'Original',
        primaryColor: '#0066CC',
        secondaryColor: '#F0F0F0',
        fontFamily: 'Arial',
        createdAt: new Date(),
      };

      manager.addPreset(preset);
      manager.updatePreset('1', { ...preset, primaryColor: '#FF0000' });
      expect(manager.getPreset('1')?.primaryColor).toBe('#FF0000');
    });

    it('should delete a preset', () => {
      const preset: BrandingPreset = {
        id: '1',
        name: 'Temporary',
        primaryColor: '#0066CC',
        secondaryColor: '#F0F0F0',
        fontFamily: 'Arial',
        createdAt: new Date(),
      };

      manager.addPreset(preset);
      manager.deletePreset('1');
      expect(manager.getPreset('1')).toBeUndefined();
    });
  });

  describe('Property-Based Tests - Serialization', () => {
    it('should preserve presets through serialization', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            primaryColor: fc.hexColor(),
            secondaryColor: fc.hexColor(),
            fontFamily: fc.oneof(
              fc.constant('Arial'),
              fc.constant('Helvetica'),
              fc.constant('Times New Roman')
            ),
          }),
          (data) => {
            const preset: BrandingPreset = {
              ...data,
              createdAt: new Date(),
            };

            manager.addPreset(preset);
            const serialized = manager.serialize();
            manager.clear();
            manager.deserialize(serialized);

            const retrieved = manager.getPreset(data.id);
            expect(retrieved).toBeDefined();
            expect(retrieved?.name).toBe(data.name);
            expect(retrieved?.primaryColor).toBe(data.primaryColor);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Integration Tests - Branding Application', () => {
    it('should apply branding to a presentation', () => {
      const preset: BrandingPreset = {
        id: '1',
        name: 'Test Brand',
        primaryColor: '#0066CC',
        secondaryColor: '#F0F0F0',
        fontFamily: 'Arial',
        createdAt: new Date(),
      };

      manager.addPreset(preset);
      const result = manager.applyBrandingToPresentation('pres-1', '1');
      expect(result).toBe(true);
    });

    it('should apply branding to specific slides', () => {
      const preset: BrandingPreset = {
        id: '1',
        name: 'Test Brand',
        primaryColor: '#0066CC',
        secondaryColor: '#F0F0F0',
        fontFamily: 'Arial',
        createdAt: new Date(),
      };

      manager.addPreset(preset);
      const result = manager.applyBrandingToSlides('pres-1', [0, 1, 2], '1');
      expect(result).toBe(true);
    });

    it('should generate preview of branding', () => {
      const preset: BrandingPreset = {
        id: '1',
        name: 'Test Brand',
        primaryColor: '#0066CC',
        secondaryColor: '#F0F0F0',
        fontFamily: 'Arial',
        createdAt: new Date(),
      };

      manager.addPreset(preset);
      const preview = manager.generatePreview('1');
      expect(preview).toBeDefined();
      expect(preview.primaryColor).toBe('#0066CC');
    });
  });
});
