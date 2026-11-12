/**
 * Confidence Scoring Algorithm for AI Suggestions
 * Calculates confidence scores (0-100) based on data quality, pattern strength, and evidence
 */

import { EngagementData, Suggestion, AnalysisResult, EngagementPattern } from './types';

export interface ConfidenceFactors {
  dataQuality: number;      // 0-100: Quality and completeness of input data
  patternStrength: number;  // 0-100: Strength of detected patterns
  evidenceSupport: number;  // 0-100: Supporting evidence from multiple sources
  sampleSize: number;       // 0-100: Adequacy of sample size
  recency: number;          // 0-100: How recent the data is
}

export interface ConfidenceBreakdown {
  finalScore: number;
  factors: ConfidenceFactors;
  adjustments: ConfidenceAdjustment[];
  reasoning: string;
}

export interface ConfidenceAdjustment {
  factor: string;
  impact: number;
  reason: string;
}

export class ConfidenceScorer {
  private readonly MIN_VIEWS_HIGH_CONFIDENCE = 100;
  private readonly MIN_VIEWS_MEDIUM_CONFIDENCE = 25;
  private readonly MAX_DATA_AGE_DAYS = 30;
  private readonly OPTIMAL_DATA_AGE_DAYS = 7;

  /**
   * Calculate confidence score for a suggestion
   */
  calculateConfidence(
    suggestion: Suggestion,
    data: EngagementData,
    analysis: AnalysisResult
  ): ConfidenceBreakdown {
    const factors = this.calculateConfidenceFactors(suggestion, data, analysis);
    const adjustments = this.calculateAdjustments(suggestion, data, analysis);
    
    // Base confidence from weighted factors
    const baseScore = this.calculateBaseScore(factors);
    
    // Apply adjustments
    const finalScore = this.applyAdjustments(baseScore, adjustments);
    
    const reasoning = this.generateReasoning(factors, adjustments, finalScore);
    
    return {
      finalScore: Math.round(Math.max(0, Math.min(100, finalScore))),
      factors,
      adjustments,
      reasoning
    };
  }

  /**
   * Calculate individual confidence factors
   */
  private calculateConfidenceFactors(
    suggestion: Suggestion,
    data: EngagementData,
    analysis: AnalysisResult
  ): ConfidenceFactors {
    return {
      dataQuality: this.calculateDataQuality(data),
      patternStrength: this.calculatePatternStrength(suggestion, data, analysis),
      evidenceSupport: this.calculateEvidenceSupport(suggestion, data),
      sampleSize: this.calculateSampleSizeScore(data),
      recency: this.calculateRecencyScore(data)
    };
  }

  /**
   * Calculate data quality score (0-100)
   */
  private calculateDataQuality(data: EngagementData): number {
    let score = 100;
    const penalties: { reason: string; penalty: number }[] = [];

    // Check completeness
    if (data.dropOffRates.size === 0) {
      penalties.push({ reason: 'No drop-off data', penalty: 30 });
    }
    
    if (data.interactions.length === 0) {
      penalties.push({ reason: 'No interaction data', penalty: 20 });
    }
    
    if (data.comments.length === 0) {
      penalties.push({ reason: 'No comment data', penalty: 10 });
    }

    // Check data consistency
    const maxSlideIndex = Math.max(...Array.from(data.dropOffRates.keys()));
    const interactionSlides = new Set(data.interactions.map(i => i.slideIndex));
    const coverageRatio = interactionSlides.size / Math.max(maxSlideIndex + 1, 1);
    
    if (coverageRatio < 0.5) {
      penalties.push({ reason: 'Low slide coverage in interactions', penalty: 15 });
    }

    // Check for data anomalies
    const dropOffValues = Array.from(data.dropOffRates.values());
    const avgDropOff = dropOffValues.reduce((sum, val) => sum + val, 0) / dropOffValues.length;
    
    if (avgDropOff > 0.8) {
      penalties.push({ reason: 'Unusually high drop-off rates', penalty: 20 });
    }

    // Apply penalties
    const totalPenalty = penalties.reduce((sum, p) => sum + p.penalty, 0);
    return Math.max(0, score - totalPenalty);
  }

