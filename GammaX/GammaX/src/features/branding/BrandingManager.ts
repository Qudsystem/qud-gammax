import {
  BrandingPreset,
  BrandingManager as IBrandingManager,
  BrandingError,
  ValidationResult,
  PreviewData,
  BrandingEvent,
  BrandingConfig,
  DEFAULT_BRANDING_CONFIG,
  LOGO_CONSTRAINTS,
  SerializedBrandingPreset
} from './types';
import { kvStorage } from '@/core/services/kvStorage';
import { eventBus } from '@/core/services/eventBus';
import { generateId } from '@/lib/utils';

export class BrandingManager implements IBrandingManager {
  private config: BrandingConfig;
  private presets: Map<string, BrandingPreset> = new Map();
  private loaded = false;

  constructor(config: Partial<BrandingConfig> = {}) {
    this.config = { ...DEFAULT_BRANDING_CONFIG, ...config };
  }

  async createPreset(preset: BrandingPreset): Promise<void> {
    try {
      await this.ensureLoaded();

      // Validate preset
      this.validatePreset(preset);

      // Check if we've reached the maximum number of presets
      if (this.presets.size >= this.config.maxPresets) {
        throw new BrandingError(
          `Maximum number of presets (${this.config.maxPresets}) reached`,
          'MAX_PRESETS_EXCEEDED'
        );
      }

      // Check for duplicate names
      const existingPreset = Array.from(this.presets.values())
        .find(p => p.name.toLowerCase() === preset.name.toLowerCase());
      
      if (existingPreset) {
        throw new BrandingError(
          'A preset with this name already exists',
          'DUPLICATE_NAME',
          preset.id
        );
      }

      // Add timestamps
      const presetWithTimestamps: BrandingPreset = {
        ...preset,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store in memory
      this.presets.set(preset.id, presetWithTimestamps);

      // Save to storage
      await this.savePresets();

      // Emit event
      this.emitEvent({
        type: 'preset-created',
        presetId: preset.id,
        timestamp: new Date()
      });

    } catch (error) {
      throw new BrandingError(
        `Failed to create preset: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CREATE_FAILED',
        preset.id
      );
    }
  }

  async updatePreset(id: string, updates: Partial<BrandingPreset>): Promise<void> {
    try {
      await this.ensureLoaded();

      const existingPreset = this.presets.get(id);
      if (!existingPreset) {
        throw new BrandingError('Preset not found', 'NOT_FOUND', id);
      }

      // Create updated preset
      const updatedPreset: BrandingPreset = {
        ...existingPreset,
        ...updates,
        id, // Ensure ID doesn't change
        updatedAt: new Date()
      };

      // Validate updated preset
      this.validatePreset(updatedPreset);

      // Check for duplicate names (excluding current preset)
      if (updates.name) {
        const duplicatePreset = Array.from(this.presets.values())
          .find(p => p.id !== id && p.name.toLowerCase() === updates.name!.toLowerCase());
        
        if (duplicatePreset) {
          throw new BrandingError(
            'A preset with this name already exists',
            'DUPLICATE_NAME',
            id
          );
        }
      }

      // Update in memory
      this.presets.set(id, updatedPreset);

      // Save to storage
      await this.savePresets();

      // Emit event
      this.emitEvent({
        type: 'preset-updated',
        presetId: id,
        timestamp: new Date()
      });

    } catch (error) {
      throw new BrandingError(
        `Failed to update preset: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UPDATE_FAILED',
        id
      );
    }
  }

  async deletePreset(id: string): Promise<void> {
    try {
      await this.ensureLoaded();

      const preset = this.presets.get(id);
      if (!preset) {
        throw new BrandingError('Preset not found', 'NOT_FOUND', id);
      }

      // Remove from memory
      this.presets.delete(id);

      // Save to storage
      await this.savePresets();

      // Emit event
      this.emitEvent({
        type: 'preset-deleted',
        presetId: id,
        timestamp: new Date()
      });

    } catch (error) {
      throw new BrandingError(
        `Failed to delete preset: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DELETE_FAILED',
        id
      );
    }
  }

  async getPresets(): Promise<BrandingPreset[]> {
    await this.ensureLoaded();
    return Array.from(this.presets.values())
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getPreset(id: string): Promise<BrandingPreset | null> {
    await this.ensureLoaded();
    return this.presets.get(id) || null;
  }

  async applyPreset(presentationId: string, presetId: string): Promise<void> {
    try {
      const preset = await this.getPreset(presetId);
      if (!preset) {
        throw new BrandingError('Preset not found', 'NOT_FOUND', presetId);
      }

      // Get presentation data
      const presentation = await kvStorage.get(`presentation:${presentationId}`);
      if (!presentation) {
        throw new BrandingError('Presentation not found', 'PRESENTATION_NOT_FOUND');
      }

      // Apply branding to all slides
      const updatedSlides = presentation.slides.map((slide: any) => ({
        ...slide,
        branding: {
          presetId,
          colors: preset.colors,
          fonts: preset.fonts,
          logo: preset.logo
        },
        // Update slide background if specified
        background: preset.colors.background ? {
          ...slide.background,
          color: preset.colors.background
        } : slide.background,
        // Update text elements with new colors and fonts
        elements: slide.elements.map((element: any) => {
          if (element.type === 'text') {
            return {
              ...element,
              style: {
                ...element.style,
                color: preset.colors.text || preset.colors.primary,
                fontFamily: element.isHeading ? preset.fonts.heading.family : preset.fonts.body.family,
                fontWeight: element.isHeading ? preset.fonts.heading.weight : preset.fonts.body.weight
              }
            };
          }
          return element;
        })
      }));

      // Save updated presentation
      await kvStorage.set(`presentation:${presentationId}`, {
        ...presentation,
        slides: updatedSlides,
        brandingPresetId: presetId,
        updatedAt: new Date().toISOString()
      });

      // Emit event
      this.emitEvent({
        type: 'preset-applied',
        presetId,
        presentationId,
        timestamp: new Date()
      });

    } catch (error) {
      throw new BrandingError(
        `Failed to apply preset: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'APPLY_FAILED',
        presetId
      );
    }
  }

  previewPreset(preset: BrandingPreset): PreviewData {
    return {
      sampleSlide: {
        title: 'عنوان الشريحة',
        content: 'هذا نص تجريبي لإظهار كيف ستبدو الشريحة مع هذه العلامة التجارية. يمكنك رؤية الألوان والخطوط المطبقة.',
        backgroundColor: preset.colors.background || '#FFFFFF',
        textColor: preset.colors.text || preset.colors.primary,
        accentColor: preset.colors.accent
      },
      colorPalette: [
        preset.colors.primary,
        preset.colors.secondary,
        preset.colors.accent,
        preset.colors.background || '#FFFFFF',
        preset.colors.text || '#000000'
      ],
      fontSamples: [
        {
          family: preset.fonts.heading.family,
          text: 'عنوان رئيسي',
          size: preset.fonts.heading.size || 32,
          weight: preset.fonts.heading.weight || 600
        },
        {
          family: preset.fonts.body.family,
          text: 'نص أساسي للمحتوى',
          size: preset.fonts.body.size || 16,
          weight: preset.fonts.body.weight || 400
        }
      ]
    };
  }

  validateLogo(file: File): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file size
    if (file.size > LOGO_CONSTRAINTS.maxFileSize) {
      errors.push(`حجم الملف يتجاوز الحد الأقصى (${LOGO_CONSTRAINTS.maxFileSize / (1024 * 1024)}MB)`);
    }

    // Check file type
    if (!LOGO_CONSTRAINTS.allowedFormats.includes(file.type)) {
      errors.push('نوع الملف غير مدعوم. الأنواع المدعومة: PNG, JPG, JPEG, SVG');
    }

    // Check file name
    if (file.name.length > 100) {
      warnings.push('اسم الملف طويل جداً');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Private methods

  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      await this.loadPresets();
      this.loaded = true;
    }
  }

