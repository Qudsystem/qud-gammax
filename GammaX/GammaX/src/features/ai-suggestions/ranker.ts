/**
 * Suggestion Ranking Algorithm
 * Ranks suggestions by confidence score and applies additional ranking factors
 */

import { Suggestion, SuggestionType, EngagementData } from './types';

export interface RankingFactors {
  confidenceScore: number;    // Primary ranking factor (0-100)
  impactWeight: number;       // Weight based on impact level (0-1)
  urgencyScore: number;       // How urgent this suggestion is (0-100)
  implementationEase: number; // How easy to implement (0-100)
  userPriority: number;       // User-defined priority (0-100)
}

export interface RankingResult {
  suggestion: Suggestion;
  finalScore: number;
  factors: RankingFactors;
  rank: number;
}

export class SuggestionRanker {
  private readonly IMPACT_WEIGHTS = {
    'High': 1.0,
    'Medium': 0.8,
    'Low': 0.6
  };

  private readonly TYPE_URGENCY_SCORES = {
    'engagement-optimization': 90,
    'content-density': 80,
    'text-readability': 75,
    'visual-balance': 70,
    'layout-improvement': 65
  };

  private readonly TYPE_IMPLEMENTATION_EASE = {
    'text-readability': 90,
    'content-density': 85,
    'layout-improvement': 70,
    'visual-balance': 65,
    'engagement-optimization': 60
  };

  /**
   * Rank suggestions by confidence score and other factors
   */
  rankSuggestions(suggestions: Suggestion[]): Suggestion[] {
    if (suggestions.length === 0) {
      return [];
    }

    // Calculate ranking scores for each suggestion
    const rankingResults = suggestions.map(suggestion => {
      const factors = this.calculateRankingFactors(suggestion);
      const finalScore = this.calculateFinalScore(factors);
      
      return {
        suggestion,
        finalScore,
        factors,
        rank: 0 // Will be set after sorting
      };
    });

    // Sort by final score (descending)
    rankingResults.sort((a, b) => b.finalScore - a.finalScore);

    // Assign ranks and handle ties
    this.assignRanks(rankingResults);

    // Apply ranking adjustments for diversity and balance
    const adjustedResults = this.applyDiversityAdjustments(rankingResults);

    // Return sorted suggestions
    return adjustedResults.map(result => result.suggestion);
  }

  /**
   * Calculate ranking factors for a suggestion
   */
  private calculateRankingFactors(suggestion: Suggestion): RankingFactors {
    return {
      confidenceScore: suggestion.confidenceScore,
      impactWeight: this.IMPACT_WEIGHTS[suggestion.impactLevel],
      urgencyScore: this.calculateUrgencyScore(suggestion),
      implementationEase: this.calculateImplementationEase(suggestion),
      userPriority: this.calculateUserPriority(suggestion)
    };
  }

  /**
   * Calculate urgency score based on suggestion type and content
   */
  private calculateUrgencyScore(suggestion: Suggestion): number {
    let baseUrgency = this.TYPE_URGENCY_SCORES[suggestion.type] || 50;

    // Adjust based on suggestion content and context
    const urgencyKeywords = {
      high: ['critical', 'urgent', 'immediate', 'severe', 'major'],
      medium: ['important', 'significant', 'notable'],
      low: ['minor', 'optional', 'consider', 'might']
    };

    const description = suggestion.description.toLowerCase();
    const rationale = suggestion.rationale.toLowerCase();
    const combinedText = `${description} ${rationale}`;

    if (urgencyKeywords.high.some(keyword => combinedText.includes(keyword))) {
      baseUrgency += 15;
    } else if (urgencyKeywords.medium.some(keyword => combinedText.includes(keyword))) {
      baseUrgency += 8;
    } else if (urgencyKeywords.low.some(keyword => combinedText.includes(keyword))) {
      baseUrgency -= 10;
    }

    // Adjust based on target slide position (earlier slides are more urgent)
    if (suggestion.targetSlideIndex === 0) {
      baseUrgency += 10; // Opening slide is critical
    } else if (suggestion.targetSlideIndex <= 2) {
      baseUrgency += 5; // Early slides are important
    }

    // Adjust based on impact level
    switch (suggestion.impactLevel) {
      case 'High':
        baseUrgency += 10;
        break;
      case 'Low':
        baseUrgency -= 5;
        break;
    }

    return Math.max(0, Math.min(100, baseUrgency));
  }

