/**
 * Fallback Suggestions Generator
 * Provides general best-practice suggestions when engagement data is insufficient for AI analysis
 */

import { 
  Suggestion, 
  SuggestionType, 
  ImpactLevel, 
  EngagementData,
  FallbackSuggestion,
  FALLBACK_SUGGESTIONS 
} from './types';

export interface FallbackContext {
  presentationId: string;
  slideCount: number;
  hasMinimalData: boolean;
  dataQualityScore: number;
  availableDataTypes: string[];
}

export interface FallbackSuggestionConfig {
  maxSuggestions: number;
  minConfidenceScore: number;
  maxConfidenceScore: number;
  prioritizeByImpact: boolean;
}

export const DEFAULT_FALLBACK_CONFIG: FallbackSuggestionConfig = {
  maxSuggestions: 6,
  minConfidenceScore: 30,
  maxConfidenceScore: 50,
  prioritizeByImpact: true
};

export class FallbackSuggestionsGenerator {
  private config: FallbackSuggestionConfig;

  constructor(config: FallbackSuggestionConfig = DEFAULT_FALLBACK_CONFIG) {
    this.config = config;
  }

  /**
   * Generate fallback suggestions when AI analysis is not possible
   */
  generateFallbackSuggestions(
    data: EngagementData,
    context?: Partial<FallbackContext>
  ): Suggestion[] {
    const fallbackContext = this.buildContext(data, context);
    
    // Determine which fallback suggestions are applicable
    const applicableSuggestions = this.selectApplicableSuggestions(fallbackContext);
    
    // Generate actual suggestions with proper IDs and metadata
    const suggestions = this.createSuggestions(applicableSuggestions, fallbackContext);
    
    // Apply confidence scoring based on available data
    const scoredSuggestions = this.applyFallbackConfidenceScoring(suggestions, fallbackContext);
    
    // Rank and limit suggestions
    return this.rankAndLimitSuggestions(scoredSuggestions);
  }

  /**
   * Check if data is insufficient for AI analysis
   */
  isDataInsufficient(data: EngagementData): boolean {
    const insufficientViews = data.views < 5;
    const noDropOffData = data.dropOffRates.size === 0;
    const noInteractions = data.interactions.length === 0;
    const noComments = data.comments.length === 0;
    
    // Data is insufficient if views are too low OR if we're missing most data types
    const missingDataTypes = [noDropOffData, noInteractions, noComments].filter(Boolean).length;
    
    return insufficientViews || missingDataTypes >= 2;
  }

  /**
   * Generate suggestions for specific presentation characteristics
   */
  generateContextualFallbacks(
    presentationCharacteristics: {
      hasLongSlides?: boolean;
      hasTextHeavySlides?: boolean;
      hasNoVisuals?: boolean;
      hasComplexContent?: boolean;
      isLongPresentation?: boolean;
    },
    presentationId: string
  ): Suggestion[] {
    const suggestions: Suggestion[] = [];
    
    if (presentationCharacteristics.hasTextHeavySlides) {
      suggestions.push(this.createSuggestion(
        'visual-balance',
        'إضافة عناصر بصرية',
        'قم بإضافة صور أو رسوم بيانية لموازنة النص الكثيف وتحسين جاذبية الشرائح',
        'الشرائح النصية الثقيلة تقلل من تفاعل الجمهور وتزيد معدلات التخلي',
        42,
        'Medium',
        0,
        presentationId
      ));
    }

    if (presentationCharacteristics.hasLongSlides) {
      suggestions.push(this.createSuggestion(
        'content-density',
        'تقسيم المحتوى الطويل',
        'قم بتقسيم الشرائح الطويلة إلى شرائح متعددة أقصر لتحسين التركيز',
        'الشرائح الطويلة تؤدي إلى فقدان انتباه الجمهور وصعوبة في المتابعة',
        45,
        'High',
        0,
        presentationId
      ));
    }

    if (presentationCharacteristics.hasNoVisuals) {
      suggestions.push(this.createSuggestion(
        'layout-improvement',
        'إضافة عناصر مرئية',
        'أضف رسوم بيانية أو صور أو أيقونات لجعل المحتوى أكثر جاذبية ووضوحاً',
        'العناصر المرئية تحسن الفهم وتزيد معدلات الاحتفاظ بالمعلومات',
        40,
        'Medium',
        0,
        presentationId
      ));
    }

    if (presentationCharacteristics.hasComplexContent) {
      suggestions.push(this.createSuggestion(
        'text-readability',
        'تبسيط المحتوى المعقد',
        'استخدم لغة أبسط ونقاط أساسية واضحة لتحسين فهم المحتوى المعقد',
        'المحتوى المعقد يحتاج إلى تبسيط لضمان وصول الرسالة بفعالية',
        48,
        'High',
        0,
        presentationId
      ));
    }

    if (presentationCharacteristics.isLongPresentation) {
      suggestions.push(this.createSuggestion(
        'engagement-optimization',
        'إضافة نقاط تفاعل',
        'أضف أسئلة أو استطلاعات أو فترات راحة في العروض الطويلة للحفاظ على التفاعل',
        'العروض الطويلة تحتاج إلى عناصر تفاعلية لمنع فقدان انتباه الجمهور',
        38,
        'High',
        Math.floor(suggestions.length / 2),
        presentationId
      ));
    }

    return suggestions.slice(0, this.config.maxSuggestions);
  }

