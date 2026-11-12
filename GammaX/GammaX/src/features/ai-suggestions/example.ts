/**
 * Example usage of the Suggestion Application Engine
 * 
 * This demonstrates how to use the suggestion application system
 */

import { suggestionManager } from './suggestionManager';
import { suggestionApplicationEngine } from './applicationEngine';
import { Suggestion } from './types';

/**
 * Example: Apply a content simplification suggestion
 */
export async function applySuggestionExample() {
  const presentationId = 'example-presentation';
  const suggestionId = 'example-suggestion';

  try {
    // Fetch available suggestions
    const suggestions = await suggestionManager.fetchSuggestions(presentationId);
    console.log(`Found ${suggestions.length} suggestions`);

    // Preview changes before applying
    const previewChanges = await suggestionManager.previewSuggestion(
      suggestionId, 
      presentationId
    );
    console.log('Preview changes:', previewChanges);

    // Apply the suggestion
    const result = await suggestionManager.applySuggestion(
      suggestionId, 
      presentationId
    );

    if (result.success) {
      console.log('Suggestion applied successfully!');
      console.log('Changes made:', result.changes);
    } else {
      console.error('Failed to apply suggestion:', result.error);
    }

    return result;
  } catch (error) {
    console.error('Error in suggestion application:', error);
    throw error;
  }
}

/**
 * Example: Create and apply a custom suggestion
 */
export async function createCustomSuggestionExample() {
  const customSuggestion: Suggestion = {
    id: 'custom-suggestion-1',
    type: 'content-density',
    targetSlideIndex: 0,
    title: 'Reduce Content Density',
    description: 'Simplify the first slide by reducing bullet points',
    rationale: 'The slide has too many bullet points which may overwhelm the audience',
    confidenceScore: 85,
    impactLevel: 'High',
    action: {
      type: 'simplify-content',
      parameters: {
        maxBulletPoints: 3,
        shortenText: true,
        removeRedundancy: true
      }
    },
    createdAt: new Date()
  };

  // Validate the action before applying
  const validation = suggestionApplicationEngine.validateAction(customSuggestion.action);
  
  if (!validation.valid) {
    console.error('Invalid suggestion action:', validation.errors);
    return;
  }

  console.log('Custom suggestion is valid and ready to apply');
  return customSuggestion;
}

/**
 * Example: Handle different suggestion types
 */
export function getSuggestionTypeExamples() {
  return {
    textModification: {
      type: 'modify-text',
      parameters: {
        targetIndex: 0,
        newText: 'Improved and more engaging content'
      }
    },
    layoutAdjustment: {
      type: 'adjust-layout',
      parameters: {
        newLayout: 'two-column',
        backgroundColor: '#f8f9fa'
      }
    },
    visualAddition: {
      type: 'add-visual',
      parameters: {
        addImage: true,
        addDiagram: 'flowchart',
        enhanceVisuals: true
      }
    },
    contentSimplification: {
      type: 'simplify-content',
      parameters: {
        maxBulletPoints: 4,
        shortenText: true,
        removeRedundancy: true,
        focusKeyPoints: true,
        keyPoints: ['Key Point 1', 'Key Point 2', 'Key Point 3']
      }
    }
  };
}