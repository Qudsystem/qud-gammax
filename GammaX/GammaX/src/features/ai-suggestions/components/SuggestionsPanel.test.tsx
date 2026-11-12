/**
 * Test for SuggestionsPanel component - Task 2.3.2 verification
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SuggestionsPanel from './SuggestionsPanel';
import { Suggestion } from '../types';

// Mock the suggestion manager
vi.mock('../suggestionManager', () => ({
  suggestionManager: {
    fetchSuggestions: vi.fn(),
    applySuggestion: vi.fn(),
    dismissSuggestion: vi.fn(),
  }
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

const mockSuggestions: Suggestion[] = [
  {
    id: 'test-1',
    presentationId: 'pres-1',
    type: 'content-density',
    targetSlideIndex: 0,
    title: 'تقليل كثافة المحتوى',
    description: 'قم بتقسيم المحتوى الكثيف إلى شرائح متعددة لتحسين القراءة',
    rationale: 'الشرائح المكتظة بالمحتوى تقلل من فهم الجمهور وتشتت الانتباه',
    confidenceScore: 85,
    impactLevel: 'High',
    action: {
      type: 'simplify-content',
      parameters: {}
    },
    createdAt: new Date()
  },
  {
    id: 'test-2',
    presentationId: 'pres-1',
    type: 'visual-balance',
    targetSlideIndex: 1,
    title: 'تحسين التوازن البصري',
    description: 'أضف عناصر بصرية لموازنة النص وتحسين جاذبية الشريحة',
    rationale: 'التوازن البصري يحسن من تجربة المشاهدة ويزيد التفاعل',
    confidenceScore: 65,
    impactLevel: 'Medium',
    action: {
      type: 'add-visual',
      parameters: {}
    },
    createdAt: new Date()
  },
  {
    id: 'test-3',
    presentationId: 'pres-1',
    type: 'text-readability',
    targetSlideIndex: 2,
    title: 'تحسين قابلية القراءة',
    description: 'استخدم خطوط أكبر وألوان متباينة لتحسين وضوح النص',
    rationale: 'النصوص الواضحة تضمن وصول الرسالة بفعالية للجمهور',
    confidenceScore: 45,
    impactLevel: 'Low',
    action: {
      type: 'modify-text',
      parameters: {}
    },
    createdAt: new Date()
  }
];

describe('SuggestionsPanel - Task 2.3.2 Implementation', () => {
  const mockOnApply = vi.fn();
  const mockOnDismiss = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays all required suggestion fields', async () => {
    const { suggestionManager } = await import('../suggestionManager');
    vi.mocked(suggestionManager.fetchSuggestions).mockResolvedValue(mockSuggestions);

    render(
      <SuggestionsPanel
        presentationId="test-presentation"
        onApply={mockOnApply}
        onDismiss={mockOnDismiss}
      />
    );

    await waitFor(() => {
      // Check that suggestion titles are displayed
      expect(screen.getByText('تقليل كثافة المحتوى')).toBeInTheDocument();
      expect(screen.getByText('تحسين التوازن البصري')).toBeInTheDocument();
      expect(screen.getByText('تحسين قابلية القراءة')).toBeInTheDocument();

      // Check that descriptions are displayed
      expect(screen.getByText(/قم بتقسيم المحتوى الكثيف/)).toBeInTheDocument();
      expect(screen.getByText(/أضف عناصر بصرية لموازنة النص/)).toBeInTheDocument();
      expect(screen.getByText(/استخدم خطوط أكبر وألوان متباينة/)).toBeInTheDocument();

      // Check that rationale is displayed
      expect(screen.getByText(/الشرائح المكتظة بالمحتوى تقلل من فهم الجمهور/)).toBeInTheDocument();
      expect(screen.getByText(/التوازن البصري يحسن من تجربة المشاهدة/)).toBeInTheDocument();
      expect(screen.getByText(/النصوص الواضحة تضمن وصول الرسالة/)).toBeInTheDocument();
    });
  });

  it('displays confidence scores with visual indicators', async () => {
    const { suggestionManager } = await import('../suggestionManager');
    vi.mocked(suggestionManager.fetchSuggestions).mockResolvedValue(mockSuggestions);

    render(
      <SuggestionsPanel
        presentationId="test-presentation"
        onApply={mockOnApply}
        onDismiss={mockOnDismiss}
      />
    );

    await waitFor(() => {
      // Check confidence score percentages are displayed
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('65%')).toBeInTheDocument();
      expect(screen.getByText('45%')).toBeInTheDocument();

      // Check confidence score labels
      const confidenceLabels = screen.getAllByText('درجة الثقة');
      expect(confidenceLabels).toHaveLength(3);

      // Check that progress bars are present (they should have the Progress component class)
      const progressBars = document.querySelectorAll('[role="progressbar"]');
      expect(progressBars).toHaveLength(3);
    });
  });

  it('displays impact level badges with correct colors', async () => {
    const { suggestionManager } = await import('../suggestionManager');
    vi.mocked(suggestionManager.fetchSuggestions).mockResolvedValue(mockSuggestions);

    render(
      <SuggestionsPanel
        presentationId="test-presentation"
        onApply={mockOnApply}
        onDismiss={mockOnDismiss}
      />
    );

    await waitFor(() => {
      // Check impact level text in Arabic
      expect(screen.getByText('تأثير عالي')).toBeInTheDocument();
      expect(screen.getByText('تأثير متوسط')).toBeInTheDocument();
      expect(screen.getByText('تأثير منخفض')).toBeInTheDocument();

      // Check that badges have appropriate CSS classes for colors
      const highImpactBadge = screen.getByText('تأثير عالي').closest('[data-slot="badge"]');
      const mediumImpactBadge = screen.getByText('تأثير متوسط').closest('[data-slot="badge"]');
      const lowImpactBadge = screen.getByText('تأثير منخفض').closest('[data-slot="badge"]');

      expect(highImpactBadge).toHaveClass('bg-red-100', 'text-red-800');
      expect(mediumImpactBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
      expect(lowImpactBadge).toHaveClass('bg-green-100', 'text-green-800');
    });
  });

  it('displays loading state correctly', async () => {
    const { suggestionManager } = await import('../suggestionManager');
    // Mock a pending promise to simulate loading
    vi.mocked(suggestionManager.fetchSuggestions).mockImplementation(
      () => new Promise(() => { }) // Never resolves to keep loading state
    );

    render(
      <SuggestionsPanel
        presentationId="test-presentation"
        onApply={mockOnApply}
        onDismiss={mockOnDismiss}
      />
    );

    // Check loading spinner and text
    expect(screen.getByText('جاري تحليل العرض التقديمي...')).toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('displays empty state when no suggestions', async () => {
    const { suggestionManager } = await import('../suggestionManager');
    vi.mocked(suggestionManager.fetchSuggestions).mockResolvedValue([]);

    render(
      <SuggestionsPanel
        presentationId="test-presentation"
        onApply={mockOnApply}
        onDismiss={mockOnDismiss}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/عرضك التقديمي في حالة ممتازة/)).toBeInTheDocument();
    });
  });

  it('displays error state correctly', async () => {
    const { suggestionManager } = await import('../suggestionManager');
    vi.mocked(suggestionManager.fetchSuggestions).mockRejectedValue(new Error('Test error'));

    render(
      <SuggestionsPanel
        presentationId="test-presentation"
        onApply={mockOnApply}
        onDismiss={mockOnDismiss}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/فشل تحميل الاقتراحات/)).toBeInTheDocument();
      expect(screen.getByText('إعادة المحاولة')).toBeInTheDocument();
    });
  });

  it('handles suggestion application correctly', async () => {
    const { suggestionManager } = await import('../suggestionManager');
    vi.mocked(suggestionManager.fetchSuggestions).mockResolvedValue(mockSuggestions);
    vi.mocked(suggestionManager.applySuggestion).mockResolvedValue();

    render(
      <SuggestionsPanel
        presentationId="test-presentation"
        onApply={mockOnApply}
        onDismiss={mockOnDismiss}
      />
    );

    await waitFor(() => {
      const applyButtons = screen.getAllByText('تطبيق');
      expect(applyButtons).toHaveLength(3);
    });

    // Click the first apply button
    const applyButtons = screen.getAllByText('تطبيق');
    fireEvent.click(applyButtons[0]);

    await waitFor(() => {
      expect(suggestionManager.applySuggestion).toHaveBeenCalledWith('test-1');
      expect(mockOnApply).toHaveBeenCalledWith(mockSuggestions[0]);
    });
  });

  it('handles suggestion dismissal correctly', async () => {
    const { suggestionManager } = await import('../suggestionManager');
    vi.mocked(suggestionManager.fetchSuggestions).mockResolvedValue(mockSuggestions);
    vi.mocked(suggestionManager.dismissSuggestion).mockResolvedValue();

    render(
      <SuggestionsPanel
        presentationId="test-presentation"
        onApply={mockOnApply}
        onDismiss={mockOnDismiss}
      />
    );

    await waitFor(() => {
      const dismissButtons = screen.getAllByLabelText(/رفض اقتراح/);
      expect(dismissButtons).toHaveLength(3);
    });

    // Click the second dismiss button (Medium impact, no confirmation)
    const dismissButtons = screen.getAllByLabelText(/رفض اقتراح/);
    fireEvent.click(dismissButtons[1]);

    await waitFor(() => {
      expect(suggestionManager.dismissSuggestion).toHaveBeenCalledWith('test-2');
      expect(mockOnDismiss).toHaveBeenCalledWith('test-2');
    });
  });

  it('shows confirmation dialog for high-impact suggestion dismissal', async () => {
    const { suggestionManager } = await import('../suggestionManager');
    vi.mocked(suggestionManager.fetchSuggestions).mockResolvedValue(mockSuggestions);
    vi.mocked(suggestionManager.dismissSuggestion).mockResolvedValue();

    render(
      <SuggestionsPanel
        presentationId="test-presentation"
        onApply={mockOnApply}
        onDismiss={mockOnDismiss}
      />
    );

    await waitFor(() => {
      const dismissButtons = screen.getAllByLabelText(/رفض اقتراح/);
      fireEvent.click(dismissButtons[0]); // High impact
    });

    // Check if confirmation dialog is shown
    expect(screen.getByText('تأكيد رفض الاقتراح')).toBeInTheDocument();
    expect(screen.getByText(/هذا اقتراح عالي التأثير/)).toBeInTheDocument();

    // Click "رفض الاقتراح" in the dialog
    const confirmButton = screen.getByRole('button', { name: 'تأكيد رفض الاقتراح' });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(suggestionManager.dismissSuggestion).toHaveBeenCalledWith('test-1');
      expect(mockOnDismiss).toHaveBeenCalledWith('test-1');
    });
  });

  it('displays slide numbers correctly', async () => {
    const { suggestionManager } = await import('../suggestionManager');
    vi.mocked(suggestionManager.fetchSuggestions).mockResolvedValue(mockSuggestions);

    render(
      <SuggestionsPanel
        presentationId="test-presentation"
        onApply={mockOnApply}
        onDismiss={mockOnDismiss}
      />
    );

    await waitFor(() => {
      // Check slide numbers (targetSlideIndex + 1)
      expect(screen.getByText('الشريحة 1')).toBeInTheDocument();
      expect(screen.getByText('الشريحة 2')).toBeInTheDocument();
      expect(screen.getByText('الشريحة 3')).toBeInTheDocument();
    });
  });

  it('displays suggestion count badge', async () => {
    const { suggestionManager } = await import('../suggestionManager');
    vi.mocked(suggestionManager.fetchSuggestions).mockResolvedValue(mockSuggestions);

    render(
      <SuggestionsPanel
        presentationId="test-presentation"
        onApply={mockOnApply}
        onDismiss={mockOnDismiss}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('3 اقتراح')).toBeInTheDocument();
    });
  });
});