  /**
   * Build context for fallback suggestion generation
   */
  private buildContext(data: EngagementData, context?: Partial<FallbackContext>): FallbackContext {
    const availableDataTypes: string[] = [];
    
    if (data.views > 0) availableDataTypes.push('views');
    if (data.dropOffRates.size > 0) availableDataTypes.push('dropOffRates');
    if (data.interactions.length > 0) availableDataTypes.push('interactions');
    if (data.comments.length > 0) availableDataTypes.push('comments');
    
    const dataQualityScore = this.calculateDataQualityScore(data);
    
    return {
      presentationId: data.presentationId,
      slideCount: Math.max(data.dropOffRates.size, 5),
      hasMinimalData: data.views < 10,
      dataQualityScore,
      availableDataTypes,
      ...context
    };
  }

  /**
   * Calculate a simple data quality score (0-100)
   */
  private calculateDataQualityScore(data: EngagementData): number {
    let score = 0;
    
    // Views contribution (0-25 points)
    if (data.views >= 50) score += 25;
    else if (data.views >= 20) score += 20;
    else if (data.views >= 10) score += 15;
    else if (data.views >= 5) score += 10;
    else score += Math.max(0, data.views * 2);
    
    // Drop-off data contribution (0-25 points)
    if (data.dropOffRates.size >= 5) score += 25;
    else if (data.dropOffRates.size >= 3) score += 20;
    else if (data.dropOffRates.size >= 1) score += 15;
    
    // Interactions contribution (0-25 points)
    if (data.interactions.length >= 20) score += 25;
    else if (data.interactions.length >= 10) score += 20;
    else if (data.interactions.length >= 5) score += 15;
    else if (data.interactions.length >= 1) score += 10;
    
    // Comments contribution (0-25 points)
    if (data.comments.length >= 10) score += 25;
    else if (data.comments.length >= 5) score += 20;
    else if (data.comments.length >= 2) score += 15;
    else if (data.comments.length >= 1) score += 10;
    
    return Math.min(100, score);
  }

  /**
   * Select applicable fallback suggestions based on context
   */
  private selectApplicableSuggestions(context: FallbackContext): FallbackSuggestion[] {
    const applicable: FallbackSuggestion[] = [];
    
    for (const suggestion of FALLBACK_SUGGESTIONS) {
      if (this.isSuggestionApplicable(suggestion, context)) {
        applicable.push(suggestion);
      }
    }
    
    // If no specific suggestions are applicable, include general ones
    if (applicable.length === 0) {
      applicable.push(...FALLBACK_SUGGESTIONS.slice(0, 3));
    }
    
    return applicable;
  }

  /**
   * Check if a fallback suggestion is applicable to the current context
   */
  private isSuggestionApplicable(suggestion: FallbackSuggestion, context: FallbackContext): boolean {
    // For minimal data, all suggestions are potentially applicable
    if (context.hasMinimalData) {
      return true;
    }
    
    // Check if any applicable conditions match the context
    // This is a simplified check - in a real implementation, you'd analyze
    // the actual presentation content to determine these conditions
    const hasRelevantConditions = suggestion.applicableConditions.some(condition => {
      switch (condition) {
        case 'high-text-density':
        case 'multiple-concepts':
          return context.slideCount > 10; // Assume longer presentations have these issues
        case 'text-heavy':
        case 'no-visuals':
          return context.dataQualityScore < 60; // Low quality might indicate these issues
        case 'small-text':
        case 'poor-contrast':
          return true; // These are common issues
        case 'passive-content':
        case 'long-presentation':
          return context.slideCount > 15;
        case 'unstructured-layout':
        case 'poor-hierarchy':
          return context.dataQualityScore < 50;
        default:
          return false;
      }
    });
    
    return hasRelevantConditions;
  }

  /**
   * Create suggestion objects from fallback templates
   */
  private createSuggestions(
    fallbackSuggestions: FallbackSuggestion[],
    context: FallbackContext
  ): Suggestion[] {
    return fallbackSuggestions.map((fallback, index) => 
      this.createSuggestion(
        fallback.type,
        fallback.title,
        fallback.description,
        fallback.rationale,
        fallback.confidenceScore,
        fallback.impactLevel,
        Math.floor(index / 2), // Distribute across slides
        context.presentationId
      )
    );
  }

