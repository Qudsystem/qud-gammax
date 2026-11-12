/**
 * Example demonstrating fallback suggestions functionality
 */

import { FallbackSuggestionsGenerator } from './fallbackSuggestions';
import { SuggestionManager } from './suggestionManager';
import { EngagementData } from './types';

// Example: Insufficient engagement data scenario
const insufficientData: EngagementData = {
  presentationId: 'demo-presentation-1',
  views: 3, // Very low views
  averageViewTime: 45,
  dropOffRates: new Map(), // No drop-off data
  comments: [], // No comments
  interactions: [], // No interactions
  lastUpdated: new Date()
};

// Example: Sufficient engagement data scenario
const sufficientData: EngagementData = {
  presentationId: 'demo-presentation-2',
  views: 150,
  averageViewTime: 180,
  dropOffRates: new Map([
    [0, 0.1],
    [1, 0.15],
    [2, 0.35], // High drop-off on slide 2
    [3, 0.2],
    [4, 0.25]
  ]),
  comments: [
    {
      id: 'comment-1',
      slideIndex: 2,
      content: 'This slide is confusing and hard to read',
      timestamp: new Date(Date.now() - 86400000),
      userId: 'user-1'
    },
    {
      id: 'comment-2',
      slideIndex: 4,
      content: 'Great visualization here!',
      timestamp: new Date(Date.now() - 43200000),
      userId: 'user-2'
    }
  ],
  interactions: [
    {
      type: 'click',
      slideIndex: 0,
      elementId: 'title-1',
      timestamp: new Date(Date.now() - 3600000),
      userId: 'user-3'
    },
    {
      type: 'hover',
      slideIndex: 2,
      elementId: 'chart-1',
      timestamp: new Date(Date.now() - 1800000),
      userId: 'user-4',
      duration: 8000
    }
  ],
  lastUpdated: new Date()
};

export async function demonstrateFallbackSuggestions() {
  console.log('=== Fallback Suggestions Demo ===\n');

  const fallbackGenerator = new FallbackSuggestionsGenerator();
  
  // Test 1: Check if data is insufficient
  console.log('1. Data Sufficiency Check:');
  console.log(`Insufficient data (3 views, no interactions): ${fallbackGenerator.isDataInsufficient(insufficientData)}`);
  console.log(`Sufficient data (150 views, interactions): ${fallbackGenerator.isDataInsufficient(sufficientData)}\n`);

  // Test 2: Generate fallback suggestions for insufficient data
  console.log('2. Fallback Suggestions for Insufficient Data:');
  const fallbackSuggestions = fallbackGenerator.generateFallbackSuggestions(insufficientData);
  fallbackSuggestions.forEach((suggestion, index) => {
    console.log(`   ${index + 1}. ${suggestion.title}`);
    console.log(`      Type: ${suggestion.type}`);
    console.log(`      Confidence: ${suggestion.confidenceScore}%`);
    console.log(`      Impact: ${suggestion.impactLevel}`);
    console.log(`      Description: ${suggestion.description}\n`);
  });

  // Test 3: Generate contextual fallback suggestions
  console.log('3. Contextual Fallback Suggestions:');
  const contextualSuggestions = fallbackGenerator.generateContextualFallbacks(
    {
      hasTextHeavySlides: true,
      hasLongSlides: true,
      hasNoVisuals: true,
      hasComplexContent: true,
      isLongPresentation: true
    },
    'demo-presentation-3'
  );
  
  contextualSuggestions.forEach((suggestion, index) => {
    console.log(`   ${index + 1}. ${suggestion.title}`);
    console.log(`      Type: ${suggestion.type}`);
    console.log(`      Confidence: ${suggestion.confidenceScore}%`);
    console.log(`      Target Slide: ${suggestion.targetSlideIndex}\n`);
  });

  // Test 4: Emergency fallback suggestions
  console.log('4. Emergency Fallback Suggestions:');
  const emergencySuggestions = fallbackGenerator.generateEmergencyFallbacks('demo-presentation-4');
  emergencySuggestions.forEach((suggestion, index) => {
    console.log(`   ${index + 1}. ${suggestion.title}`);
    console.log(`      Type: ${suggestion.type}`);
    console.log(`      Confidence: ${suggestion.confidenceScore}%\n`);
  });

  return {
    insufficientDataCheck: fallbackGenerator.isDataInsufficient(insufficientData),
    sufficientDataCheck: fallbackGenerator.isDataInsufficient(sufficientData),
    fallbackSuggestions,
    contextualSuggestions,
    emergencySuggestions
  };
}

export async function demonstrateSuggestionManager() {
  console.log('=== Suggestion Manager Integration Demo ===\n');

  // Create suggestion manager with fallback-only configuration
  const manager = new SuggestionManager({
    enableAIAnalysis: false, // Disable AI to test fallback path
    enableFallbackSuggestions: true,
    maxSuggestions: 6,
    minConfidenceScore: 35,
    cacheResults: false // Disable cache for demo
  });

  console.log('Manager Configuration:');
  console.log(JSON.stringify(manager.getConfig(), null, 2));
  console.log();

  // Mock the kvStorage for demo purposes
  const originalGet = require('../../core/services/kvStorage').kvStorage.get;
  require('../../core/services/kvStorage').kvStorage.get = async (key: string) => {
    if (key === 'engagement:demo-presentation-1') {
      return insufficientData;
    }
    if (key.includes('dismissals')) {
      return []; // No dismissed suggestions
    }
    return null;
  };

  try {
    console.log('Fetching suggestions for insufficient data presentation...');
    const suggestions = await manager.fetchSuggestions('demo-presentation-1');
    
    console.log(`Generated ${suggestions.length} fallback suggestions:`);
    suggestions.forEach((suggestion, index) => {
      console.log(`   ${index + 1}. ${suggestion.title}`);
      console.log(`      Confidence: ${suggestion.confidenceScore}%`);
      console.log(`      Impact: ${suggestion.impactLevel}`);
      console.log(`      ID: ${suggestion.id}\n`);
    });

    return suggestions;
  } catch (error) {
    console.error('Error in suggestion manager demo:', error);
    return [];
  } finally {
    // Restore original kvStorage.get
    require('../../core/services/kvStorage').kvStorage.get = originalGet;
  }
}

// Export for use in other files
export {
  insufficientData,
  sufficientData,
  FallbackSuggestionsGenerator,
  SuggestionManager
};