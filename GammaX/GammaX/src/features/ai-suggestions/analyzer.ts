/**
 * AI Analyzer for processing engagement data and generating insights
 */

import { aiService } from '../../core/services/aiService';
import { 
  EngagementData, 
  AnalysisResult, 
  EngagementPattern, 
  Suggestion,
  SuggestionType 
} from './types';

export class AIAnalyzer {
  private readonly MIN_VIEWS_FOR_ANALYSIS = 5;
  private readonly HIGH_DROPOFF_THRESHOLD = 0.3;
  private readonly LOW_ENGAGEMENT_THRESHOLD = 0.1;

  /**
   * Analyze engagement data and generate insights
   */
  async analyzeEngagement(data: EngagementData): Promise<AnalysisResult> {
    // Validate data sufficiency
    if (data.views < this.MIN_VIEWS_FOR_ANALYSIS) {
      return this.generateMinimalAnalysis(data);
    }

    try {
      // Parallel analysis of different aspects
      const [
        contentDensityScores,
        visualBalanceScores,
        readabilityScores,
        engagementPatterns
      ] = await Promise.all([
        this.analyzeContentDensity(data),
        this.analyzeVisualBalance(data),
        this.analyzeReadability(data),
        this.identifyEngagementPatterns(data)
      ]);

      const overallScore = this.calculateOverallScore({
        contentDensityScores,
        visualBalanceScores,
        readabilityScores,
        engagementPatterns
      });

      return {
        contentDensityScores,
        visualBalanceScores,
        readabilityScores,
        engagementPatterns,
        overallScore
      };
    } catch (error) {
      console.error('AI Analysis failed:', error);
      return this.generateFallbackAnalysis(data);
    }
  }

  /**
   * Analyze content density across slides
   */
  private async analyzeContentDensity(data: EngagementData): Promise<number[]> {
    const scores: number[] = [];
    
    // Analyze drop-off patterns to infer content density issues
    for (const [slideIndex, dropOffRate] of data.dropOffRates) {
      let score = 100; // Start with perfect score
      
      // High drop-off suggests content density issues
      if (dropOffRate > this.HIGH_DROPOFF_THRESHOLD) {
        score -= (dropOffRate - this.HIGH_DROPOFF_THRESHOLD) * 200;
      }
      
      // Check for interaction patterns
      const slideInteractions = data.interactions.filter(i => i.slideIndex === slideIndex);
      const interactionRate = slideInteractions.length / Math.max(data.views, 1);
      
      if (interactionRate < this.LOW_ENGAGEMENT_THRESHOLD) {
        score -= 20; // Low interaction suggests content issues
      }
      
      scores[slideIndex] = Math.max(0, Math.min(100, score));
    }

    return scores;
  }

  /**
   * Analyze visual balance across slides
   */
  private async analyzeVisualBalance(data: EngagementData): Promise<number[]> {
    const scores: number[] = [];
    
    // Use interaction patterns to infer visual balance
    for (const [slideIndex] of data.dropOffRates) {
      let score = 80; // Default good score
      
      const slideInteractions = data.interactions.filter(i => i.slideIndex === slideIndex);
      const hoverInteractions = slideInteractions.filter(i => i.type === 'hover');
      const clickInteractions = slideInteractions.filter(i => i.type === 'click');
      
      // Good visual balance should have balanced hover/click ratio
      const hoverToClickRatio = hoverInteractions.length / Math.max(clickInteractions.length, 1);
      
      if (hoverToClickRatio > 3) {
        score -= 15; // Too many hovers suggest unclear clickable elements
      } else if (hoverToClickRatio < 0.5) {
        score += 10; // Good click-through rate
      }
      
      // Check for scroll interactions (suggests content overflow)
      const scrollInteractions = slideInteractions.filter(i => i.type === 'scroll');
      if (scrollInteractions.length > data.views * 0.2) {
        score -= 20; // Too much scrolling suggests layout issues
      }
      
      scores[slideIndex] = Math.max(0, Math.min(100, score));
    }

    return scores;
  }

