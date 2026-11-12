/**
 * SuggestionManager - Core service for managing AI suggestions
 * 
 * Handles fetching, applying, dismissing, and ranking suggestions
 * Integrates with AI analysis and fallback suggestion systems
 */

import {
  Suggestion,
  EngagementData,
  AnalysisResult,
  SuggestionManager as ISuggestionManager,
  SuggestionType,
  AIAnalysisError,
  SuggestionError,
  DEFAULT_AI_CONFIG
} from './types';

import { kvStorage } from '../../core/services/kvStorage';
import { eventBus } from '../../core/services/eventBus';
import { AIAnalyzer } from './analyzer';
import { ConfidenceScorer } from './confidenceScorer';
import { FallbackSuggestionsGenerator } from './fallbackSuggestions';

export interface SuggestionManagerConfig {
  maxSuggestions: number;
  minConfidenceScore: number;
  enableAIAnalysis: boolean;
  enableFallbackSuggestions: boolean;
  cacheResults: boolean;
  cacheTimeout: number; // milliseconds
  analysisTimeout: number; // milliseconds
}

export const DEFAULT_SUGGESTION_MANAGER_CONFIG: SuggestionManagerConfig = {
  maxSuggestions: DEFAULT_AI_CONFIG.maxSuggestions,
  minConfidenceScore: DEFAULT_AI_CONFIG.minConfidenceScore,
  enableAIAnalysis: true,
  enableFallbackSuggestions: DEFAULT_AI_CONFIG.enableFallbackSuggestions,
  cacheResults: true,
  cacheTimeout: 300000, // 5 minutes
  analysisTimeout: DEFAULT_AI_CONFIG.analysisTimeout
};

interface CachedSuggestions {
  suggestions: Suggestion[];
  timestamp: number;
  presentationId: string;
}

interface DismissedSuggestion {
  suggestionId: string;
  presentationId: string;
  type: SuggestionType;
  dismissedAt: Date;
  reason?: string;
}

interface AppliedSuggestion {
  suggestionId: string;
  presentationId: string;
  appliedAt: Date;
  changes: any[];
}

export class SuggestionManager implements ISuggestionManager {
  private cache = new Map<string, CachedSuggestions>();
  private aiAnalyzer: AIAnalyzer;
  private confidenceScorer: ConfidenceScorer;
  private fallbackGenerator: FallbackSuggestionsGenerator;
  private config: SuggestionManagerConfig;
  private dismissalCache = new Map<string, DismissedSuggestion[]>();

  constructor(config: Partial<SuggestionManagerConfig> = {}) {
    this.config = { ...DEFAULT_SUGGESTION_MANAGER_CONFIG, ...config };
    this.aiAnalyzer = new AIAnalyzer();
    this.confidenceScorer = new ConfidenceScorer();
    this.fallbackGenerator = new FallbackSuggestionsGenerator();
  }

  /**
   * Fetch suggestions for a presentation
   */
  async fetchSuggestions(presentationId: string): Promise<Suggestion[]> {
    try {
      // Check cache first
      if (this.config.cacheResults) {
        const cached = this.getCachedSuggestions(presentationId);
        if (cached) {
          return cached;
        }
      }

      // Get engagement data
      const engagementData = await this.getEngagementData(presentationId);

      // Get dismissed suggestions to filter out
      const dismissedSuggestions = await this.getDismissedSuggestions(presentationId);
      const dismissedIds = new Set(dismissedSuggestions.map(d => d.suggestionId));

      let suggestions: Suggestion[] = [];

      // Try AI analysis first if enabled
      if (this.config.enableAIAnalysis && engagementData) {
        try {
          suggestions = await this.generateAISuggestions(engagementData);
        } catch (error) {
          console.warn('AI analysis failed, falling back to fallback suggestions:', error);
        }
      }

      // Use fallback suggestions if AI failed or is disabled
      if (suggestions.length === 0 && this.config.enableFallbackSuggestions) {
        suggestions = this.generateFallbackSuggestions(engagementData, presentationId);
      }

      // Filter out dismissed suggestions
      suggestions = suggestions.filter(s => !dismissedIds.has(s.id));

      // Rank and limit suggestions
      suggestions = this.rankSuggestions(suggestions);
      suggestions = suggestions.slice(0, this.config.maxSuggestions);

      // Filter by minimum confidence score
      suggestions = suggestions.filter(s => s.confidenceScore >= this.config.minConfidenceScore);

      // Cache results
      if (this.config.cacheResults) {
        this.setCachedSuggestions(presentationId, suggestions);
      }

      return suggestions;
    } catch (error) {
      throw new SuggestionError(
        `Failed to fetch suggestions for presentation ${presentationId}`,
        'FETCH_FAILED',
        presentationId
      );
    }
  }