  /**
   * Calculate pattern strength score (0-100)
   */
  private calculatePatternStrength(
    suggestion: Suggestion,
    data: EngagementData,
    analysis: AnalysisResult
  ): number {
    const targetSlide = suggestion.targetSlideIndex;
    
    // Find relevant patterns for this suggestion
    const relevantPatterns = analysis.engagementPatterns.filter(pattern =>
      pattern.slideIndexes.includes(targetSlide) || targetSlide === -1
    );

    if (relevantPatterns.length === 0) {
      return 30; // Low confidence without supporting patterns
    }

    let strengthScore = 0;
    let patternCount = 0;

    for (const pattern of relevantPatterns) {
      patternCount++;
      
      switch (pattern.severity) {
        case 'high':
          strengthScore += 90;
          break;
        case 'medium':
          strengthScore += 70;
          break;
        case 'low':
          strengthScore += 50;
          break;
      }

      // Bonus for pattern consistency across multiple slides
      if (pattern.slideIndexes.length > 2) {
        strengthScore += 10;
      }
    }

    return Math.min(100, strengthScore / patternCount);
  }

  /**
   * Calculate evidence support score (0-100)
   */
  private calculateEvidenceSupport(suggestion: Suggestion, data: EngagementData): number {
    let evidenceScore = 0;
    let evidenceCount = 0;

    const targetSlide = suggestion.targetSlideIndex;

    // Check drop-off rate evidence
    if (targetSlide >= 0 && data.dropOffRates.has(targetSlide)) {
      evidenceCount++;
      const dropOffRate = data.dropOffRates.get(targetSlide)!;
      
      switch (suggestion.type) {
        case 'engagement-optimization':
          evidenceScore += dropOffRate > 0.3 ? 90 : dropOffRate > 0.2 ? 70 : 40;
          break;
        case 'content-density':
          evidenceScore += dropOffRate > 0.25 ? 85 : dropOffRate > 0.15 ? 60 : 35;
          break;
        default:
          evidenceScore += dropOffRate > 0.2 ? 70 : 50;
      }
    }

    // Check interaction evidence
    const slideInteractions = data.interactions.filter(i => 
      targetSlide === -1 || i.slideIndex === targetSlide
    );
    
    if (slideInteractions.length > 0) {
      evidenceCount++;
      const interactionRate = slideInteractions.length / Math.max(data.views, 1);
      
      switch (suggestion.type) {
        case 'layout-improvement':
          evidenceScore += interactionRate < 0.1 ? 80 : interactionRate < 0.2 ? 60 : 40;
          break;
        case 'visual-balance':
          const hoverRatio = slideInteractions.filter(i => i.type === 'hover').length / 
                            Math.max(slideInteractions.length, 1);
          evidenceScore += hoverRatio > 0.6 ? 75 : hoverRatio > 0.4 ? 55 : 35;
          break;
        default:
          evidenceScore += interactionRate < 0.15 ? 70 : 50;
      }
    }

    // Check comment evidence
    const slideComments = data.comments.filter(c => 
      targetSlide === -1 || c.slideIndex === targetSlide
    );
    
    if (slideComments.length > 0) {
      evidenceCount++;
      
      const negativeKeywords = ['confusing', 'unclear', 'difficult', 'hard', 'complex'];
      const positiveKeywords = ['clear', 'good', 'great', 'excellent', 'helpful'];
      
      let sentimentScore = 0;
      slideComments.forEach(comment => {
        const content = comment.content.toLowerCase();
        if (negativeKeywords.some(keyword => content.includes(keyword))) {
          sentimentScore -= 1;
        }
        if (positiveKeywords.some(keyword => content.includes(keyword))) {
          sentimentScore += 1;
        }
      });

      switch (suggestion.type) {
        case 'text-readability':
          evidenceScore += sentimentScore < -1 ? 90 : sentimentScore < 0 ? 70 : 40;
          break;
        default:
          evidenceScore += sentimentScore < 0 ? 75 : 50;
      }
    }

    return evidenceCount > 0 ? evidenceScore / evidenceCount : 30;
  }

