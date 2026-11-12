import { PresentationStyle, StyleConfig } from './types'

export const allStyleConfigs: Record<PresentationStyle, StyleConfig> = {
  minimal: {
    name: 'Minimal',
    description: 'Clean and simple with plenty of white space',
    category: 'classic',
    colors: {
      primary: 'oklch(0.25 0.08 280)',
      secondary: 'oklch(0.94 0.04 280)',
      accent: 'oklch(0.70 0.18 220)',
      background: 'oklch(1 0 0)',
      text: 'oklch(0.20 0.02 280)'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    }
  },
  bold: {
    name: 'Bold',
    description: 'High contrast with vibrant colors',
    category: 'modern',
    colors: {
      primary: 'oklch(0.35 0.25 290)',
      secondary: 'oklch(0.90 0.08 290)',
      accent: 'oklch(0.65 0.25 340)',
      background: 'oklch(0.98 0.01 290)',
      text: 'oklch(0.15 0.03 290)'
    },
    fonts: {
      heading: 'Outfit',
      body: 'Inter'
    },
    effects: {
      shadow: true
    }
  },
  professional: {
    name: 'Professional',
    description: 'Corporate and polished',
    category: 'industry',
    colors: {
      primary: 'oklch(0.30 0.05 240)',
      secondary: 'oklch(0.95 0.02 240)',
      accent: 'oklch(0.55 0.15 200)',
      background: 'oklch(0.99 0 0)',
      text: 'oklch(0.25 0.02 240)'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    }
  },
  creative: {
    name: 'Creative',
    description: 'Playful with gradient accents',
    category: 'modern',
    colors: {
      primary: 'oklch(0.50 0.22 310)',
      secondary: 'oklch(0.92 0.06 310)',
      accent: 'oklch(0.60 0.20 60)',
      background: 'oklch(0.97 0.03 310)',
      text: 'oklch(0.20 0.05 310)'
    },
    fonts: {
      heading: 'Outfit',
      body: 'Inter'
    },
    effects: {
      gradient: true
    }
  },
  elegant: {
    name: 'Elegant',
    description: 'Sophisticated and refined',
    category: 'classic',
    colors: {
      primary: 'oklch(0.28 0.06 260)',
      secondary: 'oklch(0.96 0.01 260)',
      accent: 'oklch(0.58 0.14 320)',
      background: 'oklch(0.98 0.005 260)',
      text: 'oklch(0.22 0.03 260)'
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter'
    },
    effects: {
      shadow: true
    }
  },
  modern: {
    name: 'Modern',
    description: 'Contemporary and sleek',
    category: 'modern',
    colors: {
      primary: 'oklch(0.45 0.20 250)',
      secondary: 'oklch(0.93 0.04 250)',
      accent: 'oklch(0.62 0.22 180)',
      background: 'oklch(0.96 0.02 250)',
      text: 'oklch(0.18 0.04 250)'
    },
    fonts: {
      heading: 'Space Grotesk',
      body: 'Inter'
    },
    effects: {
      blur: true
    }
  },
  vintage: {
    name: 'Vintage',
    description: 'Classic retro aesthetic',
    category: 'theme',
    colors: {
      primary: 'oklch(0.42 0.12 40)',
      secondary: 'oklch(0.88 0.06 40)',
      accent: 'oklch(0.55 0.18 25)',
      background: 'oklch(0.94 0.03 40)',
      text: 'oklch(0.30 0.05 40)'
    },
    fonts: {
      heading: 'Crimson Pro',
      body: 'Crimson Pro'
    },
    effects: {
      texture: true
    }
  },
  neon: {
    name: 'Neon',
    description: 'Vibrant glowing effects',
    category: 'modern',
    colors: {
      primary: 'oklch(0.65 0.30 330)',
      secondary: 'oklch(0.15 0.08 280)',
      accent: 'oklch(0.70 0.32 150)',
      background: 'oklch(0.12 0.05 280)',
      text: 'oklch(0.95 0.02 330)'
    },
    fonts: {
      heading: 'Outfit',
      body: 'Inter'
    },
    effects: {
      shadow: true,
      gradient: true
    }
  },
  dark: {
    name: 'Dark',
    description: 'Sleek dark theme',
    category: 'classic',
    colors: {
      primary: 'oklch(0.85 0.15 270)',
      secondary: 'oklch(0.25 0.03 270)',
      accent: 'oklch(0.75 0.25 200)',
      background: 'oklch(0.15 0.02 270)',
      text: 'oklch(0.92 0.01 270)'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    }
  },
  light: {
    name: 'Light',
    description: 'Bright and airy',
    category: 'classic',
    colors: {
      primary: 'oklch(0.35 0.12 240)',
      secondary: 'oklch(0.98 0.005 240)',
      accent: 'oklch(0.60 0.18 200)',
      background: 'oklch(1 0 0)',
      text: 'oklch(0.20 0.02 240)'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    }
  },
  gradient: {
    name: 'Gradient',
    description: 'Smooth color transitions',
    category: 'design-system',
    colors: {
      primary: 'oklch(0.55 0.25 280)',
      secondary: 'oklch(0.45 0.22 320)',
      accent: 'oklch(0.65 0.28 200)',
      background: 'oklch(0.96 0.03 300)',
      text: 'oklch(0.18 0.04 280)'
    },
    fonts: {
      heading: 'Outfit',
      body: 'Inter'
    },
    effects: {
      gradient: true,
      blur: true
    }
  },
  monochrome: {
    name: 'Monochrome',
    description: 'Black and white simplicity',
    category: 'design-system',
    colors: {
      primary: 'oklch(0.20 0 0)',
      secondary: 'oklch(0.95 0 0)',
      accent: 'oklch(0.50 0 0)',
      background: 'oklch(1 0 0)',
      text: 'oklch(0.15 0 0)'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    }
  },
  pastel: {
    name: 'Pastel',
    description: 'Soft and dreamy colors',
    category: 'theme',
    colors: {
      primary: 'oklch(0.75 0.10 320)',
      secondary: 'oklch(0.92 0.06 280)',
      accent: 'oklch(0.78 0.12 200)',
      background: 'oklch(0.97 0.03 300)',
      text: 'oklch(0.35 0.05 320)'
    },
    fonts: {
      heading: 'Outfit',
      body: 'Inter'
    }
  },
  vibrant: {
    name: 'Vibrant',
    description: 'Bold and energetic',
    category: 'modern',
    colors: {
      primary: 'oklch(0.60 0.28 30)',
      secondary: 'oklch(0.55 0.30 280)',
      accent: 'oklch(0.65 0.32 150)',
      background: 'oklch(0.95 0.04 30)',
      text: 'oklch(0.18 0.05 30)'
    },
    fonts: {
      heading: 'Outfit',
      body: 'Inter'
    },
    effects: {
      shadow: true
    }
  },
  earth: {
    name: 'Earth',
    description: 'Natural earthy tones',
    category: 'theme',
    colors: {
      primary: 'oklch(0.45 0.12 80)',
      secondary: 'oklch(0.88 0.06 60)',
      accent: 'oklch(0.52 0.15 40)',
      background: 'oklch(0.94 0.03 70)',
      text: 'oklch(0.28 0.06 80)'
    },
    fonts: {
      heading: 'Crimson Pro',
      body: 'Inter'
    }
  },
  ocean: {
    name: 'Ocean',
    description: 'Cool blue water tones',
    category: 'theme',
    colors: {
      primary: 'oklch(0.50 0.18 230)',
      secondary: 'oklch(0.90 0.08 220)',
      accent: 'oklch(0.65 0.22 200)',
      background: 'oklch(0.96 0.03 230)',
      text: 'oklch(0.22 0.06 230)'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    }
  },
  sunset: {
    name: 'Sunset',
    description: 'Warm orange and pink hues',
    category: 'theme',
    colors: {
      primary: 'oklch(0.62 0.22 40)',
      secondary: 'oklch(0.55 0.25 350)',
      accent: 'oklch(0.68 0.28 20)',
      background: 'oklch(0.95 0.04 30)',
      text: 'oklch(0.25 0.05 40)'
    },
    fonts: {
      heading: 'Outfit',
      body: 'Inter'
    },
    effects: {
      gradient: true
    }
  },
  forest: {
    name: 'Forest',
    description: 'Deep green nature vibes',
    category: 'theme',
    colors: {
      primary: 'oklch(0.42 0.14 150)',
      secondary: 'oklch(0.88 0.08 140)',
      accent: 'oklch(0.60 0.18 120)',
      background: 'oklch(0.94 0.04 150)',
      text: 'oklch(0.25 0.06 150)'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    }
  },
  corporate: {
    name: 'Corporate',
    description: 'Professional business theme',
    category: 'industry',
    colors: {
      primary: 'oklch(0.32 0.08 240)',
      secondary: 'oklch(0.96 0.02 240)',
      accent: 'oklch(0.58 0.16 210)',
      background: 'oklch(0.99 0 0)',
      text: 'oklch(0.24 0.03 240)'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    }
  },
  startup: {
    name: 'Startup',
    description: 'Dynamic and innovative',
    category: 'industry',
    colors: {
      primary: 'oklch(0.55 0.24 280)',
      secondary: 'oklch(0.92 0.06 280)',
      accent: 'oklch(0.65 0.26 320)',
      background: 'oklch(0.97 0.03 280)',
      text: 'oklch(0.20 0.05 280)'
    },
    fonts: {
      heading: 'Space Grotesk',
      body: 'Inter'
    },
    effects: {
      gradient: true
    }
  },
  academic: {
    name: 'Academic',
    description: 'Scholarly and refined',
    category: 'industry',
    colors: {
      primary: 'oklch(0.35 0.06 250)',
      secondary: 'oklch(0.94 0.02 250)',
      accent: 'oklch(0.52 0.14 230)',
      background: 'oklch(0.98 0.01 250)',
      text: 'oklch(0.26 0.03 250)'
    },
    fonts: {
      heading: 'Crimson Pro',
      body: 'Crimson Pro'
    }
  },
  artistic: {
    name: 'Artistic',
    description: 'Creative and expressive',
    category: 'industry',
    colors: {
      primary: 'oklch(0.58 0.26 340)',
      secondary: 'oklch(0.48 0.24 60)',
      accent: 'oklch(0.65 0.28 200)',
      background: 'oklch(0.95 0.05 340)',
      text: 'oklch(0.22 0.06 340)'
    },
    fonts: {
      heading: 'Bricolage Grotesque',
      body: 'Inter'
    },
    effects: {
      gradient: true,
      texture: true
    }
  },
  tech: {
    name: 'Tech',
    description: 'Modern technology aesthetic',
    category: 'industry',
    colors: {
      primary: 'oklch(0.48 0.22 260)',
      secondary: 'oklch(0.18 0.05 260)',
      accent: 'oklch(0.62 0.26 180)',
      background: 'oklch(0.14 0.03 260)',
      text: 'oklch(0.92 0.02 260)'
    },
    fonts: {
      heading: 'JetBrains Mono',
      body: 'Inter'
    },
    effects: {
      shadow: true,
      blur: true
    }
  },
  medical: {
    name: 'Medical',
    description: 'Clean healthcare theme',
    category: 'industry',
    colors: {
      primary: 'oklch(0.52 0.18 200)',
      secondary: 'oklch(0.95 0.03 200)',
      accent: 'oklch(0.60 0.20 160)',
      background: 'oklch(0.98 0.01 200)',
      text: 'oklch(0.26 0.04 200)'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    }
  },
  finance: {
    name: 'Finance',
    description: 'Trust and stability',
    category: 'industry',
    colors: {
      primary: 'oklch(0.38 0.10 240)',
      secondary: 'oklch(0.94 0.02 240)',
      accent: 'oklch(0.55 0.16 140)',
      background: 'oklch(0.98 0.01 240)',
      text: 'oklch(0.28 0.04 240)'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    }
  },
  education: {
    name: 'Education',
    description: 'Friendly learning environment',
    category: 'industry',
    colors: {
      primary: 'oklch(0.55 0.20 30)',
      secondary: 'oklch(0.92 0.06 30)',
      accent: 'oklch(0.62 0.24 200)',
      background: 'oklch(0.96 0.03 30)',
      text: 'oklch(0.24 0.05 30)'
    },
    fonts: {
      heading: 'Outfit',
      body: 'Inter'
    }
  },
  marketing: {
    name: 'Marketing',
    description: 'Eye-catching and persuasive',
    category: 'industry',
    colors: {
      primary: 'oklch(0.60 0.26 350)',
      secondary: 'oklch(0.90 0.08 350)',
      accent: 'oklch(0.68 0.30 280)',
      background: 'oklch(0.94 0.04 350)',
      text: 'oklch(0.20 0.06 350)'
    },
    fonts: {
      heading: 'Outfit',
      body: 'Inter'
    },
    effects: {
      gradient: true,
      shadow: true
    }
  },
  legal: {
    name: 'Legal',
    description: 'Professional and authoritative',
    category: 'industry',
    colors: {
      primary: 'oklch(0.30 0.04 240)',
      secondary: 'oklch(0.96 0.01 240)',
      accent: 'oklch(0.48 0.12 220)',
      background: 'oklch(0.99 0 0)',
      text: 'oklch(0.26 0.02 240)'
    },
    fonts: {
      heading: 'Crimson Pro',
      body: 'Crimson Pro'
    }
  },
  'real-estate': {
    name: 'Real Estate',
    description: 'Luxury and sophistication',
    category: 'industry',
    colors: {
      primary: 'oklch(0.42 0.10 60)',
      secondary: 'oklch(0.92 0.04 60)',
      accent: 'oklch(0.58 0.16 40)',
      background: 'oklch(0.96 0.02 60)',
      text: 'oklch(0.28 0.05 60)'
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter'
    }
  },
  fashion: {
    name: 'Fashion',
    description: 'Stylish and trendy',
    category: 'industry',
    colors: {
      primary: 'oklch(0.22 0.05 320)',
      secondary: 'oklch(0.94 0.03 320)',
      accent: 'oklch(0.65 0.24 340)',
      background: 'oklch(0.98 0.01 320)',
      text: 'oklch(0.18 0.04 320)'
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter'
    },
    effects: {
      shadow: true
    }
  },
  food: {
    name: 'Food',
    description: 'Appetizing and warm',
    category: 'industry',
    colors: {
      primary: 'oklch(0.58 0.20 40)',
      secondary: 'oklch(0.90 0.08 40)',
      accent: 'oklch(0.65 0.24 20)',
      background: 'oklch(0.95 0.04 40)',
      text: 'oklch(0.26 0.06 40)'
    },
    fonts: {
      heading: 'Outfit',
      body: 'Inter'
    }
  },
  travel: {
    name: 'Travel',
    description: 'Adventurous and inviting',
    category: 'industry',
    colors: {
      primary: 'oklch(0.52 0.22 220)',
      secondary: 'oklch(0.88 0.08 220)',
      accent: 'oklch(0.62 0.26 30)',
      background: 'oklch(0.94 0.04 220)',
      text: 'oklch(0.24 0.06 220)'
    },
    fonts: {
      heading: 'Outfit',
      body: 'Inter'
    }
  },
  sports: {
    name: 'Sports',
    description: 'Dynamic and energetic',
    category: 'industry',
    colors: {
      primary: 'oklch(0.55 0.26 20)',
      secondary: 'oklch(0.16 0.06 260)',
      accent: 'oklch(0.68 0.30 140)',
      background: 'oklch(0.14 0.04 260)',
      text: 'oklch(0.94 0.02 20)'
    },
    fonts: {
      heading: 'Outfit',
      body: 'Inter'
    },
    effects: {
      shadow: true
    }
  },
  music: {
    name: 'Music',
    description: 'Rhythmic and vibrant',
    category: 'industry',
    colors: {
      primary: 'oklch(0.62 0.28 310)',
      secondary: 'oklch(0.18 0.08 280)',
      accent: 'oklch(0.70 0.32 180)',
      background: 'oklch(0.12 0.05 280)',
      text: 'oklch(0.95 0.02 310)'
    },
    fonts: {
      heading: 'Outfit',
      body: 'Inter'
    },
    effects: {
      gradient: true,
      shadow: true
    }
  },
  gaming: {
    name: 'Gaming',
    description: 'Exciting and immersive',
    category: 'industry',
    colors: {
      primary: 'oklch(0.58 0.30 330)',
      secondary: 'oklch(0.15 0.08 270)',
      accent: 'oklch(0.68 0.32 140)',
      background: 'oklch(0.10 0.05 270)',
      text: 'oklch(0.96 0.02 330)'
    },
    fonts: {
      heading: 'Outfit',
      body: 'Inter'
    },
    effects: {
      shadow: true,
      blur: true
    }
  },
  wellness: {
    name: 'Wellness',
    description: 'Calm and peaceful',
    category: 'industry',
    colors: {
      primary: 'oklch(0.62 0.16 160)',
      secondary: 'oklch(0.92 0.06 160)',
      accent: 'oklch(0.70 0.20 200)',
      background: 'oklch(0.96 0.03 160)',
      text: 'oklch(0.28 0.05 160)'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    }
  },
  luxury: {
    name: 'Luxury',
    description: 'Premium and exclusive',
    category: 'theme',
    colors: {
      primary: 'oklch(0.25 0.06 60)',
      secondary: 'oklch(0.94 0.03 60)',
      accent: 'oklch(0.58 0.18 40)',
      background: 'oklch(0.98 0.01 60)',
      text: 'oklch(0.20 0.04 60)'
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Crimson Pro'
    },
    effects: {
      shadow: true
    }
  },
  eco: {
    name: 'Eco',
    description: 'Sustainable and natural',
    category: 'theme',
    colors: {
      primary: 'oklch(0.48 0.16 140)',
      secondary: 'oklch(0.90 0.08 130)',
      accent: 'oklch(0.62 0.20 80)',
      background: 'oklch(0.95 0.04 140)',
      text: 'oklch(0.26 0.06 140)'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    }
  },
  retro: {
    name: 'Retro',
    description: '70s and 80s nostalgia',
    category: 'theme',
    colors: {
      primary: 'oklch(0.58 0.24 40)',
      secondary: 'oklch(0.52 0.28 320)',
      accent: 'oklch(0.65 0.26 200)',
      background: 'oklch(0.92 0.06 40)',
      text: 'oklch(0.24 0.08 40)'
    },
    fonts: {
      heading: 'Outfit',
      body: 'Inter'
    },
    effects: {
      texture: true
    }
  },
  futuristic: {
    name: 'Futuristic',
    description: 'Sci-fi and advanced',
    category: 'theme',
    colors: {
      primary: 'oklch(0.62 0.28 260)',
      secondary: 'oklch(0.14 0.06 260)',
      accent: 'oklch(0.70 0.32 180)',
      background: 'oklch(0.10 0.04 260)',
      text: 'oklch(0.94 0.02 260)'
    },
    fonts: {
      heading: 'Space Grotesk',
      body: 'Inter'
    },
    effects: {
      blur: true,
      shadow: true
    }
  },
  minimalist: {
    name: 'Minimalist',
    description: 'Less is more philosophy',
    category: 'design-system',
    colors: {
      primary: 'oklch(0.22 0 0)',
      secondary: 'oklch(0.98 0 0)',
      accent: 'oklch(0.48 0 0)',
      background: 'oklch(1 0 0)',
      text: 'oklch(0.18 0 0)'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    }
  },
  maximalist: {
    name: 'Maximalist',
    description: 'More is more approach',
    category: 'design-system',
    colors: {
      primary: 'oklch(0.60 0.30 340)',
      secondary: 'oklch(0.55 0.32 180)',
      accent: 'oklch(0.65 0.28 60)',
      background: 'oklch(0.92 0.08 340)',
      text: 'oklch(0.18 0.08 340)'
    },
    fonts: {
      heading: 'Bricolage Grotesque',
      body: 'Inter'
    },
    effects: {
      gradient: true,
      shadow: true,
      texture: true
    }
  },
  swiss: {
    name: 'Swiss',
    description: 'International typography style',
    category: 'design-system',
    colors: {
      primary: 'oklch(0.85 0.20 10)',
      secondary: 'oklch(0.98 0 0)',
      accent: 'oklch(0.22 0 0)',
      background: 'oklch(1 0 0)',
      text: 'oklch(0.18 0 0)'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    }
  },
  brutalist: {
    name: 'Brutalist',
    description: 'Raw and bold design',
    category: 'design-system',
    colors: {
      primary: 'oklch(0.20 0 0)',
      secondary: 'oklch(0.96 0 0)',
      accent: 'oklch(0.88 0.24 10)',
      background: 'oklch(0.99 0 0)',
      text: 'oklch(0.15 0 0)'
    },
    fonts: {
      heading: 'Space Grotesk',
      body: 'Inter'
    },
    effects: {
      shadow: true
    }
  },
  glassmorphism: {
    name: 'Glassmorphism',
    description: 'Frosted glass effect',
    category: 'design-system',
    colors: {
      primary: 'oklch(0.85 0.18 270)',
      secondary: 'oklch(0.92 0.06 270)',
      accent: 'oklch(0.75 0.24 200)',
      background: 'oklch(0.96 0.03 270)',
      text: 'oklch(0.22 0.05 270)'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    },
    effects: {
      blur: true,
      shadow: true
    }
  },
  neumorphism: {
    name: 'Neumorphism',
    description: 'Soft UI with depth',
    category: 'design-system',
    colors: {
      primary: 'oklch(0.52 0.18 250)',
      secondary: 'oklch(0.90 0.04 250)',
      accent: 'oklch(0.62 0.22 220)',
      background: 'oklch(0.92 0.02 250)',
      text: 'oklch(0.28 0.05 250)'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    },
    effects: {
      shadow: true
    }
  },
  material: {
    name: 'Material',
    description: 'Google Material Design',
    category: 'design-system',
    colors: {
      primary: 'oklch(0.52 0.24 260)',
      secondary: 'oklch(0.94 0.04 260)',
      accent: 'oklch(0.65 0.26 40)',
      background: 'oklch(0.98 0.01 260)',
      text: 'oklch(0.22 0.05 260)'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    },
    effects: {
      shadow: true
    }
  },
  flat: {
    name: 'Flat',
    description: 'Clean 2D design',
    category: 'design-system',
    colors: {
      primary: 'oklch(0.55 0.22 220)',
      secondary: 'oklch(0.92 0.06 220)',
      accent: 'oklch(0.62 0.26 160)',
      background: 'oklch(0.96 0.03 220)',
      text: 'oklch(0.24 0.05 220)'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    }
  },
  skeuomorphic: {
    name: 'Skeuomorphic',
    description: 'Realistic 3D elements',
    category: 'design-system',
    colors: {
      primary: 'oklch(0.48 0.16 240)',
      secondary: 'oklch(0.88 0.06 240)',
      accent: 'oklch(0.58 0.20 200)',
      background: 'oklch(0.94 0.03 240)',
      text: 'oklch(0.26 0.06 240)'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    },
    effects: {
      shadow: true,
      texture: true
    }
  },
  abstract: {
    name: 'Abstract',
    description: 'Non-representational forms',
    category: 'design-system',
    colors: {
      primary: 'oklch(0.58 0.28 300)',
      secondary: 'oklch(0.52 0.26 60)',
      accent: 'oklch(0.62 0.30 180)',
      background: 'oklch(0.94 0.05 300)',
      text: 'oklch(0.20 0.06 300)'
    },
    fonts: {
      heading: 'Bricolage Grotesque',
      body: 'Inter'
    },
    effects: {
      gradient: true
    }
  },
  geometric: {
    name: 'Geometric',
    description: 'Shapes and patterns',
    category: 'design-system',
    colors: {
      primary: 'oklch(0.50 0.24 280)',
      secondary: 'oklch(0.92 0.06 280)',
      accent: 'oklch(0.65 0.28 340)',
      background: 'oklch(0.96 0.03 280)',
      text: 'oklch(0.22 0.05 280)'
    },
    fonts: {
      heading: 'Space Grotesk',
      body: 'Inter'
    }
  },
  organic: {
    name: 'Organic',
    description: 'Natural flowing forms',
    category: 'design-system',
    colors: {
      primary: 'oklch(0.52 0.18 140)',
      secondary: 'oklch(0.88 0.08 120)',
      accent: 'oklch(0.62 0.22 90)',
      background: 'oklch(0.95 0.04 130)',
      text: 'oklch(0.26 0.06 140)'
    },
    fonts: {
      heading: 'Crimson Pro',
      body: 'Inter'
    }
  }
}

export const styleCategories = {
  classic: ['minimal', 'elegant', 'dark', 'light'],
  modern: ['bold', 'creative', 'modern', 'neon', 'vibrant'],
  industry: ['professional', 'corporate', 'startup', 'academic', 'artistic', 'tech', 'medical', 'finance', 'education', 'marketing', 'legal', 'real-estate', 'fashion', 'food', 'travel', 'sports', 'music', 'gaming', 'wellness'],
  theme: ['vintage', 'pastel', 'earth', 'ocean', 'sunset', 'forest', 'luxury', 'eco', 'retro', 'futuristic'],
  'design-system': ['gradient', 'monochrome', 'minimalist', 'maximalist', 'swiss', 'brutalist', 'glassmorphism', 'neumorphism', 'material', 'flat', 'skeuomorphic', 'abstract', 'geometric', 'organic']
}