  /**
   * Analyze text readability across slides
   */
  private async analyzeReadability(data: EngagementData): Promise<number[]> {
    const scores: number[] = [];
    
    // Use comment sentiment and interaction duration to infer readability
    for (const [slideIndex] of data.dropOffRates) {
      let score = 75; // Default moderate score
      
      // Check comments for readability issues
      const slideComments = data.comments.filter(c => c.slideIndex === slideIndex);
      const negativeKeywords = ['confusing', 'unclear', 'hard to read', 'difficult', 'complex'];
      
      const negativeComments = slideComments.filter(comment => 
        negativeKeywords.some(keyword => 
          comment.content.toLowerCase().includes(keyword)
        )
      );
      
      if (negativeComments.length > 0) {
        score -= negativeComments.length * 15;
      }
      
      // Check hover duration (longer hovers might indicate reading difficulty)
      const hoverInteractions = data.interactions.filter(
        i => i.slideIndex === slideIndex && i.type === 'hover' && i.duration
      );
      
      const avgHoverDuration = hoverInteractions.reduce((sum, i) => sum + (i.duration || 0), 0) / 
                              Math.max(hoverInteractions.length, 1);
      
      if (avgHoverDuration > 10000) { // More than 10 seconds
        score -= 10; // Might indicate reading difficulty
      } else if (avgHoverDuration > 3000 && avgHoverDuration < 8000) {
        score += 5; // Good engagement time
      }
      
      scores[slideIndex] = Math.max(0, Math.min(100, score));
    }

    return scores;
  }

  /**
   * Identify engagement patterns in the data
   */
  private async identifyEngagementPatterns(data: EngagementData): Promise<EngagementPattern[]> {
    const patterns: EngagementPattern[] = [];
    
    // Identify drop-off patterns
    const highDropOffSlides = Array.from(data.dropOffRates.entries())
      .filter(([_, rate]) => rate > this.HIGH_DROPOFF_THRESHOLD)
      .map(([slideIndex]) => slideIndex);
    
    if (highDropOffSlides.length > 0) {
      patterns.push({
        type: 'drop-off',
        slideIndexes: highDropOffSlides,
        severity: highDropOffSlides.length > 2 ? 'high' : 'medium',
        description: `High drop-off rates detected on ${highDropOffSlides.length} slide(s)`
      });
    }
    
    // Identify engagement spikes
    const interactionsBySlide = new Map<number, number>();
    data.interactions.forEach(interaction => {
      const count = interactionsBySlide.get(interaction.slideIndex) || 0;
      interactionsBySlide.set(interaction.slideIndex, count + 1);
    });
    
    const avgInteractions = Array.from(interactionsBySlide.values())
      .reduce((sum, count) => sum + count, 0) / Math.max(interactionsBySlide.size, 1);
    
    const highEngagementSlides = Array.from(interactionsBySlide.entries())
      .filter(([_, count]) => count > avgInteractions * 1.5)
      .map(([slideIndex]) => slideIndex);
    
    if (highEngagementSlides.length > 0) {
      patterns.push({
        type: 'engagement-spike',
        slideIndexes: highEngagementSlides,
        severity: 'low',
        description: `High engagement detected on ${highEngagementSlides.length} slide(s)`
      });
    }
    
    // Identify low interaction patterns
    const lowInteractionSlides = Array.from(interactionsBySlide.entries())
      .filter(([_, count]) => count < avgInteractions * 0.3)
      .map(([slideIndex]) => slideIndex);
    
    if (lowInteractionSlides.length > 0) {
      patterns.push({
        type: 'low-interaction',
        slideIndexes: lowInteractionSlides,
        severity: lowInteractionSlides.length > 3 ? 'high' : 'medium',
        description: `Low interaction rates on ${lowInteractionSlides.length} slide(s)`
      });
    }
    
    // Identify high bounce pattern (early exit)
    const earlySlideDropOffs = Array.from(data.dropOffRates.entries())
      .filter(([slideIndex, rate]) => slideIndex < 3 && rate > 0.4)
      .map(([slideIndex]) => slideIndex);
    
    if (earlySlideDropOffs.length > 0) {
      patterns.push({
        type: 'high-bounce',
        slideIndexes: earlySlideDropOffs,
        severity: 'high',
        description: 'High bounce rate detected in opening slides'
      });
    }
    
    return patterns;
  }

