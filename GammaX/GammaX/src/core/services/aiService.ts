import { spark } from '@github/spark';

export interface AIServiceConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
}

export interface AIAnalysisRequest {
  presentationId: string;
  engagementData: EngagementData;
  analysisType: 'suggestions' | 'content' | 'structure';
}

export interface AIAnalysisResponse {
  suggestions: Suggestion[];
  confidence: number;
  processingTime: number;
}

export interface EngagementData {
  presentationId: string;
  views: number;
  averageViewTime: number;
  dropOffRates: Map<number, number>;
  comments: CommentData[];
  interactions: InteractionEvent[];
}

export interface Suggestion {
  id: string;
  type: SuggestionType;
  targetSlideIndex: number;
  title: string;
  description: string;
  rationale: string;
  confidenceScore: number;
  impactLevel: 'High' | 'Medium' | 'Low';
  action: SuggestionAction;
  createdAt: Date;
}

export type SuggestionType = 
  | 'content-density'
  | 'visual-balance'
  | 'text-readability'
  | 'engagement-optimization'
  | 'layout-improvement';

export interface SuggestionAction {
  type: 'modify-text' | 'adjust-layout' | 'add-visual' | 'simplify-content';
  parameters: Record<string, any>;
}

export interface CommentData {
  id: string;
  slideIndex: number;
  content: string;
  timestamp: Date;
  userId: string;
}

export interface InteractionEvent {
  type: 'click' | 'hover' | 'scroll' | 'annotation' | 'comment';
  slideIndex: number;
  elementId?: string;
  timestamp: Date;
  userId?: string;
}

export class AIService {
  private config: AIServiceConfig;
  private retryCount = 3;
  private retryDelay = 1000;

  constructor(config: AIServiceConfig = {}) {
    this.config = {
      timeout: 30000,
      ...config
    };
  }