  /**
   * Create a single suggestion object
   */
  private createSuggestion(
    type: SuggestionType,
    title: string,
    description: string,
    rationale: string,
    baseConfidence: number,
    impactLevel: ImpactLevel,
    targetSlideIndex: number,
    presentationId: string
  ): Suggestion {
    return {
      id: `fallback-${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      presentationId,
      type,
      targetSlideIndex,
      title,
      description,
      rationale,
      confidenceScore: baseConfidence,
      impactLevel,
      action: {
        type: this.getActionTypeForSuggestionType(type),
        parameters: {
          fallback: true,
          suggestionType: type,
          targetSlide: targetSlideIndex
        }
      },
      createdAt: new Date()
    };
  }

  /**
   * Map suggestion types to action types
   */
  private getActionTypeForSuggestionType(type: SuggestionType): Suggestion['action']['type'] {
    switch (type) {
      case 'content-density':
        return 'simplify-content';
      case 'visual-balance':
        return 'add-visual';
      case 'text-readability':
        return 'modify-text';
      case 'engagement-optimization':
        return 'add-visual';
      case 'layout-improvement':
        return 'adjust-layout';
      default:
        return 'modify-text';
    }
  }

  /**
   * Apply confidence scoring adjustments based on available data
   */
  private applyFallbackConfidenceScoring(
    suggestions: Suggestion[],
    context: FallbackContext
  ): Suggestion[] {
    return suggestions.map(suggestion => {
      let adjustedConfidence = suggestion.confidenceScore;
      
      // Adjust based on data quality
      const qualityMultiplier = Math.max(0.6, context.dataQualityScore / 100);
      adjustedConfidence *= qualityMultiplier;
      
      // Adjust based on available data types
      if (context.availableDataTypes.length >= 3) {
        adjustedConfidence += 5; // Slight boost for more data types
      } else if (context.availableDataTypes.length <= 1) {
        adjustedConfidence -= 8; // Penalty for very limited data
      }
      
      // Impact level adjustments
      switch (suggestion.impactLevel) {
        case 'High':
          adjustedConfidence += 3;
          break;
        case 'Low':
          adjustedConfidence -= 2;
          break;
      }
      
      // Ensure confidence stays within fallback bounds
      adjustedConfidence = Math.max(
        this.config.minConfidenceScore,
        Math.min(this.config.maxConfidenceScore, adjustedConfidence)
      );
      
      return {
        ...suggestion,
        confidenceScore: Math.round(adjustedConfidence)
      };
    });
  }

  /**
   * Rank suggestions and limit to configured maximum
   */
  private rankAndLimitSuggestions(suggestions: Suggestion[]): Suggestion[] {
    // Sort by impact level first (if prioritized), then by confidence score
    const sorted = suggestions.sort((a, b) => {
      if (this.config.prioritizeByImpact) {
        const impactOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        const impactDiff = impactOrder[b.impactLevel] - impactOrder[a.impactLevel];
        if (impactDiff !== 0) return impactDiff;
      }
      
      return b.confidenceScore - a.confidenceScore;
    });
    
    return sorted.slice(0, this.config.maxSuggestions);
  }

  /**
   * Generate emergency fallback suggestions when all else fails
   */
  generateEmergencyFallbacks(presentationId: string): Suggestion[] {
    const emergencyTemplates = [
      {
        type: 'text-readability' as SuggestionType,
        title: 'تحسين وضوح النص',
        description: 'تأكد من استخدام خطوط واضحة وأحجام مناسبة للقراءة',
        rationale: 'النصوص الواضحة أساسية لفعالية أي عرض تقديمي',
        confidence: 35,
        impact: 'High' as ImpactLevel
      },
      {
        type: 'layout-improvement' as SuggestionType,
        title: 'تنظيم المحتوى',
        description: 'استخدم تخطيطاً منظماً مع عناوين واضحة ونقاط أساسية',
        rationale: 'التنظيم الجيد يساعد الجمهور على متابعة العرض بسهولة',
        confidence: 40,
        impact: 'Medium' as ImpactLevel
      },
      {
        type: 'engagement-optimization' as SuggestionType,
        title: 'زيادة التفاعل',
        description: 'أضف عناصر تفاعلية مثل الأسئلة أو الصور الجذابة',
        rationale: 'التفاعل يحسن من تجربة الجمهور ويزيد الاستيعاب',
        confidence: 32,
        impact: 'High' as ImpactLevel
      }
    ];

    return emergencyTemplates.map((template, index) =>
      this.createSuggestion(
        template.type,
        template.title,
        template.description,
        template.rationale,
        template.confidence,
        template.impact,
        index,
        presentationId
      )
    );
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<FallbackSuggestionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): FallbackSuggestionConfig {
    return { ...this.config };
  }
}