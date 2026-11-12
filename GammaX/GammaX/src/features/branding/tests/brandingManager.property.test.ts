import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { BrandingManager } from '../BrandingManager';
import { KVStorageService } from '../../core/services/kvStorage';
import { eventBus } from '../../core/services/eventBus';

vi.mock('../../core/services/kvStorage');
vi.mock('../../core/services/eventBus');

describe('BrandingManager Property Tests', () => {
  let manager: BrandingManager;

  const colorArb = fc.hexColor();
  const fontArb = fc.record({
    family: fc.string({ minLength: 1 }),
    weight: fc.oneof(fc.constant(undefined), fc.integer({ min: 100, max: 900 })),
    size: fc.oneof(fc.constant(undefined), fc.integer({ min: 8, max: 72 }))
  });

  const presetArb = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    colors: fc.record({
      primary: colorArb,
      secondary: colorArb,
      accent: colorArb,
      background: fc.oneof(fc.constant(undefined), colorArb),
      text: fc.oneof(fc.constant(undefined), colorArb)
    }),
    fonts: fc.record({
      heading: fontArb,
      body: fontArb
    }),
    createdAt: fc.date(),
    updatedAt: fc.date()
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (KVStorageService as any).mockImplementation(() => ({
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn()
    }));
    (eventBus.emit as any) = vi.fn();
    manager = new BrandingManager();
  });

  it('should always generate valid preview data from any preset', () => {
    fc.assert(
      fc.property(presetArb, (preset) => {
        const preview = manager.previewPreset(preset);
        
        expect(preview).toBeDefined();
        expect(preview.sampleSlide).toBeDefined();
        expect(preview.colorPalette).toHaveLength(5); // Primary, Secondary, Accent, Background, Text
        expect(preview.fontSamples).toHaveLength(2); // Heading, Body
        
        // Ensure colors are passed correctly
        expect(preview.sampleSlide.backgroundColor).toBe(preset.colors.background || '#FFFFFF');
        expect(preview.sampleSlide.accentColor).toBe(preset.colors.accent);
      })
    );
  });
});