  /**
   * Apply a suggestion to the presentation
   */
  async applySuggestion(suggestionId: string): Promise<void> {
    try {
      // Get suggestion details from storage or cache
      const suggestion = await this.getSuggestionById(suggestionId);
      if (!suggestion) {
        throw new SuggestionError(
          `Suggestion ${suggestionId} not found`,
          'SUGGESTION_NOT_FOUND',
          suggestionId
        );
      }

      // Store application record
      const appliedSuggestion: AppliedSuggestion = {
        suggestionId,
        presentationId: suggestion.presentationId || '',
        appliedAt: new Date(),
        changes: [] // This would contain the actual changes made
      };

      const appliedKey = `suggestions:applied:${suggestion.presentationId}`;
      const existingApplied = await kvStorage.get<AppliedSuggestion[]>(appliedKey) || [];
      existingApplied.push(appliedSuggestion);
      await kvStorage.set(appliedKey, existingApplied);

      // Clear cache for this presentation
      if (this.config.cacheResults && suggestion.presentationId) {
        this.cache.delete(suggestion.presentationId);
      }

      // Emit event for UI updates (using generic event type for now)
      eventBus.emit('suggestion-applied' as any, {
        suggestionId,
        presentationId: suggestion.presentationId,
        suggestion
      });

    } catch (error) {
      throw new SuggestionError(
        `Failed to apply suggestion ${suggestionId}`,
        'APPLICATION_FAILED',
        suggestionId
      );
    }
  }

  /**
   * Dismiss a suggestion
   */
  async dismissSuggestion(suggestionId: string): Promise<void> {
    try {
      // Get suggestion details to know which presentation it belongs to
      const suggestion = await this.getSuggestionById(suggestionId);
      if (!suggestion) {
        throw new SuggestionError(
          `Suggestion ${suggestionId} not found`,
          'SUGGESTION_NOT_FOUND',
          suggestionId
        );
      }

      const presentationId = suggestion.presentationId || '';

      // Create dismissal record
      const dismissedSuggestion: DismissedSuggestion = {
        suggestionId,
        presentationId,
        type: suggestion.type,
        dismissedAt: new Date()
      };

      // Store dismissal
      const dismissalKey = `suggestions:dismissals:${presentationId}`;
      const existingDismissals = await kvStorage.get<DismissedSuggestion[]>(dismissalKey) || [];

      // Check if already dismissed
      const alreadyDismissed = existingDismissals.some(d => d.suggestionId === suggestionId);
      if (!alreadyDismissed) {
        existingDismissals.push(dismissedSuggestion);
        await kvStorage.set(dismissalKey, existingDismissals);
      }

      // Update dismissal cache
      this.dismissalCache.set(presentationId, existingDismissals);

      // Clear suggestions cache for this presentation
      if (this.config.cacheResults) {
        this.cache.delete(presentationId);
      }

      // Emit event for UI updates (using generic event type for now)
      eventBus.emit('suggestion-dismissed' as any, {
        suggestionId,
        presentationId,
        suggestion
      });

    } catch (error) {
      throw new SuggestionError(
        `Failed to dismiss suggestion ${suggestionId}`,
        'DISMISSAL_FAILED',
        suggestionId
      );
    }
  }

  /**
   * Rank suggestions by confidence score (descending)
   */
  rankSuggestions(suggestions: Suggestion[]): Suggestion[] {
    // Create a copy to avoid mutating the original array
    return [...suggestions].sort((a, b) => b.confidenceScore - a.confidenceScore);
  }

  /**
   * Clear dismissal history for a presentation
   */
  async clearDismissalHistory(presentationId: string): Promise<void> {
    try {
      const dismissalKey = `suggestions:dismissals:${presentationId}`;
      await kvStorage.delete(dismissalKey);

      // Clear cache
      this.dismissalCache.delete(presentationId);

      // Clear suggestions cache to allow re-generation
      if (this.config.cacheResults) {
        this.cache.delete(presentationId);
      }
    } catch (error) {
      throw new SuggestionError(
        `Failed to clear dismissal history for presentation ${presentationId}`,
        'CLEAR_DISMISSALS_FAILED'
      );
    }
  }

  /**
   * Get dismissal statistics for a presentation
   */
  async getDismissalStats(presentationId: string): Promise<{
    totalDismissed: number;
    dismissedByType: Record<string, number>;
    recentDismissals: any[];
  }> {
    try {
      const dismissedSuggestions = await this.getDismissedSuggestions(presentationId);

      const dismissedByType: Record<string, number> = {};
      dismissedSuggestions.forEach(d => {
        dismissedByType[d.type] = (dismissedByType[d.type] || 0) + 1;
      });

      const recentDismissals = dismissedSuggestions
        .sort((a, b) => b.dismissedAt.getTime() - a.dismissedAt.getTime())
        .slice(0, 10);

      return {
        totalDismissed: dismissedSuggestions.length,
        dismissedByType,
        recentDismissals
      };
    } catch (error) {
      throw new SuggestionError(
        `Failed to get dismissal stats for presentation ${presentationId}`,
        'STATS_FAILED'
      );
    }
  }

