export type SlideLayout = 'title' | 'content' | 'two-column' | 'image-text' | 'quote' | 'bullets' | 'full-image' | 'split-image' | 'flowchart' | 'mindmap' | 'timeline' | 'org-chart' | 'venn-diagram' | 'pie-chart' | 'bar-chart' | 'line-chart' | 'table' | 'comparison' | 'process' | 'pyramid' | 'cycle'

export type AnimationType = 
  | 'fade-in' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' 
  | 'zoom-in' | 'zoom-out' | 'rotate-in' | 'bounce' | 'flip' 
  | 'blur-in' | 'scale-up' | 'scale-down' | 'swing' | 'pulse' 
  | 'shake' | 'wave' | 'glow' | 'typewriter' | 'reveal'
  | 'rotate-360' | 'bounce-left' | 'bounce-right' | 'elastic' | 'rubber-band'
  | 'jello' | 'heart-beat' | 'flash' | 'wobble' | 'tada'
  | 'flip-x' | 'flip-y' | 'light-speed-in' | 'roll-in' | 'roll-out'
  | 'zoom-in-down' | 'zoom-in-up' | 'zoom-out-down' | 'zoom-out-up'
  | 'slide-rotate' | 'slide-fade-up' | 'slide-fade-down' | 'slide-fade-left' | 'slide-fade-right'
  | 'perspective-left' | 'perspective-right' | 'perspective-down' | 'perspective-up'
  | 'puff-in' | 'puff-out' | 'vanish' | 'fold-down' | 'unfold-up'

export type DiagramType = 'flowchart' | 'mindmap' | 'timeline' | 'org-chart' | 'venn' | 'pie' | 'bar' | 'line' | 'process' | 'pyramid' | 'cycle' | 'funnel' | 'matrix' | 'tree' | 'network' | 'gantt' | 'swot' | 'comparison' | 'hierarchy' | 'sequence'

export interface DiagramNode {
  id: string
  label: string
  type?: 'start' | 'end' | 'process' | 'decision' | 'data' | 'custom'
  position?: { x: number; y: number }
  color?: string
  size?: 'sm' | 'md' | 'lg'
  icon?: string
}

export interface DiagramEdge {
  id: string
  from: string
  to: string
  label?: string
  type?: 'solid' | 'dashed' | 'dotted'
  color?: string
}

export interface DiagramData {
  type: DiagramType
  nodes: DiagramNode[]
  edges?: DiagramEdge[]
  config?: Record<string, any>
}

export interface VoiceOver {
  slideId: string
  audioUrl?: string
  audioBlob?: Blob
  duration?: number
  recordedAt?: number
  transcript?: string
}

export interface Comment {
  id: string
  slideId: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  createdAt: number
  updatedAt?: number
  resolved?: boolean
  position?: { x: number; y: number }
  replies?: CommentReply[]
}

export interface CommentReply {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  createdAt: number
}

export interface Annotation {
  id: string
  slideId: string
  type: 'arrow' | 'circle' | 'rectangle' | 'text' | 'highlight' | 'line' | 'freehand'
  position: { x: number; y: number }
  endPosition?: { x: number; y: number }
  size?: { width: number; height: number }
  color: string
  strokeWidth?: number
  content?: string
  points?: { x: number; y: number }[]
  createdBy: string
  createdAt: number
}

export interface BrandingPreset {
  id: string
  name: string
  company: string
  logoUrl?: string
  logoBlob?: Blob
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  fonts: {
    heading: string
    body: string
  }
  isDefault?: boolean
  createdAt: number
  updatedAt: number
}

export interface AISuggestion {
  id: string
  presentationId: string
  type: 'content' | 'layout' | 'style' | 'engagement' | 'structure'
  title: string
  description: string
  confidence: number
  targetSlideId?: string
  suggestedChange?: any
  reasoning: string
  impact: 'high' | 'medium' | 'low'
  createdAt: number
  applied?: boolean
}

export interface ViewEvent {
  presentationId: string
  viewerId?: string
  viewerLogin?: string
  timestamp: number
  duration?: number
  slidesViewed: number[]
  completionRate: number
}

export interface EngagementEvent {
  presentationId: string
  slideId: string
  eventType: 'view' | 'comment' | 'share' | 'download' | 'edit'
  userId?: string
  timestamp: number
  metadata?: Record<string, any>
}