  /**
   * Calculate implementation ease score
   */
  private calculateImplementationEase(suggestion: Suggestion): number {
    let baseEase = this.TYPE_IMPLEMENTATION_EASE[suggestion.type] || 70;

    // Adjust based on action complexity
    const action = suggestion.action;
    
    switch (action.type) {
      case 'modify-text':
        baseEase += 10; // Text changes are usually easy
        break;
      case 'adjust-layout':
        baseEase -= 5; // Layout changes require more work
        break;
      case 'add-visual':
        baseEase -= 15; // Adding visuals requires design work
        break;
      case 'simplify-content':
        baseEase += 5; // Simplification is usually straightforward
        break;
    }

    // Adjust based on parameter complexity
    const paramCount = Object.keys(action.parameters || {}).length;
    if (paramCount > 5) {
      baseEase -= 10; // Many parameters suggest complexity
    } else if (paramCount <= 2) {
      baseEase += 5; // Few parameters suggest simplicity
    }

    // Check for complex operations in parameters
    const complexOperations = ['restructure', 'redesign', 'rebuild', 'major-change'];
    const hasComplexOp = Object.values(action.parameters || {}).some(value =>
      typeof value === 'string' && complexOperations.some(op => value.includes(op))
    );

    if (hasComplexOp) {
      baseEase -= 20;
    }

    return Math.max(0, Math.min(100, baseEase));
  }

  /**
   * Calculate user priority score (placeholder for future user preferences)
   */
  private calculateUserPriority(suggestion: Suggestion): number {
    // This would integrate with user preferences in a real implementation
    // For now, we'll use suggestion type preferences
    
    const defaultPriorities = {
      'engagement-optimization': 85,
      'content-density': 80,
      'text-readability': 75,
      'visual-balance': 70,
      'layout-improvement': 65
    };

    return defaultPriorities[suggestion.type] || 70;
  }

  /**
   * Calculate final ranking score from factors
   */
  private calculateFinalScore(factors: RankingFactors): number {
    // Weighted combination of factors
    const weights = {
      confidence: 0.40,      // Confidence is most important
      impact: 0.25,          // Impact level matters significantly
      urgency: 0.20,         // Urgency affects prioritization
      ease: 0.10,            // Implementation ease for quick wins
      userPriority: 0.05     // User preferences (future enhancement)
    };

    const weightedConfidence = factors.confidenceScore * weights.confidence;
    const weightedImpact = (factors.impactWeight * 100) * weights.impact;
    const weightedUrgency = factors.urgencyScore * weights.urgency;
    const weightedEase = factors.implementationEase * weights.ease;
    const weightedUserPriority = factors.userPriority * weights.userPriority;

    return weightedConfidence + weightedImpact + weightedUrgency + 
           weightedEase + weightedUserPriority;
  }

  /**
   * Assign ranks to suggestions, handling ties appropriately
   */
  private assignRanks(results: RankingResult[]): void {
    let currentRank = 1;
    
    for (let i = 0; i < results.length; i++) {
      if (i > 0 && results[i].finalScore < results[i - 1].finalScore) {
        currentRank = i + 1;
      }
      results[i].rank = currentRank;
    }
  }

  /**
   * Apply diversity adjustments to ensure balanced suggestion types
   */
  private applyDiversityAdjustments(results: RankingResult[]): RankingResult[] {
    // Group suggestions by type
    const typeGroups = new Map<SuggestionType, RankingResult[]>();
    
    results.forEach(result => {
      const type = result.suggestion.type;
      if (!typeGroups.has(type)) {
        typeGroups.set(type, []);
      }
      typeGroups.get(type)!.push(result);
    });

    // If we have too many suggestions of the same type, apply diversity penalty
    const maxSameType = Math.max(2, Math.ceil(results.length / 3));
    
    typeGroups.forEach((groupResults, type) => {
      if (groupResults.length > maxSameType) {
        // Apply increasing penalty to lower-ranked suggestions of the same type
        groupResults.slice(maxSameType).forEach((result, index) => {
          const penalty = (index + 1) * 5; // Increasing penalty
          result.finalScore = Math.max(0, result.finalScore - penalty);
        });
      }
    });

    // Re-sort after diversity adjustments
    results.sort((a, b) => b.finalScore - a.finalScore);
    this.assignRanks(results);

    return results;
  }

  /**
   * Get top N suggestions with optional filtering
   */
  getTopSuggestions(
    suggestions: Suggestion[], 
    count: number = 5,
    filters?: {
      minConfidence?: number;
      includeTypes?: SuggestionType[];
      excludeTypes?: SuggestionType[];
      impactLevels?: ('High' | 'Medium' | 'Low')[];
    }
  ): Suggestion[] {
    let filtered = suggestions;

    // Apply filters if provided
    if (filters) {
      filtered = suggestions.filter(suggestion => {
        if (filters.minConfidence && suggestion.confidenceScore < filters.minConfidence) {
          return false;
        }
        
        if (filters.includeTypes && !filters.includeTypes.includes(suggestion.type)) {
          return false;
        }
        
        if (filters.excludeTypes && filters.excludeTypes.includes(suggestion.type)) {
          return false;
        }
        
        if (filters.impactLevels && !filters.impactLevels.includes(suggestion.impactLevel)) {
          return false;
        }
        
        return true;
      });
    }

    // Rank and return top N
    const ranked = this.rankSuggestions(filtered);
    return ranked.slice(0, count);
  }