  /**
   * Check if a suggestion is dismissed
   */
  async isSuggestionDismissed(presentationId: string, suggestionId: string): Promise<boolean> {
    try {
      const dismissedSuggestions = await this.getDismissedSuggestions(presentationId);
      return dismissedSuggestions.some(d => d.suggestionId === suggestionId);
    } catch (error) {
      console.warn(`Failed to check dismissal status for suggestion ${suggestionId}:`, error);
      return false;
    }
  }

  // Private helper methods

  private getCachedSuggestions(presentationId: string): Suggestion[] | null {
    const cached = this.cache.get(presentationId);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.config.cacheTimeout) {
      this.cache.delete(presentationId);
      return null;
    }

    return cached.suggestions;
  }

  private setCachedSuggestions(presentationId: string, suggestions: Suggestion[]): void {
    this.cache.set(presentationId, {
      suggestions,
      timestamp: Date.now(),
      presentationId
    });
  }

  private async getEngagementData(presentationId: string): Promise<EngagementData | null> {
    try {
      const engagementKey = `engagement:${presentationId}`;
      return await kvStorage.get<EngagementData>(engagementKey);
    } catch (error) {
      console.warn(`Failed to get engagement data for ${presentationId}:`, error);
      return null;
    }
  }

  private async getDismissedSuggestions(presentationId: string): Promise<DismissedSuggestion[]> {
    // Check cache first
    const cached = this.dismissalCache.get(presentationId);
    if (cached) return cached;

    try {
      const dismissalKey = `suggestions:dismissals:${presentationId}`;
      const dismissed = await kvStorage.get<DismissedSuggestion[]>(dismissalKey) || [];

      // Cache the result
      this.dismissalCache.set(presentationId, dismissed);

      return dismissed;
    } catch (error) {
      console.warn(`Failed to get dismissed suggestions for ${presentationId}:`, error);
      return [];
    }
  }

  private async generateAISuggestions(engagementData: EngagementData): Promise<Suggestion[]> {
    try {
      const analysis = await this.aiAnalyzer.analyzeEngagement(engagementData);
      const suggestions = await this.aiAnalyzer.generateSuggestions(engagementData, analysis);

      // Apply confidence scoring
      return suggestions.map(suggestion => {
        const confidenceBreakdown = this.confidenceScorer.calculateConfidence(suggestion, engagementData, analysis);
        return {
          ...suggestion,
          confidenceScore: confidenceBreakdown.finalScore
        };
      });
    } catch (error) {
      throw new AIAnalysisError(
        'Failed to generate AI suggestions',
        'AI_GENERATION_FAILED',
        error
      );
    }
  }

  private generateFallbackSuggestions(
    engagementData: EngagementData | null,
    presentationId: string
  ): Suggestion[] {
    if (!engagementData || this.fallbackGenerator.isDataInsufficient(engagementData)) {
      return this.fallbackGenerator.generateFallbackSuggestions(engagementData || {
        presentationId,
        views: 0,
        averageViewTime: 0,
        dropOffRates: new Map(),
        comments: [],
        interactions: [],
        lastUpdated: new Date()
      });
    }

    // Generate contextual fallbacks based on available data
    return this.fallbackGenerator.generateContextualFallbacks(
      this.analyzeContentContext(engagementData),
      presentationId
    );
  }

  private analyzeContentContext(engagementData: EngagementData): any {
    // Simple heuristics to determine content characteristics
    const hasHighDropOff = Array.from(engagementData.dropOffRates.values()).some(rate => rate > 0.3);
    const hasComments = engagementData.comments.length > 0;
    const hasInteractions = engagementData.interactions.length > 0;
    const lowEngagement = engagementData.views < 10 || engagementData.averageViewTime < 60;

    return {
      hasTextHeavySlides: hasHighDropOff,
      hasLongSlides: engagementData.averageViewTime > 300,
      hasNoVisuals: !hasInteractions,
      hasComplexContent: hasComments && hasHighDropOff,
      isLongPresentation: engagementData.dropOffRates.size > 10
    };
  }

  private async getSuggestionById(suggestionId: string): Promise<Suggestion | null> {
    // This is a simplified implementation
    // In a real scenario, you might need to search through cached suggestions
    // or maintain a separate index of suggestions by ID

    for (const cached of this.cache.values()) {
      const suggestion = cached.suggestions.find(s => s.id === suggestionId);
      if (suggestion) {
        return suggestion;
      }
    }

    return null;
  }

  /**
   * Update manager configuration
   */
  updateConfig(newConfig: Partial<SuggestionManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Clear cache if caching was disabled
    if (!newConfig.cacheResults) {
      this.cache.clear();
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): SuggestionManagerConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const suggestionManager = new SuggestionManager();