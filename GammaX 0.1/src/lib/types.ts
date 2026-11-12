export type SlideLayout =
  | 'title'
  | 'content'
  | 'two-column'
  | 'image-text'
  | 'quote'
  | 'bullets'
  | 'full-image'
  | 'split-image'
  | 'flowchart'
  | 'diagram'
  | 'stats-grid'
  | 'chart'
  | 'heatmap'
  | 'gauge'
  | 'sankey'
  | 'waterfall'
  | 'timeline'
  | 'comparison'
  | 'before-after'
  | 'feature-grid'
  | 'portfolio'

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'heatmap' | 'gauge' | 'waterfall' | 'radar'
  data: { label: string; value: number; color?: string; secondaryValue?: number }[]
  subtitle?: string
  unit?: string
}

export interface Comment {
  id: string
  author: string
  avatar?: string
  text: string
  timestamp: number
  x?: number // For pin annotations (0-100 percentage)
  y?: number // For pin annotations (0-100 percentage)
  resolved?: boolean
  replies?: Comment[]
}

export interface FlowNode {
  id: string
  label: string
  type: 'process' | 'decision' | 'start' | 'end'
}

export interface FlowEdge {
  fromIndex: number
  toIndex: number
  label?: string
}

export interface SmartShape {
  type: 'rectangle' | 'circle' | 'arrow' | 'star' | 'diamond' | 'hexagon' | 'triangle' | 'blob' | 'pill'
  label: string
  color?: string
  intensity?: 'soft' | 'solid' | 'glow'
  effect?: 'glass' | 'neumorphic' | 'gradient' | 'none'
  animation?: 'stagger' | 'pulse' | 'float' | 'spin' | 'none'
}

export interface Slide {
  id: string
  layout: SlideLayout
  title: string
  content: string[]
  notes?: string
  imageUrl?: string
  imagePrompt?: string
  backgroundColor?: string
  animation?: 'fade' | 'slide' | 'zoom' | 'morph' | 'float' | 'bounce' | 'grow' | 'shrink' | 'none'
  transitionDuration?: number
  interactiveElements?: {
    id: string
    type: 'toggle' | 'slider' | 'hotspot'
    x: number // Percentage 0-100
    y: number // Percentage 0-100
    label?: string
    value?: number | boolean
    min?: number
    max?: number
    trigger?: string
    result?: string
  }[]
  flowchart?: {
    nodes: FlowNode[]
    edges: FlowEdge[]
  }
  shapes?: SmartShape[]
  chart?: ChartData
  icon?: string
  comments?: Comment[]
}

export interface Folder {
  id: string
  name: string
  createdAt: number
}

export interface GeneratedImage {
  id: string
  url: string
  prompt: string
  createdAt: number
}

export type AppView = 'landing' | 'dashboard' | 'images' | 'sites' | 'presentation' | 'settings' | 'templates' | 'themes' | 'theme-editor' | 'shared' | 'fonts' | 'trash' | 'analytics' | 'marketplace' | 'create-ai' | 'generate-ai' | 'paste-text' | 'import-ai'

export interface Presentation {
  id: string
  title: string
  description: string
  slides: Slide[]
  style: PresentationStyle
  createdAt: number
  updatedAt: number
}

export type PresentationStyle =
  | 'minimal' | 'bold' | 'professional' | 'creative'
  | 'modern' | 'glass' | 'dark' | 'neon' | 'eco'
  | 'corporate' | 'playful' | 'brutal' | 'retro' | 'tech'
  | 'gradient' | 'minimalist' | 'elegant' | 'dynamic' | 'clean' | 'impact'

export interface StyleConfig {
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
}

export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE' | 'UNKNOWN'

export interface LogEntry {
  timestamp: Date | null
  level: LogLevel
  message: string
  raw: string
}

export interface LogStats {
  total: number
  errorCount: number
  warnCount: number
  infoCount: number
  debugCount: number
  unknownCount: number
  errorPercentage: number
  warnPercentage: number
}

export interface ErrorFrequency {
  message: string
  count: number
  level: LogLevel
}

export interface TimeSeriesPoint {
  timestamp: string
  errors: number
  warnings: number
  infos: number
}

export interface AnalysisResult {
  fileName: string
  uploadDate: Date
  stats: LogStats
  topErrors: ErrorFrequency[]
  timeSeries: TimeSeriesPoint[]
  entries: LogEntry[]
}

export type ModelProvider = 'auto' | 'gemini' | 'claude' | 'deepseek' | 'ollama' | 'nvidia'

export interface ProviderSettings {
  provider: ModelProvider
  geminiApiKey?: string
  claudeApiKey?: string
  deepseekApiKey?: string
  ollamaBaseUrl?: string
  ollamaModel?: string
  nvidiaApiKey?: string
  nvidiaModel?: string
  timeoutMs?: number
  showShortcutHints?: boolean
  themeMode?: 'light' | 'dark' | 'system'
}