  private async loadPresets(): Promise<void> {
    try {
      const stored = await kvStorage.get('branding:presets');
      if (!stored || !Array.isArray(stored)) return;

      this.presets.clear();
      
      stored.forEach((data: SerializedBrandingPreset) => {
        try {
          const preset: BrandingPreset = {
            ...data,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt)
          };
          this.presets.set(preset.id, preset);
        } catch (error) {
          console.error('Failed to deserialize preset:', error);
        }
      });

    } catch (error) {
      console.error('Failed to load presets:', error);
    }
  }

  private async savePresets(): Promise<void> {
    try {
      const serialized: SerializedBrandingPreset[] = Array.from(this.presets.values())
        .map(preset => ({
          version: '1.0' as const,
          ...preset,
          createdAt: preset.createdAt.toISOString(),
          updatedAt: preset.updatedAt.toISOString()
        }));

      await kvStorage.set('branding:presets', serialized);
    } catch (error) {
      throw new BrandingError('Failed to save presets', 'SAVE_FAILED');
    }
  }

  private validatePreset(preset: BrandingPreset): void {
    if (!preset.id) {
      throw new Error('Preset must have an ID');
    }
    if (!preset.name || preset.name.trim().length === 0) {
      throw new Error('Preset must have a name');
    }
    if (preset.name.length > 50) {
      throw new Error('Preset name must be 50 characters or less');
    }
    if (!preset.colors) {
      throw new Error('Preset must have colors');
    }
    if (!preset.colors.primary || !preset.colors.secondary || !preset.colors.accent) {
      throw new Error('Preset must have primary, secondary, and accent colors');
    }
    if (!preset.fonts || !preset.fonts.heading || !preset.fonts.body) {
      throw new Error('Preset must have heading and body fonts');
    }
    if (!preset.fonts.heading.family || !preset.fonts.body.family) {
      throw new Error('Font families must be specified');
    }

    // Validate colors are valid hex codes
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const colors = [preset.colors.primary, preset.colors.secondary, preset.colors.accent];
    if (preset.colors.background) colors.push(preset.colors.background);
    if (preset.colors.text) colors.push(preset.colors.text);

    colors.forEach(color => {
      if (!colorRegex.test(color)) {
        throw new Error(`Invalid color format: ${color}`);
      }
    });

    // Validate logo if present
    if (preset.logo) {
      if (!preset.logo.url) {
        throw new Error('Logo must have a URL');
      }
      if (preset.logo.size < 10 || preset.logo.size > 100) {
        throw new Error('Logo size must be between 10% and 100%');
      }
    }
  }

  private emitEvent(event: BrandingEvent): void {
    eventBus.emit('branding:change', event);
  }

  // Utility methods

  async duplicatePreset(id: string, newName: string): Promise<BrandingPreset> {
    const originalPreset = await this.getPreset(id);
    if (!originalPreset) {
      throw new BrandingError('Preset not found', 'NOT_FOUND', id);
    }

    const duplicatedPreset: BrandingPreset = {
      ...originalPreset,
      id: generateId(),
      name: newName,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.createPreset(duplicatedPreset);
    return duplicatedPreset;
  }

  async exportPreset(id: string): Promise<string> {
    const preset = await this.getPreset(id);
    if (!preset) {
      throw new BrandingError('Preset not found', 'NOT_FOUND', id);
    }

    const serialized: SerializedBrandingPreset = {
      version: '1.0',
      ...preset,
      createdAt: preset.createdAt.toISOString(),
      updatedAt: preset.updatedAt.toISOString()
    };

    return JSON.stringify(serialized, null, 2);
  }

  async importPreset(data: string): Promise<BrandingPreset> {
    try {
      const parsed: SerializedBrandingPreset = JSON.parse(data);
      
      const preset: BrandingPreset = {
        ...parsed,
        id: generateId(), // Generate new ID to avoid conflicts
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.createPreset(preset);
      return preset;

    } catch (error) {
      throw new BrandingError(
        'Failed to import preset: Invalid format',
        'IMPORT_FAILED'
      );
    }
  }
}

// Export singleton instance
export const brandingManager = new BrandingManager();