  /**
   * Calculate overall presentation score
   */
  private calculateOverallScore(analysis: Omit<AnalysisResult, 'overallScore'>): number {
    const { contentDensityScores, visualBalanceScores, readabilityScores, engagementPatterns } = analysis;
    
    // Calculate average scores
    const avgContentDensity = this.calculateAverage(contentDensityScores);
    const avgVisualBalance = this.calculateAverage(visualBalanceScores);
    const avgReadability = this.calculateAverage(readabilityScores);
    
    // Weight the scores
    let overallScore = (
      avgContentDensity * 0.3 +
      avgVisualBalance * 0.25 +
      avgReadability * 0.25
    );
    
    // Apply pattern penalties
    const severityPenalties = { low: 2, medium: 5, high: 10 };
    const patternPenalty = engagementPatterns.reduce((penalty, pattern) => {
      return penalty + severityPenalties[pattern.severity];
    }, 0);
    
    overallScore = Math.max(0, overallScore - patternPenalty);
    
    // Add engagement bonus
    const highEngagementPatterns = engagementPatterns.filter(p => p.type === 'engagement-spike');
    if (highEngagementPatterns.length > 0) {
      overallScore += highEngagementPatterns.length * 5;
    }
    
    return Math.min(100, Math.round(overallScore));
  }

  private calculateAverage(scores: number[]): number {
    if (scores.length === 0) return 0;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  /**
   * Generate minimal analysis for insufficient data
   */
  private generateMinimalAnalysis(data: EngagementData): AnalysisResult {
    const slideCount = Math.max(data.dropOffRates.size, 5);
    
    return {
      contentDensityScores: Array(slideCount).fill(50),
      visualBalanceScores: Array(slideCount).fill(50),
      readabilityScores: Array(slideCount).fill(50),
      engagementPatterns: [{
        type: 'low-interaction',
        slideIndexes: Array.from({ length: slideCount }, (_, i) => i),
        severity: 'medium',
        description: 'Insufficient data for detailed analysis'
      }],
      overallScore: 50
    };
  }

  /**
   * Generate fallback analysis when AI fails
   */
  private generateFallbackAnalysis(data: EngagementData): AnalysisResult {
    const slideCount = data.dropOffRates.size || 5;
    const patterns: EngagementPattern[] = [];
    
    // Simple rule-based analysis
    const highDropOffSlides = Array.from(data.dropOffRates.entries())
      .filter(([_, rate]) => rate > 0.25)
      .map(([slideIndex]) => slideIndex);
    
    if (highDropOffSlides.length > 0) {
      patterns.push({
        type: 'drop-off',
        slideIndexes: highDropOffSlides,
        severity: 'medium',
        description: 'Rule-based analysis detected potential issues'
      });
    }
    
    return {
      contentDensityScores: Array.from({ length: slideCount }, (_, i) => {
        const dropOff = data.dropOffRates.get(i) || 0.1;
        return Math.max(20, 100 - (dropOff * 100));
      }),
      visualBalanceScores: Array(slideCount).fill(70),
      readabilityScores: Array(slideCount).fill(65),
      engagementPatterns: patterns,
      overallScore: 60
    };
  }

  /**
   * Generate suggestions based on analysis results
   */
  async generateSuggestions(data: EngagementData, analysis: AnalysisResult): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    
    // Generate suggestions for each identified pattern
    for (const pattern of analysis.engagementPatterns) {
      const patternSuggestions = await this.generatePatternSuggestions(pattern, data, analysis);
      suggestions.push(...patternSuggestions);
    }
    
    // Generate suggestions for low-scoring slides
    const lowScoringSlides = analysis.contentDensityScores
      .map((score, index) => ({ score, index }))
      .filter(({ score }) => score < 60)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3); // Focus on worst 3 slides
    
    for (const { index: slideIndex, score } of lowScoringSlides) {
      const slideSuggestions = await this.generateSlideSuggestions(slideIndex, score, data, analysis);
      suggestions.push(...slideSuggestions);
    }
    
