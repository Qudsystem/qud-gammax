import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { BrandingManager } from '../BrandingManager';
import { KVStorageService } from '../../core/services/kvStorage';
import { eventBus } from '../../core/services/eventBus';
import { BrandingPreset, DEFAULT_BRANDING_PRESET } from '../types';

// Mock dependencies
vi.mock('../../core/services/kvStorage');
vi.mock('../../core/services/eventBus');

describe('BrandingManager', () => {
  let manager: BrandingManager;
  let mockStorage: any;
  let mockEventBus: any;

  const mockPreset: BrandingPreset = {
    id: 'preset-1',
    name: 'Test Preset',
    colors: {
      primary: '#000',
      secondary: '#333',
      accent: '#666'
    },
    fonts: {
      heading: { family: 'Arial' },
      body: { family: 'Helvetica' }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockStorage = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn()
    };
    
    mockEventBus = {
      emit: vi.fn()
    };

    (KVStorageService as any).mockImplementation(() => mockStorage);
    (eventBus.emit as Mock) = mockEventBus.emit;

    manager = new BrandingManager();
  });

  describe('createPreset', () => {
    it('should create a new preset', async () => {
      mockStorage.get.mockResolvedValue([]); // No existing presets

      await manager.createPreset(mockPreset);

      expect(mockStorage.set).toHaveBeenCalledWith(
        'branding:presets',
        expect.arrayContaining([expect.objectContaining({ id: mockPreset.id })])
      );
      
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        'branding:change',
        expect.objectContaining({ type: 'preset-created' })
      );
    });
  });

  describe('getPresets', () => {
    it('should return stored presets', async () => {
      mockStorage.get.mockResolvedValue([mockPreset]);
      
      const presets = await manager.getPresets();
      expect(presets).toHaveLength(1);
      expect(presets[0].id).toBe(mockPreset.id);
    });

    it('should return empty array if no presets found', async () => {
      mockStorage.get.mockResolvedValue(null);
      
      const presets = await manager.getPresets();
      expect(presets).toHaveLength(0);
    });
  });

  describe('updatePreset', () => {
    it('should update an existing preset', async () => {
      mockStorage.get.mockResolvedValue([mockPreset]);

      await manager.updatePreset(mockPreset.id, { name: 'Updated Name' });

      expect(mockStorage.set).toHaveBeenCalledWith(
        'branding:presets',
        expect.arrayContaining([expect.objectContaining({ name: 'Updated Name' })])
      );
    });

    it('should throw error if preset not found', async () => {
      mockStorage.get.mockResolvedValue([]);

      await expect(manager.updatePreset('non-existent', {}))
        .rejects.toThrow('Preset not found');
    });
  });

  describe('deletePreset', () => {
    it('should delete a preset', async () => {
      mockStorage.get.mockResolvedValue([mockPreset]);

      await manager.deletePreset(mockPreset.id);

      expect(mockStorage.set).toHaveBeenCalledWith(
        'branding:presets',
        expect.not.arrayContaining([expect.objectContaining({ id: mockPreset.id })])
      );
    });
  });

  describe('validateLogo', () => {
    it('should validate correct logo file', () => {
      const file = new File([''], 'logo.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB

      const result = manager.validateLogo(file);
      expect(result.valid).toBe(true);
    });

    it('should reject large files', () => {
      const file = new File([''], 'logo.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 }); // 6MB

      const result = manager.validateLogo(file);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('File size exceeds 5MB limit');
    });

    it('should reject invalid mime types', () => {
      const file = new File([''], 'logo.txt', { type: 'text/plain' });

      const result = manager.validateLogo(file);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid file format');
    });
  });
});