export interface PresentationAnalytics {
  presentationId: string
  totalViews: number
  uniqueViewers: number
  averageDuration: number
  completionRate: number
  slideEngagement: Record<string, number>
  viewsByDay: Record<string, number>
  topReferrers: string[]
  deviceBreakdown: { mobile: number; tablet: number; desktop: number }
  lastUpdated: number
}

export interface MarketplaceTemplate {
  id: string
  name: string
  description: string
  thumbnail: string
  category: 'business' | 'education' | 'tech' | 'creative' | 'marketing' | 'sales'
  tags: string[]
  style: PresentationStyle
  slideCount: number
  rating: number
  downloads: number
  isPremium: boolean
  author: string
  authorAvatar?: string
  createdAt: number
  previewSlides: Slide[]
  price?: number
}

export interface Collaborator {
  id: string
  login: string
  avatarUrl: string
  lastSeen: number
  currentSlide?: number
  color: string
  cursor?: {
    x: number
    y: number
    slideId: string
  }
}

export interface PresentationVersion {
  id: string
  presentationId: string
  version: number
  title: string
  description: string
  slides: Slide[]
  style: PresentationStyle
  createdAt: number
  createdBy: string
  createdByName: string
  changeDescription?: string
  isAutoSave?: boolean
}

export type TransitionEffect3D = 
  | 'cube-rotate' | 'flip-3d' | 'door-swing' | 'carousel-3d' 
  | 'page-curl' | 'book-flip' | 'cover-flow' | 'ribbon-3d'
  | 'fold-3d' | 'cascade' | 'wave-3d' | 'spiral-3d'

export interface Transition3DConfig {
  effect: TransitionEffect3D
  duration: number
  direction?: 'left' | 'right' | 'up' | 'down'
  parallaxIntensity?: number
  perspective?: number
  easing?: string
}

export interface ShareSettings {
  isShared: boolean
  shareId?: string
  accessType: 'view' | 'edit'
  allowComments: boolean
  expiresAt?: number
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
  animation?: AnimationType
  animationDelay?: number
  animationDuration?: number
  animationEasing?: string
  diagram?: DiagramData
  voiceOver?: VoiceOver
  comments?: Comment[]
  annotations?: Annotation[]
  transition3D?: Transition3DConfig
  parallaxLayers?: ParallaxLayer[]
}

export interface ParallaxLayer {
  id: string
  type: 'background' | 'image' | 'text' | 'shape'
  content?: string
  imageUrl?: string
  depth: number
  position: { x: number; y: number }
  size?: { width: number; height: number }
  opacity?: number
  blur?: number
}

export interface Presentation {
  id: string
  title: string
  description: string
  slides: Slide[]
  style: PresentationStyle
  createdAt: number
  updatedAt: number
  shareSettings?: ShareSettings
  collaborators?: Collaborator[]
  ownerId?: string
  analytics?: PresentationAnalytics
  templateId?: string
  brandingPresetId?: string
  aiSuggestions?: AISuggestion[]
  currentVersion?: number
  versionHistory?: PresentationVersion[]
}

export type PresentationStyle = 
  | 'minimal' | 'bold' | 'professional' | 'creative' | 'elegant' | 'modern'
  | 'vintage' | 'neon' | 'dark' | 'light' | 'gradient' | 'monochrome'
  | 'pastel' | 'vibrant' | 'earth' | 'ocean' | 'sunset' | 'forest'
  | 'corporate' | 'startup' | 'academic' | 'artistic' | 'tech' | 'medical'
  | 'finance' | 'education' | 'marketing' | 'legal' | 'real-estate' | 'fashion'
  | 'food' | 'travel' | 'sports' | 'music' | 'gaming' | 'wellness'
  | 'luxury' | 'eco' | 'retro' | 'futuristic' | 'minimalist' | 'maximalist'
  | 'swiss' | 'brutalist' | 'glassmorphism' | 'neumorphism' | 'material'
  | 'flat' | 'skeuomorphic' | 'abstract' | 'geometric' | 'organic'

export interface StyleConfig {
  name: string
  description: string
  category: 'classic' | 'modern' | 'industry' | 'theme' | 'design-system'
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  fonts: {
    heading: string
    body: string
  }
  effects?: {
    blur?: boolean
    shadow?: boolean
    gradient?: boolean
    texture?: boolean
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