  /**
   * Rank suggestions with custom weights
   */
  rankWithCustomWeights(
    suggestions: Suggestion[],
    customWeights: {
      confidence?: number;
      impact?: number;
      urgency?: number;
      ease?: number;
      userPriority?: number;
    }
  ): Suggestion[] {
    if (suggestions.length === 0) {
      return [];
    }

    // Normalize weights to sum to 1
    const totalWeight = Object.values(customWeights).reduce((sum, weight) => sum + (weight || 0), 0);
    const normalizedWeights = Object.fromEntries(
      Object.entries(customWeights).map(([key, weight]) => [key, (weight || 0) / totalWeight])
    );

    // Calculate custom scores
    const results = suggestions.map(suggestion => {
      const factors = this.calculateRankingFactors(suggestion);
      
      const customScore = (
        (factors.confidenceScore * (normalizedWeights.confidence || 0)) +
        ((factors.impactWeight * 100) * (normalizedWeights.impact || 0)) +
        (factors.urgencyScore * (normalizedWeights.urgency || 0)) +
        (factors.implementationEase * (normalizedWeights.ease || 0)) +
        (factors.userPriority * (normalizedWeights.userPriority || 0))
      );

      return {
        suggestion,
        finalScore: customScore,
        factors,
        rank: 0
      };
    });

    // Sort and assign ranks
    results.sort((a, b) => b.finalScore - a.finalScore);
    this.assignRanks(results);

    return results.map(result => result.suggestion);
  }

  /**
   * Get ranking explanation for a suggestion
   */
  getRankingExplanation(suggestion: Suggestion, allSuggestions: Suggestion[]): string {
    const factors = this.calculateRankingFactors(suggestion);
    const finalScore = this.calculateFinalScore(factors);
    
    const ranked = this.rankSuggestions(allSuggestions);
    const rank = ranked.findIndex(s => s.id === suggestion.id) + 1;
    
    const parts: string[] = [];
    
    parts.push(`Ranked #${rank} out of ${allSuggestions.length} suggestions.`);
    
    parts.push(`Final score: ${Math.round(finalScore)}/100.`);
    
    // Highlight strongest factors
    const factorScores = [
      { name: 'confidence', score: factors.confidenceScore },
      { name: 'impact', score: factors.impactWeight * 100 },
      { name: 'urgency', score: factors.urgencyScore },
      { name: 'ease of implementation', score: factors.implementationEase }
    ].sort((a, b) => b.score - a.score);
    
    const topFactor = factorScores[0];
    parts.push(`Strongest factor: ${topFactor.name} (${Math.round(topFactor.score)}%).`);
    
    // Mention impact level
    parts.push(`${suggestion.impactLevel} impact suggestion.`);
    
    return parts.join(' ');
  }

  /**
   * Compare two suggestions and explain ranking difference
   */
  compareRankings(suggestion1: Suggestion, suggestion2: Suggestion): string {
    const factors1 = this.calculateRankingFactors(suggestion1);
    const factors2 = this.calculateRankingFactors(suggestion2);
    
    const score1 = this.calculateFinalScore(factors1);
    const score2 = this.calculateFinalScore(factors2);
    
    const winner = score1 > score2 ? suggestion1 : suggestion2;
    const loser = score1 > score2 ? suggestion2 : suggestion1;
    const winnerFactors = score1 > score2 ? factors1 : factors2;
    const loserFactors = score1 > score2 ? factors2 : factors1;
    
    const scoreDiff = Math.abs(score1 - score2);
    
    const parts: string[] = [];
    parts.push(`"${winner.title}" ranks higher than "${loser.title}" by ${Math.round(scoreDiff)} points.`);
    
    // Find the biggest factor difference
    const factorDiffs = [
      { name: 'confidence', diff: winnerFactors.confidenceScore - loserFactors.confidenceScore },
      { name: 'impact', diff: (winnerFactors.impactWeight - loserFactors.impactWeight) * 100 },
      { name: 'urgency', diff: winnerFactors.urgencyScore - loserFactors.urgencyScore },
      { name: 'implementation ease', diff: winnerFactors.implementationEase - loserFactors.implementationEase }
    ].sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
    
    const biggestDiff = factorDiffs[0];
    if (Math.abs(biggestDiff.diff) > 5) {
      const direction = biggestDiff.diff > 0 ? 'higher' : 'lower';
      parts.push(`Main difference: ${biggestDiff.name} is ${Math.round(Math.abs(biggestDiff.diff))} points ${direction}.`);
    }
    
    return parts.join(' ');
  }
}

// Export singleton instance
export const suggestionRanker = new SuggestionRanker();