import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkle, 
  TrendUp, 
  Warning, 
  CheckCircle, 
  X,
  Lightbulb,
  Target,
  ChartBar
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Suggestion, SuggestionType, ImpactLevel } from '../types';
import { suggestionManager } from '../suggestionManager';

interface SuggestionsPanelProps {
  presentationId: string;
  onApply: (suggestion: Suggestion) => void;
  onDismiss: (suggestionId: string) => void;
}

const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({
  presentationId,
  onApply,
  onDismiss
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [dismissingId, setDismissingId] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<string | null>(null);

  useEffect(() => {
    loadSuggestions();
  }, [presentationId]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedSuggestions = await suggestionManager.fetchSuggestions(presentationId);
      setSuggestions(fetchedSuggestions);
    } catch (err) {
      setError('فشل تحميل الاقتراحات. يرجى المحاولة مرة أخرى.');
      console.error('Failed to load suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (suggestion: Suggestion) => {
    try {
      setProcessingId(suggestion.id);
      await suggestionManager.applySuggestion(suggestion.id);
      onApply(suggestion);

      // Remove applied suggestion from list with animation
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));

      toast.success('تم تطبيق الاقتراح بنجاح', {
        description: `تم تطبيق "${suggestion.title}" على الشريحة ${suggestion.targetSlideIndex + 1}`,
        duration: 4000,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      toast.error('فشل تطبيق الاقتراح', {
        description: `لم يتم تطبيق "${suggestion.title}": ${errorMessage}`,
        duration: 5000,
      });
      console.error('Failed to apply suggestion:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDismissClick = (suggestionId: string) => {
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (suggestion?.impactLevel === 'High') {
      // Show confirmation for high-impact suggestions
      setShowConfirmDialog(suggestionId);
    } else {
      // Directly dismiss low/medium impact suggestions
      handleDismiss(suggestionId);
    }
  };

  const handleDismiss = async (suggestionId: string) => {
    try {
      setDismissingId(suggestionId);
      setShowConfirmDialog(null);

      const suggestion = suggestions.find(s => s.id === suggestionId);
      await suggestionManager.dismissSuggestion(suggestionId);
      onDismiss(suggestionId);

      // Remove dismissed suggestion from list with animation
      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));

      toast.success('تم رفض الاقتراح', {
        description: suggestion ? `تم رفض "${suggestion.title}"` : 'تم رفض الاقتراح بنجاح',
        duration: 3000,
      });
    } catch (err) {
      const suggestion = suggestions.find(s => s.id === suggestionId);
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      toast.error('فشل رفض الاقتراح', {
        description: suggestion ? `لم يتم رفض "${suggestion.title}": ${errorMessage}` : `حدث خطأ: ${errorMessage}`,
        duration: 5000,
      });
      console.error('Failed to dismiss suggestion:', err);
    } finally {
      setDismissingId(null);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  const getTypeIcon = (type: SuggestionType) => {
    switch (type) {
      case 'content-density':
        return <ChartBar className="w-4 h-4" />;
      case 'visual-balance':
        return <Target className="w-4 h-4" />;
      case 'text-readability':
        return <Lightbulb className="w-4 h-4" />;
      case 'engagement-optimization':
        return <TrendUp className="w-4 h-4" />;
      case 'layout-improvement':
        return <Warning className="w-4 h-4" />;
      default:
        return <Sparkle className="w-4 h-4" />;
    }
  };

  const getImpactColor = (impact: ImpactLevel) => {
    switch (impact) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactText = (impact: ImpactLevel) => {
    switch (impact) {
      case 'High':
        return 'تأثير عالي';
      case 'Medium':
        return 'تأثير متوسط';
      case 'Low':
        return 'تأثير منخفض';
      default:
        return 'تأثير غير محدد';
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkle className="w-5 h-5 text-purple-600" />
            اقتراحات الذكاء الاصطناعي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" role="status" aria-label="جاري التحميل"></div>
            <p className="text-sm text-gray-600">جاري تحليل العرض التقديمي...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkle className="w-5 h-5 text-purple-600" />
            اقتراحات الذكاء الاصطناعي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Warning className="w-8 h-8 text-red-500" />
            <p className="text-sm text-red-600 text-center">{error}</p>
            <Button
              onClick={loadSuggestions}
              variant="outline"
              size="sm"
              aria-label="إعادة تحميل الاقتراحات"
            >
              إعادة المحاولة
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkle className="w-5 h-5 text-purple-600" />
              اقتراحات الذكاء الاصطناعي
            </div>
            <Badge variant="secondary" className="text-xs">
              {suggestions.length} اقتراح
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {suggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <p className="text-sm text-gray-600 text-center">
                عرضك التقديمي في حالة ممتازة! لا توجد اقتراحات للتحسين حالياً.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                <AnimatePresence>
                  {suggestions.map((suggestion, index) => (
                    <motion.div
                      key={suggestion.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                {getTypeIcon(suggestion.type)}
                                <h4 className="font-medium text-sm">{suggestion.title}</h4>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getImpactColor(suggestion.impactLevel)}`}
                                  aria-label={`مستوى التأثير: ${getImpactText(suggestion.impactLevel)}`}
                                >
                                  {getImpactText(suggestion.impactLevel)}
                                </Badge>
                              </div>
                            </div>

                            {/* Confidence Score */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">درجة الثقة</span>
                                <span className={`font-medium ${getConfidenceColor(suggestion.confidenceScore)}`}>
                                  {suggestion.confidenceScore}%
                                </span>
                              </div>
                              <Progress
                                value={suggestion.confidenceScore}
                                className="h-1"
                                aria-label={`درجة الثقة: ${suggestion.confidenceScore}%`}
                              />
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {suggestion.description}
                            </p>

                            {/* Rationale */}
                            {suggestion.rationale && (
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-600 leading-relaxed">
                                  <strong>السبب:</strong> {suggestion.rationale}
                                </p>
                              </div>
                            )}

                            <Separator />

                            {/* Actions */}
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-500">
                                الشريحة {suggestion.targetSlideIndex + 1}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => handleDismissClick(suggestion.id)}
                                  onKeyDown={(e) => handleKeyDown(e, () => handleDismissClick(suggestion.id))}
                                  disabled={dismissingId === suggestion.id || processingId === suggestion.id}
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-600 hover:text-gray-800 focus:ring-2 focus:ring-gray-300"
                                  aria-label={`رفض اقتراح: ${suggestion.title}`}
                                >
                                  {dismissingId === suggestion.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" aria-hidden="true"></div>
                                  ) : (
                                    <X className="w-4 h-4" />
                                  )}
                                  <span className="sr-only sm:not-sr-only sm:ml-1">رفض</span>
                                </Button>
                                <Button
                                  onClick={() => handleApply(suggestion)}
                                  onKeyDown={(e) => handleKeyDown(e, () => handleApply(suggestion))}
                                  disabled={processingId === suggestion.id || dismissingId === suggestion.id}
                                  size="sm"
                                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:ring-2 focus:ring-purple-300"
                                  aria-label={`تطبيق اقتراح: ${suggestion.title}`}
                                >
                                  {processingId === suggestion.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" aria-hidden="true"></div>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-4 h-4" />
                                      <span className="sr-only sm:not-sr-only sm:ml-1">تطبيق</span>
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog for High-Impact Dismissals */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <Warning className="w-6 h-6 text-amber-500" />
              <h3 id="confirm-dialog-title" className="text-lg font-semibold">تأكيد رفض الاقتراح</h3>
            </div>
            <p className="text-gray-600 mb-6">
              هذا اقتراح عالي التأثير قد يحسن عرضك التقديمي بشكل كبير. هل أنت متأكد من رفضه؟
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowConfirmDialog(null)}
                variant="outline"
                size="sm"
                aria-label="إلغاء رفض الاقتراح"
              >
                إلغاء
              </Button>
              <Button
                onClick={() => handleDismiss(showConfirmDialog)}
                variant="destructive"
                size="sm"
                aria-label="تأكيد رفض الاقتراح"
              >
                رفض الاقتراح
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};


export default SuggestionsPanel;