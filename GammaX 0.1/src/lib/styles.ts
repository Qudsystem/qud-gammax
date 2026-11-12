import { PresentationStyle, StyleConfig } from './types'

export const styleConfigs: Record<PresentationStyle, StyleConfig> = {
  minimal: {
    name: 'Minimal',
    description: 'Clean and simple with plenty of white space',
    colors: {
      primary: 'oklch(0.20 0.05 285)',
      secondary: 'oklch(0.97 0.01 285)',
      accent: 'oklch(0.65 0.15 240)'
    }
  },
  bold: {
    name: 'Bold',
    description: 'High contrast with vibrant colors',
    colors: {
      primary: 'oklch(0.35 0.25 290)',
      secondary: 'oklch(0.90 0.08 290)',
      accent: 'oklch(0.65 0.25 340)'
    }
  },
  professional: {
    name: 'Professional',
    description: 'Corporate and polished',
    colors: {
      primary: 'oklch(0.30 0.05 240)',
      secondary: 'oklch(0.95 0.02 240)',
      accent: 'oklch(0.55 0.15 200)'
    }
  },
  creative: {
    name: 'Creative',
    description: 'Playful with gradient accents',
    colors: {
      primary: 'oklch(0.50 0.22 310)',
      secondary: 'oklch(0.92 0.06 310)',
      accent: 'oklch(0.60 0.20 60)'
    }
  },
  modern: {
    name: 'Modern',
    description: 'Sleek and contemporary',
    colors: {
      primary: 'oklch(0.18 0.08 260)',
      secondary: 'oklch(0.98 0.01 260)',
      accent: 'oklch(0.62 0.24 250)'
    }
  },
  glass: {
    name: 'Glass',
    description: 'Frosted glass effects and soft backgrounds',
    colors: {
      primary: 'oklch(0.30 0.12 280)',
      secondary: 'oklch(0.95 0.05 280)',
      accent: 'oklch(0.75 0.20 250)'
    }
  },
  dark: {
    name: 'Dark',
    description: 'Deep colors for high impact',
    colors: {
      primary: 'oklch(0.95 0.01 280)',
      secondary: 'oklch(0.15 0.05 280)',
      accent: 'oklch(0.65 0.20 310)'
    }
  },
  neon: {
    name: 'Neon',
    description: 'Cyberpunk aesthetic with glowing accents',
    colors: {
      primary: 'oklch(0.95 0.01 320)',
      secondary: 'oklch(0.10 0.10 320)',
      accent: 'oklch(0.70 0.35 300)'
    }
  },
  eco: {
    name: 'Eco',
    description: 'Nature-inspired greens and earthy tones',
    colors: {
      primary: 'oklch(0.30 0.10 140)',
      secondary: 'oklch(0.96 0.04 140)',
      accent: 'oklch(0.60 0.25 150)'
    }
  },
  corporate: {
    name: 'Corporate',
    description: 'Trusted and established vibes',
    colors: {
      primary: 'oklch(0.25 0.05 220)',
      secondary: 'oklch(0.97 0.02 220)',
      accent: 'oklch(0.45 0.15 230)'
    }
  },
  playful: {
    name: 'Playful',
    description: 'Energetic and approachable',
    colors: {
      primary: 'oklch(0.40 0.20 40)',
      secondary: 'oklch(0.98 0.03 40)',
      accent: 'oklch(0.55 0.30 20)'
    }
  },
  brutal: {
    name: 'Brutal',
    description: 'Neo-brutalist high contrast',
    colors: {
      primary: 'oklch(0.10 0.01 0)',
      secondary: 'oklch(0.95 0.05 60)',
      accent: 'oklch(0.70 0.30 300)'
    }
  },
  retro: {
    name: 'Retro',
    description: 'Vintage 80s/90s nostalgia',
    colors: {
      primary: 'oklch(0.35 0.15 330)',
      secondary: 'oklch(0.93 0.08 330)',
      accent: 'oklch(0.65 0.25 280)'
    }
  },
  tech: {
    name: 'Tech',
    description: 'Future-forward and analytical',
    colors: {
      primary: 'oklch(0.20 0.15 250)',
      secondary: 'oklch(0.92 0.05 250)',
      accent: 'oklch(0.55 0.25 210)'
    }
  },
  gradient: {
    name: 'Gradient',
    description: 'Vibrant color transitions',
    colors: {
      primary: 'oklch(0.45 0.25 310)',
      secondary: 'oklch(0.95 0.05 310)',
      accent: 'oklch(0.60 0.30 250)'
    }
  },
  minimalist: {
    name: 'Minimalist',
    description: 'Absolute minimum design elements',
    colors: {
      primary: 'oklch(0.12 0.02 280)',
      secondary: 'oklch(0.99 0.005 300)',
      accent: 'oklch(0.50 0.05 10)'
    }
  },
  elegant: {
    name: 'Elegant',
    description: 'Sophisticated and graceful',
    colors: {
      primary: 'oklch(0.25 0.04 30)',
      secondary: 'oklch(0.98 0.02 30)',
      accent: 'oklch(0.55 0.12 40)'
    }
  },
  dynamic: {
    name: 'Dynamic',
    description: 'High energy and motion',
    colors: {
      primary: 'oklch(0.45 0.28 200)',
      secondary: 'oklch(0.94 0.05 200)',
      accent: 'oklch(0.65 0.35 180)'
    }
  },
  clean: {
    name: 'Clean',
    description: 'Pure and lightweight',
    colors: {
      primary: 'oklch(0.35 0.08 240)',
      secondary: 'oklch(0.99 0.01 240)',
      accent: 'oklch(0.55 0.20 220)'
    }
  },
  impact: {
    name: 'Impact',
    description: 'Strong focus and presence',
    colors: {
      primary: 'oklch(0.98 0.02 0)',
      secondary: 'oklch(0.05 0.05 0)',
      accent: 'oklch(0.60 0.30 30)'
    }
  }
}