    // Limit to 8 suggestions and sort by confidence
    return suggestions
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, 8);
  }

  private async generatePatternSuggestions(
    pattern: EngagementPattern, 
    data: EngagementData, 
    analysis: AnalysisResult
  ): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    
    switch (pattern.type) {
      case 'drop-off':
        suggestions.push({
          id: `suggestion-dropoff-${Date.now()}`,
          type: 'engagement-optimization',
          targetSlideIndex: pattern.slideIndexes[0],
          title: 'Reduce Content Density',
          description: 'High drop-off rates suggest slides may be overwhelming. Consider breaking complex content into multiple slides.',
          rationale: `Drop-off rate of ${(data.dropOffRates.get(pattern.slideIndexes[0]) || 0) * 100}% is above the recommended 25% threshold.`,
          confidenceScore: 85,
          impactLevel: 'High',
          action: {
            type: 'simplify-content',
            parameters: { 
              slideIndexes: pattern.slideIndexes,
              strategy: 'split-content'
            }
          },
          createdAt: new Date()
        });
        break;
        
      case 'high-bounce':
        suggestions.push({
          id: `suggestion-bounce-${Date.now()}`,
          type: 'engagement-optimization',
          targetSlideIndex: 0,
          title: 'Improve Opening Hook',
          description: 'High bounce rate in opening slides. Start with a compelling question, statistic, or visual to capture attention.',
          rationale: 'Early slide drop-offs indicate weak opening engagement.',
          confidenceScore: 90,
          impactLevel: 'High',
          action: {
            type: 'modify-text',
            parameters: { 
              focus: 'opening-hook',
              suggestions: ['question', 'statistic', 'story']
            }
          },
          createdAt: new Date()
        });
        break;
        
      case 'low-interaction':
        suggestions.push({
          id: `suggestion-interaction-${Date.now()}`,
          type: 'layout-improvement',
          targetSlideIndex: pattern.slideIndexes[0],
          title: 'Add Interactive Elements',
          description: 'Low interaction rates suggest static content. Consider adding clickable elements, animations, or call-to-action buttons.',
          rationale: 'Slides with interactive elements see 40% higher engagement rates.',
          confidenceScore: 75,
          impactLevel: 'Medium',
          action: {
            type: 'add-visual',
            parameters: { 
              type: 'interactive',
              elements: ['buttons', 'animations', 'hover-effects']
            }
          },
          createdAt: new Date()
        });
        break;
    }
    
    return suggestions;
  }

  private async generateSlideSuggestions(
    slideIndex: number, 
    score: number, 
    data: EngagementData, 
    analysis: AnalysisResult
  ): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    
    // Check specific issues for this slide
    const slideComments = data.comments.filter(c => c.slideIndex === slideIndex);
    const hasNegativeFeedback = slideComments.some(c => 
      ['confusing', 'unclear', 'difficult'].some(keyword => 
        c.content.toLowerCase().includes(keyword)
      )
    );
    
    if (hasNegativeFeedback) {
      suggestions.push({
        id: `suggestion-clarity-${slideIndex}-${Date.now()}`,
        type: 'text-readability',
        targetSlideIndex: slideIndex,
        title: 'Improve Content Clarity',
        description: 'User feedback indicates confusion. Simplify language, add visual aids, or restructure information hierarchy.',
        rationale: 'Direct user feedback mentions clarity issues.',
        confidenceScore: 95,
        impactLevel: 'High',
        action: {
          type: 'modify-text',
          parameters: { 
            focus: 'clarity',
            techniques: ['simplify-language', 'add-visuals', 'restructure']
          }
        },
        createdAt: new Date()
      });
    }
    
    // Check visual balance issues
    if (analysis.visualBalanceScores[slideIndex] < 50) {
      suggestions.push({
        id: `suggestion-balance-${slideIndex}-${Date.now()}`,
        type: 'visual-balance',
        targetSlideIndex: slideIndex,
        title: 'Improve Visual Balance',
        description: 'Slide layout appears unbalanced. Consider redistributing content or adjusting visual hierarchy.',
        rationale: `Visual balance score of ${analysis.visualBalanceScores[slideIndex]} indicates layout issues.`,
        confidenceScore: 70,
        impactLevel: 'Medium',
        action: {
          type: 'adjust-layout',
          parameters: { 
            focus: 'visual-balance',
            adjustments: ['redistribute-content', 'adjust-spacing', 'improve-hierarchy']
          }
        },
        createdAt: new Date()
      });
    }
    
    return suggestions;
  }
}