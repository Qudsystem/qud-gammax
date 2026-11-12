/**
 * Example usage of the suggestion dismissal functionality
 * This demonstrates how to use the SuggestionManager for dismissing suggestions
 */

import { SuggestionManager } from './suggestionManager';
import { Suggestion } from './types';

// Example usage of suggestion dismissal functionality
export async function demonstrateDismissalFeatures() {
  const suggestionManager = new SuggestionManager();
  const presentationId = 'demo-presentation';

  // Example suggestions
  const exampleSuggestions: Suggestion[] = [
    {
      id: 'suggestion-1',
      presentationId,
      type: 'content-density',
      targetSlideIndex: 0,
      title: 'تقليل كثافة المحتوى',
      description: 'قم بتقسيم المحتوى الكثيف إلى شرائح متعددة لتحسين القراءة',
      rationale: 'الشرائح المكتظة بالمحتوى تقلل من فهم الجمهور وتشتت الانتباه',
      confidenceScore: 85,
      impactLevel: 'High',
      action: {
        type: 'modify-text',
        parameters: { maxWordsPerSlide: 50 }
      },
      createdAt: new Date()
    },
    {
      id: 'suggestion-2',
      presentationId,
      type: 'visual-balance',
      targetSlideIndex: 1,
      title: 'تحسين التوازن البصري',
      description: 'أضف عناصر بصرية لموازنة النص وتحسين جاذبية الشريحة',
      rationale: 'التوازن البصري يحسن من تجربة المشاهدة ويزيد التفاعل',
      confidenceScore: 72,
      impactLevel: 'Medium',
      action: {
        type: 'add-visual',
        parameters: { imageCount: 1, chartCount: 0 }
      },
      createdAt: new Date()
    },
    {
      id: 'suggestion-3',
      presentationId,
      type: 'text-readability',
      targetSlideIndex: 2,
      title: 'تحسين قابلية القراءة',
      description: 'استخدم خطوط أكبر وألوان متباينة لتحسين وضوح النص',
      rationale: 'النصوص الواضحة تضمن وصول الرسالة بفعالية للجمهور',
      confidenceScore: 90,
      impactLevel: 'High',
      action: {
        type: 'modify-text',
        parameters: { fontSize: 18, contrast: 'high' }
      },
      createdAt: new Date()
    }
  ];

  console.log('=== Suggestion Dismissal Demo ===\n');

  // 1. Demonstrate ranking functionality
  console.log('1. Original suggestions (unranked):');
  exampleSuggestions.forEach(s => {
    console.log(`   - ${s.title} (Confidence: ${s.confidenceScore}%)`);
  });

  const rankedSuggestions = suggestionManager.rankSuggestions(exampleSuggestions);
  console.log('\n   Ranked suggestions (by confidence):');
  rankedSuggestions.forEach(s => {
    console.log(`   - ${s.title} (Confidence: ${s.confidenceScore}%)`);
  });

  // 2. Demonstrate dismissal functionality
  console.log('\n2. Dismissing a suggestion...');
  try {
    await suggestionManager.dismissSuggestion('suggestion-2');
    console.log('   ✓ Successfully dismissed suggestion-2');
  } catch (error) {
    console.log('   ✗ Failed to dismiss suggestion:', error);
  }

  // 3. Check if suggestion is dismissed
  console.log('\n3. Checking dismissal status...');
  try {
    const isDismissed = await suggestionManager.isSuggestionDismissed(presentationId, 'suggestion-2');
    console.log(`   - suggestion-2 dismissed: ${isDismissed}`);
    
    const isNotDismissed = await suggestionManager.isSuggestionDismissed(presentationId, 'suggestion-1');
    console.log(`   - suggestion-1 dismissed: ${isNotDismissed}`);
  } catch (error) {
    console.log('   ✗ Failed to check dismissal status:', error);
  }

  // 4. Get dismissal statistics
  console.log('\n4. Dismissal statistics...');
  try {
    const stats = await suggestionManager.getDismissalStats(presentationId);
    console.log(`   - Total dismissed: ${stats.totalDismissed}`);
    console.log(`   - Dismissed by type:`, stats.dismissedByType);
    console.log(`   - Recent dismissals: ${stats.recentDismissals.length}`);
  } catch (error) {
    console.log('   ✗ Failed to get dismissal stats:', error);
  }

  // 5. Demonstrate fetching suggestions (would exclude dismissed ones)
  console.log('\n5. Fetching active suggestions (excluding dismissed)...');
  try {
    const activeSuggestions = await suggestionManager.fetchSuggestions(presentationId);
    console.log(`   - Active suggestions count: ${activeSuggestions.length}`);
    activeSuggestions.forEach(s => {
      console.log(`     * ${s.title}`);
    });
  } catch (error) {
    console.log('   ✗ Failed to fetch suggestions:', error);
  }

  // 6. Clear dismissal history (utility function)
  console.log('\n6. Clearing dismissal history...');
  try {
    await suggestionManager.clearDismissalHistory(presentationId);
    console.log('   ✓ Successfully cleared dismissal history');
  } catch (error) {
    console.log('   ✗ Failed to clear dismissal history:', error);
  }

  console.log('\n=== Demo Complete ===');
}

// Key features implemented:
export const DISMISSAL_FEATURES = {
  // Core dismissal functionality
  dismissSuggestion: 'Dismiss suggestions and track them to prevent re-showing',
  
  // Persistence
  storageIntegration: 'Persist dismissed suggestions to KV storage',
  
  // Filtering
  excludeDismissed: 'Filter out dismissed suggestions from active lists',
  
  // Event system
  eventEmission: 'Emit events when suggestions are dismissed',
  
  // Utility methods
  clearHistory: 'Clear dismissal history for presentations',
  getStats: 'Get dismissal statistics and analytics',
  checkStatus: 'Check if specific suggestions are dismissed',
  
  // Caching
  performanceOptimization: 'Cache dismissed suggestion IDs for performance',
  
  // Error handling
  gracefulErrors: 'Handle storage and network errors gracefully',
  
  // Requirements compliance
  requirementValidation: 'Validates Requirements 1.8 - suggestion dismissal'
};

// Usage patterns:
export const USAGE_PATTERNS = {
  // In React components
  reactIntegration: `
    const handleDismiss = async (suggestionId: string) => {
      try {
        await suggestionManager.dismissSuggestion(suggestionId);
        // Update UI state
        setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
        toast.success('تم رفض الاقتراح');
      } catch (error) {
        toast.error('فشل رفض الاقتراح');
      }
    };
  `,
  
  // Event listening
  eventHandling: `
    eventBus.on('ai:suggestions:dismissed', ({ suggestionId, presentationId }) => {
      console.log('Suggestion dismissed:', suggestionId);
      // Update analytics, refresh UI, etc.
    });
  `,
  
  // Batch operations
  batchDismissal: `
    // Dismiss multiple suggestions
    for (const suggestionId of suggestionIds) {
      await suggestionManager.dismissSuggestion(suggestionId);
    }
  `
};