  /**
   * Calculate sample size adequacy score (0-100)
   */
  private calculateSampleSizeScore(data: EngagementData): number {
    if (data.views >= this.MIN_VIEWS_HIGH_CONFIDENCE) {
      return 100;
    } else if (data.views >= this.MIN_VIEWS_MEDIUM_CONFIDENCE) {
      // Linear interpolation between medium and high confidence thresholds
      const ratio = (data.views - this.MIN_VIEWS_MEDIUM_CONFIDENCE) / 
                   (this.MIN_VIEWS_HIGH_CONFIDENCE - this.MIN_VIEWS_MEDIUM_CONFIDENCE);
      return 60 + (ratio * 40); // 60-100 range
    } else if (data.views >= 10) {
      // Linear interpolation for low confidence range
      const ratio = (data.views - 10) / (this.MIN_VIEWS_MEDIUM_CONFIDENCE - 10);
      return 30 + (ratio * 30); // 30-60 range
    } else {
      // Very low confidence for < 10 views
      return Math.max(10, data.views * 3);
    }
  }

  /**
   * Calculate data recency score (0-100)
   */
  private calculateRecencyScore(data: EngagementData): number {
    const daysSinceUpdate = (Date.now() - data.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceUpdate <= this.OPTIMAL_DATA_AGE_DAYS) {
      return 100;
    } else if (daysSinceUpdate <= this.MAX_DATA_AGE_DAYS) {
      // Linear decay from optimal to max age
      const ratio = (daysSinceUpdate - this.OPTIMAL_DATA_AGE_DAYS) / 
                   (this.MAX_DATA_AGE_DAYS - this.OPTIMAL_DATA_AGE_DAYS);
      return 100 - (ratio * 30); // 70-100 range
    } else {
      // Exponential decay after max age
      const excessDays = daysSinceUpdate - this.MAX_DATA_AGE_DAYS;
      return Math.max(20, 70 * Math.exp(-excessDays / 30));
    }
  }

  /**
   * Calculate adjustments based on suggestion-specific factors
   */
  private calculateAdjustments(
    suggestion: Suggestion,
    data: EngagementData,
    analysis: AnalysisResult
  ): ConfidenceAdjustment[] {
    const adjustments: ConfidenceAdjustment[] = [];

    // Impact level adjustment
    switch (suggestion.impactLevel) {
      case 'High':
        adjustments.push({
          factor: 'impact-level',
          impact: 10,
          reason: 'High impact suggestions get confidence boost'
        });
        break;
      case 'Low':
        adjustments.push({
          factor: 'impact-level',
          impact: -5,
          reason: 'Low impact suggestions get slight confidence reduction'
        });
        break;
    }

    // Suggestion type specific adjustments
    switch (suggestion.type) {
      case 'engagement-optimization':
        if (data.views > 50) {
          adjustments.push({
            factor: 'suggestion-type',
            impact: 5,
            reason: 'Engagement optimization more reliable with larger sample'
          });
        }
        break;
        
      case 'text-readability':
        if (data.comments.length > 5) {
          adjustments.push({
            factor: 'suggestion-type',
            impact: 8,
            reason: 'Text readability assessment more reliable with user feedback'
          });
        }
        break;
        
      case 'visual-balance':
        const targetSlide = suggestion.targetSlideIndex;
        const slideInteractions = data.interactions.filter(i => i.slideIndex === targetSlide);
        if (slideInteractions.length < 3) {
          adjustments.push({
            factor: 'suggestion-type',
            impact: -10,
            reason: 'Visual balance assessment requires more interaction data'
          });
        }
        break;
    }

    // Cross-validation adjustment
    const supportingPatterns = analysis.engagementPatterns.filter(pattern =>
      pattern.slideIndexes.includes(suggestion.targetSlideIndex) &&
      this.isPatternRelevant(pattern.type, suggestion.type)
    );

    if (supportingPatterns.length > 1) {
      adjustments.push({
        factor: 'cross-validation',
        impact: 15,
        reason: 'Multiple supporting patterns increase confidence'
      });
    } else if (supportingPatterns.length === 0) {
      adjustments.push({
        factor: 'cross-validation',
        impact: -8,
        reason: 'No supporting patterns reduce confidence'
      });
    }

    // Consistency adjustment
    const similarSuggestions = this.findSimilarSuggestions(suggestion, analysis);
    if (similarSuggestions > 2) {
      adjustments.push({
        factor: 'consistency',
        impact: 8,
        reason: 'Consistent patterns across slides increase confidence'
      });
    }

    return adjustments;
  }

