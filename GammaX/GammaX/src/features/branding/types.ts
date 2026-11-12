// Branding Types
export interface LogoData {
  url: string;
  width: number;
  height: number;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size: number; // percentage (10-100)
}

export interface BrandingColors {
  primary: string;
  secondary: string;
  accent: string;
  background?: string;
  text?: string;
}

export interface FontConfig {
  family: string;
  weight?: number;
  size?: number;
}

export interface BrandingFonts {
  heading: FontConfig;
  body: FontConfig;
}

export interface BrandingPreset {
  id: string;
  name: string;
  companyName?: string;
  logo?: LogoData;
  colors: BrandingColors;
  fonts: BrandingFonts;
  createdAt: Date;
  updatedAt: Date;
}

export interface PreviewData {
  sampleSlide: SlidePreview;
  colorPalette: string[];
  fontSamples: FontSample[];
}

export interface SlidePreview {
  title: string;
  content: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

export interface FontSample {
  family: string;
  text: string;
  size: number;
  weight: number;
}

// Branding Manager Interface
export interface BrandingManager {
  createPreset(preset: BrandingPreset): Promise<void>;
  updatePreset(id: string, updates: Partial<BrandingPreset>): Promise<void>;
  deletePreset(id: string): Promise<void>;
  getPresets(): Promise<BrandingPreset[]>;
  getPreset(id: string): Promise<BrandingPreset | null>;
  applyPreset(presentationId: string, presetId: string): Promise<void>;
  previewPreset(preset: BrandingPreset): PreviewData;
  validateLogo(file: File): ValidationResult;
}

// Validation
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Error types
export class BrandingError extends Error {
  constructor(
    message: string,
    public code: string,
    public presetId?: string
  ) {
    super(message);
    this.name = 'BrandingError';
  }
}

// Predefined color palettes
export const COLOR_PALETTES = [
  {
    name: 'Corporate Blue',
    colors: {
      primary: '#1E40AF',
      secondary: '#3B82F6',
      accent: '#60A5FA',
      background: '#F8FAFC',
      text: '#1E293B'
    }
  },
  {
    name: 'Modern Purple',
    colors: {
      primary: '#7C3AED',
      secondary: '#A855F7',
      accent: '#C084FC',
      background: '#FAFAFA',
      text: '#374151'
    }
  },
  {
    name: 'Professional Green',
    colors: {
      primary: '#059669',
      secondary: '#10B981',
      accent: '#34D399',
      background: '#F9FAFB',
      text: '#111827'
    }
  },
  {
    name: 'Creative Orange',
    colors: {
      primary: '#EA580C',
      secondary: '#FB923C',
      accent: '#FDBA74',
      background: '#FFFBEB',
      text: '#92400E'
    }
  },
  {
    name: 'Tech Gray',
    colors: {
      primary: '#374151',
      secondary: '#6B7280',
      accent: '#9CA3AF',
      background: '#F9FAFB',
      text: '#111827'
    }
  },
  {
    name: 'Elegant Black',
    colors: {
      primary: '#000000',
      secondary: '#374151',
      accent: '#6B7280',
      background: '#FFFFFF',
      text: '#111827'
    }
  },
  {
    name: 'Vibrant Red',
    colors: {
      primary: '#DC2626',
      secondary: '#EF4444',
      accent: '#F87171',
      background: '#FEF2F2',
      text: '#7F1D1D'
    }
  },
  {
    name: 'Ocean Teal',
    colors: {
      primary: '#0D9488',
      secondary: '#14B8A6',
      accent: '#5EEAD4',
      background: '#F0FDFA',
      text: '#134E4A'
    }
  }
];

// Available fonts
export const AVAILABLE_FONTS = [
  { family: 'Inter', category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  { family: 'Roboto', category: 'sans-serif', weights: [300, 400, 500, 700] },
  { family: 'Open Sans', category: 'sans-serif', weights: [300, 400, 600, 700] },
  { family: 'Lato', category: 'sans-serif', weights: [300, 400, 700] },
  { family: 'Montserrat', category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  { family: 'Poppins', category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  { family: 'Source Sans Pro', category: 'sans-serif', weights: [300, 400, 600, 700] },
  { family: 'Nunito', category: 'sans-serif', weights: [300, 400, 600, 700] },
  { family: 'Raleway', category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  { family: 'Ubuntu', category: 'sans-serif', weights: [300, 400, 500, 700] },
  { family: 'Playfair Display', category: 'serif', weights: [400, 500, 600, 700] },
  { family: 'Merriweather', category: 'serif', weights: [300, 400, 700] },
  { family: 'Lora', category: 'serif', weights: [400, 500, 600, 700] },
  { family: 'PT Serif', category: 'serif', weights: [400, 700] },
  { family: 'Crimson Text', category: 'serif', weights: [400, 600, 700] },
  { family: 'Fira Code', category: 'monospace', weights: [300, 400, 500, 600, 700] },
  { family: 'Source Code Pro', category: 'monospace', weights: [300, 400, 500, 600, 700] },
  { family: 'JetBrains Mono', category: 'monospace', weights: [300, 400, 500, 600, 700] },
  { family: 'Inconsolata', category: 'monospace', weights: [400, 700] },
  { family: 'Space Mono', category: 'monospace', weights: [400, 700] }
];

// Default branding preset
export const DEFAULT_BRANDING_PRESET: Omit<BrandingPreset, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Default',
  colors: {
    primary: '#1E40AF',
    secondary: '#3B82F6',
    accent: '#60A5FA',
    background: '#FFFFFF',
    text: '#1E293B'
  },
  fonts: {
    heading: {
      family: 'Inter',
      weight: 600,
      size: 32
    },
    body: {
      family: 'Inter',
      weight: 400,
      size: 16
    }
  }
};

// Logo validation constraints
export const LOGO_CONSTRAINTS = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFormats: ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'],
  maxWidth: 2000,
  maxHeight: 2000,
  minWidth: 50,
  minHeight: 50
};

// Configuration
export interface BrandingConfig {
  maxPresets: number;
  autoApplyToNewSlides: boolean;
  preserveCustomColors: boolean;
  enableLogoPositioning: boolean;
}

export const DEFAULT_BRANDING_CONFIG: BrandingConfig = {
  maxPresets: 20,
  autoApplyToNewSlides: true,
  preserveCustomColors: false,
  enableLogoPositioning: true
};

// Events
export interface BrandingEvent {
  type: 'preset-created' | 'preset-updated' | 'preset-deleted' | 'preset-applied';
  presetId: string;
  presentationId?: string;
  timestamp: Date;
}

// Serialization format
export interface SerializedBrandingPreset {
  version: '1.0';
  id: string;
  name: string;
  companyName?: string;
  logo?: {
    url: string;
    width: number;
    height: number;
    position: string;
    size: number;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background?: string;
    text?: string;
  };
  fonts: {
    heading: {
      family: string;
      weight?: number;
      size?: number;
    };
    body: {
      family: string;
      weight?: number;
      size?: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}