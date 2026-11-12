/**
 * AI Suggestions Feature Module
 * 
 * Exports all components and services for the AI suggestions system
 */

// Core types
export * from './types';

// Application engine
export { 
  SuggestionApplicationEngine,
  suggestionApplicationEngine,
  type ApplicationResult,
  type ApplicationChange
} from './applicationEngine';

// Suggestion manager
export { 
  SuggestionManager,
  suggestionManager
} from './suggestionManager';

// Other components (when implemented)
export * from './analyzer';
export * from './confidenceScorer';
export * from './ranker';
export * from './parser';
export * from './fallbackSuggestions';