  /**
   * Analyze engagement data and generate improvement suggestions
   */
  async generateSuggestions(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const startTime = Date.now();
    
    try {
      const prompt = this.buildSuggestionsPrompt(request.engagementData);
      
      const response = await this.callSparkAPI(prompt, {
        mode: 'json',
        temperature: 0.7,
        maxTokens: 2000
      });

      const suggestions = this.parseSuggestionsResponse(response);
      const rankedSuggestions = this.rankSuggestions(suggestions);
      
      return {
        suggestions: rankedSuggestions,
        confidence: this.calculateOverallConfidence(rankedSuggestions),
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      
      // Fallback to rule-based suggestions
      return this.generateFallbackSuggestions(request.engagementData);
    }
  }

  /**
   * Generate content improvements using AI
   */
  async improveContent(content: string, context: string): Promise<string> {
    try {
      const prompt = `
        Improve the following presentation content to be more engaging and clear:
        
        Context: ${context}
        Content: ${content}
        
        Provide improved version that is:
        - More concise and impactful
        - Better structured
        - More engaging for the audience
        
        Return only the improved content without explanations.
      `;

      return await this.callSparkAPI(prompt, {
        temperature: 0.5,
        maxTokens: 1000
      });
    } catch (error) {
      console.error('Content improvement error:', error);
      return content; // Return original if AI fails
    }
  }

  /**
   * Analyze slide structure and suggest improvements
   */
  async analyzeStructure(slides: any[]): Promise<any> {
    try {
      const prompt = this.buildStructureAnalysisPrompt(slides);
      
      const response = await this.callSparkAPI(prompt, {
        mode: 'json',
        temperature: 0.3,
        maxTokens: 1500
      });

      return JSON.parse(response);
    } catch (error) {
      console.error('Structure analysis error:', error);
      return { recommendations: [] };
    }
  }

  private async callSparkAPI(prompt: string, options: any = {}): Promise<string> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.retryCount; attempt++) {
      try {
        const response = await spark.llm.generate({
          prompt,
          ...options
        });
        
        return response.text || response;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.retryCount - 1) {
          await this.delay(this.retryDelay * Math.pow(2, attempt));
        }
      }
    }
    
    throw lastError || new Error('AI service failed after retries');
  }

  private buildSuggestionsPrompt(data: EngagementData): string {
    return `
      Analyze this presentation engagement data and provide 5-8 improvement suggestions:
      
      Presentation ID: ${data.presentationId}
      Total Views: ${data.views}
      Average View Time: ${data.averageViewTime}s
      Drop-off Rates: ${JSON.stringify(Object.fromEntries(data.dropOffRates))}
      Comments: ${data.comments.length}
      Interactions: ${data.interactions.length}
      
      For each suggestion, provide:
      - type: one of content-density, visual-balance, text-readability, engagement-optimization, layout-improvement
      - targetSlideIndex: specific slide number (0-based)
      - title: brief suggestion title
      - description: detailed explanation
      - rationale: why this will improve engagement
      - confidenceScore: 0-100 based on data strength
      - impactLevel: High, Medium, or Low
      - action: {type: modify-text|adjust-layout|add-visual|simplify-content, parameters: {}}
      
      Return as JSON array of suggestions, ordered by confidence score (highest first).
    `;
  }

  private buildStructureAnalysisPrompt(slides: any[]): string {
    const slidesSummary = slides.map((slide, index) => ({
      index,
      layout: slide.layout,
      elementCount: slide.elements?.length || 0,
      textLength: slide.elements?.filter((e: any) => e.type === 'text')
        .reduce((sum: number, e: any) => sum + (e.content?.length || 0), 0) || 0
    }));

    return `
      Analyze this presentation structure and suggest improvements:
      
      Slides: ${JSON.stringify(slidesSummary)}
      
      Provide recommendations for:
      - Slide order optimization
      - Content density balance
      - Visual hierarchy improvements
      - Flow and transitions
      
      Return as JSON with recommendations array containing:
      - type: reorder|merge|split|restructure
      - slideIndexes: affected slides
      - description: what to change
      - reasoning: why this improves the presentation
    `;
  }

  private parseSuggestionsResponse(response: string): Suggestion[] {
    try {
      const parsed = JSON.parse(response);
      return Array.isArray(parsed) ? parsed : parsed.suggestions || [];
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return [];
    }
  }

  private rankSuggestions(suggestions: Suggestion[]): Suggestion[] {
    return suggestions
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, 8); // Limit to max 8 suggestions
  }

  private calculateOverallConfidence(suggestions: Suggestion[]): number {
    if (suggestions.length === 0) return 0;
    
    const avgConfidence = suggestions.reduce((sum, s) => sum + s.confidenceScore, 0) / suggestions.length;
    return Math.round(avgConfidence);
  }

  private generateFallbackSuggestions(data: EngagementData): AIAnalysisResponse {
    const suggestions: Suggestion[] = [];
    
    // Rule-based suggestions when AI fails
    if (data.views > 0) {
      const avgDropOff = Array.from(data.dropOffRates.values())
        .reduce((sum, rate) => sum + rate, 0) / data.dropOffRates.size;
      
      if (avgDropOff > 0.3) {
        suggestions.push({
          id: 'fallback-1',
          type: 'engagement-optimization',
          targetSlideIndex: 0,
          title: 'Improve Opening Engagement',
          description: 'High drop-off rate detected. Consider starting with a compelling hook or question.',
          rationale: 'Data shows 30%+ viewers leave early, indicating weak opening.',
          confidenceScore: 70,
          impactLevel: 'High',
          action: {
            type: 'modify-text',
            parameters: { focus: 'opening', style: 'engaging' }
          },
          createdAt: new Date()
        });
      }
    }
    
    // Add more rule-based suggestions
    if (data.comments.length === 0) {
      suggestions.push({
        id: 'fallback-2',
        type: 'engagement-optimization',
        targetSlideIndex: -1,
        title: 'Add Interactive Elements',
        description: 'No comments detected. Consider adding questions or call-to-action slides.',
        rationale: 'Presentations with interactive elements get 40% more engagement.',
        confidenceScore: 60,
        impactLevel: 'Medium',
        action: {
          type: 'add-visual',
          parameters: { type: 'interactive', placement: 'end' }
        },
        createdAt: new Date()
      });
    }

    return {
      suggestions,
      confidence: 50, // Lower confidence for fallback
      processingTime: 100
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Health check for AI service
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.callSparkAPI('Test connection', { maxTokens: 10 });
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const aiService = new AIService();