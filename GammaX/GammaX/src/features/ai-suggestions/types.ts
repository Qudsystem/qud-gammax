// AI Suggestions Types
export type SuggestionType = 
  | 'content-density'
  | 'visual-balance'
  | 'text-readability'
  | 'engagement-optimization'
  | 'layout-improvement';

export type ImpactLevel = 'High' | 'Medium' | 'Low';

export interface EngagementData {
  presentationId: string;
  views: number;
  averageViewTime: number;
  dropOffRates: Map<number, number>; // slideIndex -> dropOffRate
  comments: CommentData[];
  interactions: InteractionEvent[];
  lastUpdated: Date;
}

export interface CommentData {
  id: string;
  slideIndex: number;
  content: string;
  timestamp: Date;
  userId: string;
  resolved?: boolean;
}

export interface InteractionEvent {
  type: 'click' | 'hover' | 'scroll' | 'annotation' | 'comment';
  slideIndex: number;
  elementId?: string;
  timestamp: Date;
  userId?: string;
  duration?: number;
}

export interface Suggestion {
  id: string;
  presentationId?: string; // Added for dismissal tracking
  type: SuggestionType;
  targetSlideIndex: number;
  title: string;
  description: string;
  rationale: string;
  confidenceScore: number; // 0-100
  impactLevel: ImpactLevel;
  action: SuggestionAction;
  createdAt: Date;
  applied?: boolean;
  dismissed?: boolean; // Added to track dismissal state
}

export interface SuggestionAction {
  type: 'modify-text' | 'adjust-layout' | 'add-visual' | 'simplify-content';
  parameters: Record<string, any>;
}

export interface AnalysisResult {
  contentDensityScores: number[];
  visualBalanceScores: number[];
  readabilityScores: number[];
  engagementPatterns: EngagementPattern[];
  overallScore?: number;
}

export interface EngagementPattern {
  type: 'drop-off' | 'engagement-spike' | 'low-interaction' | 'high-bounce';
  slideIndexes: number[];
  severity: 'low' | 'medium' | 'high';
  description: string;
}

// Raw data interfaces for parsing
export interface RawEngagementData {
  presentationId: string;
  views: number | string;
  averageViewTime: number | string;
  dropOffRates: Record<string, number | string>;
  comments: any[];
  interactions: any[];
  lastUpdated?: string | number | Date;
}

export interface RawCommentData {
  id: string;
  slideIndex: number | string;
  content: string;
  timestamp: string | number | Date;
  userId: string;
  resolved?: boolean | string;
}

export interface RawInteractionEvent {
  type: string;
  slideIndex: number | string;
  elementId?: string;
  timestamp: string | number | Date;
  userId?: string;
  duration?: number | string;
}

// Validation interfaces
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Interfaces for AI Analysis Components
export interface AIAnalyzer {
  analyzeEngagement(data: EngagementData): Promise<AnalysisResult>;
  generateSuggestions(analysis: AnalysisResult): Promise<Suggestion[]>;
  calculateConfidence(suggestion: Suggestion): number;
}

export interface SuggestionManager {
  fetchSuggestions(presentationId: string): Promise<Suggestion[]>;
  applySuggestion(suggestionId: string): Promise<void>;
  dismissSuggestion(suggestionId: string): Promise<void>;
  rankSuggestions(suggestions: Suggestion[]): Suggestion[];
  // Additional dismissal-related methods
  clearDismissalHistory(presentationId: string): Promise<void>;
  getDismissalStats(presentationId: string): Promise<{
    totalDismissed: number;
    dismissedByType: Record<string, number>;
    recentDismissals: any[];
  }>;
  isSuggestionDismissed(presentationId: string, suggestionId: string): Promise<boolean>;
}

// Error types
export class AIAnalysisError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AIAnalysisError';
  }
}

export class SuggestionError extends Error {
  constructor(
    message: string,
    public code: string,
    public suggestionId?: string
  ) {
    super(message);
    this.name = 'SuggestionError';
  }
}

// Configuration types
export interface AIConfig {
  maxSuggestions: number;
  minConfidenceScore: number;
  enableFallbackSuggestions: boolean;
  analysisTimeout: number;
}

export const DEFAULT_AI_CONFIG: AIConfig = {
  maxSuggestions: 8,
  minConfidenceScore: 30,
  enableFallbackSuggestions: true,
  analysisTimeout: 10000 // 10 seconds
};

// Fallback suggestion templates
export interface FallbackSuggestion {
  type: SuggestionType;
  title: string;
  description: string;
  rationale: string;
  confidenceScore: number;
  impactLevel: ImpactLevel;
  applicableConditions: string[];
}

export const FALLBACK_SUGGESTIONS: FallbackSuggestion[] = [
  {
    type: 'content-density',
    title: 'تقليل كثافة المحتوى',
    description: 'قم بتقسيم المحتوى الكثيف إلى شرائح متعددة لتحسين القراءة',
    rationale: 'الشرائح المكتظة بالمحتوى تقلل من فهم الجمهور وتشتت الانتباه',
    confidenceScore: 45,
    impactLevel: 'Medium',
    applicableConditions: ['high-text-density', 'multiple-concepts']
  },
  {
    type: 'visual-balance',
    title: 'تحسين التوازن البصري',
    description: 'أضف عناصر بصرية لموازنة النص وتحسين جاذبية الشريحة',
    rationale: 'التوازن البصري يحسن من تجربة المشاهدة ويزيد التفاعل',
    confidenceScore: 40,
    impactLevel: 'Medium',
    applicableConditions: ['text-heavy', 'no-visuals']
  },
  {
    type: 'text-readability',
    title: 'تحسين قابلية القراءة',
    description: 'استخدم خطوط أكبر وألوان متباينة لتحسين وضوح النص',
    rationale: 'النصوص الواضحة تضمن وصول الرسالة بفعالية للجمهور',
    confidenceScore: 50,
    impactLevel: 'High',
    applicableConditions: ['small-text', 'poor-contrast']
  },
  {
    type: 'engagement-optimization',
    title: 'زيادة التفاعل',
    description: 'أضف عناصر تفاعلية مثل الأسئلة أو الاستطلاعات',
    rationale: 'العناصر التفاعلية تزيد من مشاركة الجمهور وتحسن الاستيعاب',
    confidenceScore: 35,
    impactLevel: 'High',
    applicableConditions: ['passive-content', 'long-presentation']
  },
  {
    type: 'layout-improvement',
    title: 'تحسين التخطيط',
    description: 'استخدم تخطيطات أكثر تنظيماً مع هيكلة واضحة للمعلومات',
    rationale: 'التخطيط المنظم يساعد الجمهور على متابعة تدفق الأفكار',
    confidenceScore: 42,
    impactLevel: 'Medium',
    applicableConditions: ['unstructured-layout', 'poor-hierarchy']
  }
];