  /**
   * Calculate base confidence score from weighted factors
   */
  private calculateBaseScore(factors: ConfidenceFactors): number {
    const weights = {
      dataQuality: 0.25,
      patternStrength: 0.30,
      evidenceSupport: 0.25,
      sampleSize: 0.15,
      recency: 0.05
    };

    return (
      factors.dataQuality * weights.dataQuality +
      factors.patternStrength * weights.patternStrength +
      factors.evidenceSupport * weights.evidenceSupport +
      factors.sampleSize * weights.sampleSize +
      factors.recency * weights.recency
    );
  }

  /**
   * Apply adjustments to base score
   */
  private applyAdjustments(baseScore: number, adjustments: ConfidenceAdjustment[]): number {
    return adjustments.reduce((score, adjustment) => {
      return score + adjustment.impact;
    }, baseScore);
  }

  /**
   * Generate human-readable reasoning for confidence score
   */
  private generateReasoning(
    factors: ConfidenceFactors,
    adjustments: ConfidenceAdjustment[],
    finalScore: number
  ): string {
    const parts: string[] = [];

    // Describe overall confidence level
    if (finalScore >= 80) {
      parts.push('High confidence based on strong data quality and clear patterns.');
    } else if (finalScore >= 60) {
      parts.push('Medium confidence with adequate supporting evidence.');
    } else if (finalScore >= 40) {
      parts.push('Low-medium confidence due to limited data or weak patterns.');
    } else {
      parts.push('Low confidence - suggestion based on limited evidence.');
    }

    // Highlight key factors
    const keyFactors = Object.entries(factors)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2);

    if (keyFactors.length > 0) {
      const factorNames = {
        dataQuality: 'data quality',
        patternStrength: 'pattern strength',
        evidenceSupport: 'supporting evidence',
        sampleSize: 'sample size',
        recency: 'data recency'
      };

      const topFactors = keyFactors
        .map(([key, value]) => `${factorNames[key as keyof typeof factorNames]} (${Math.round(value)}%)`)
        .join(' and ');
      
      parts.push(`Strongest factors: ${topFactors}.`);
    }

    // Mention significant adjustments
    const significantAdjustments = adjustments.filter(adj => Math.abs(adj.impact) >= 8);
    if (significantAdjustments.length > 0) {
      const adjDescriptions = significantAdjustments
        .map(adj => `${adj.impact > 0 ? 'boosted' : 'reduced'} by ${adj.reason.toLowerCase()}`)
        .join(', ');
      
      parts.push(`Confidence ${adjDescriptions}.`);
    }

    return parts.join(' ');
  }

  /**
   * Check if a pattern type is relevant to a suggestion type
   */
  private isPatternRelevant(patternType: EngagementPattern['type'], suggestionType: Suggestion['type']): boolean {
    const relevanceMap: Record<string, string[]> = {
      'drop-off': ['engagement-optimization', 'content-density'],
      'high-bounce': ['engagement-optimization', 'layout-improvement'],
      'low-interaction': ['layout-improvement', 'visual-balance'],
      'engagement-spike': ['engagement-optimization']
    };

    return relevanceMap[patternType]?.includes(suggestionType) || false;
  }

  /**
   * Find similar suggestions in the analysis (for consistency checking)
   */
  private findSimilarSuggestions(suggestion: Suggestion, analysis: AnalysisResult): number {
    // This would typically compare against other suggestions in a full analysis
    // For now, we'll estimate based on patterns
    return analysis.engagementPatterns.filter(pattern =>
      this.isPatternRelevant(pattern.type, suggestion.type)
    ).length;
  }

  /**
   * Batch calculate confidence scores for multiple suggestions
   */
  calculateBatchConfidence(
    suggestions: Suggestion[],
    data: EngagementData,
    analysis: AnalysisResult
  ): Map<string, ConfidenceBreakdown> {
    const results = new Map<string, ConfidenceBreakdown>();

    for (const suggestion of suggestions) {
      const breakdown = this.calculateConfidence(suggestion, data, analysis);
      results.set(suggestion.id, breakdown);
      
      // Update suggestion with calculated confidence
      suggestion.confidenceScore = breakdown.finalScore;
    }

    return results;
  }
}