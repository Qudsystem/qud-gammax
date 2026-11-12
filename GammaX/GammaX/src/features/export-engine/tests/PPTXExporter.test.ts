import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PPTXExporter } from '../PPTXExporter';
import { Presentation } from '@/lib/types';

const mockWriteFile = vi.fn().mockResolvedValue(undefined);
const mockAddSlide = vi.fn().mockReturnValue({
  addText: vi.fn(),
  addImage: vi.fn(),
  addNotes: vi.fn(),
  background: null
});

vi.mock('pptxgenjs', () => {
  return {
    default: vi.fn().mockImplementation(function() {
      return {
        title: '',
        subject: '',
        author: '',
        writeFile: mockWriteFile,
        addSlide: mockAddSlide
      };
    })
  };
});

describe('PPTXExporter', () => {
  let exporter: PPTXExporter;
  
  const mockPresentation: Presentation = {
    id: 'p1',
    title: 'Test Pres',
    description: 'Desc',
    style: 'modern',
    slides: [
      {
        id: 's1',
        title: 'Slide 1',
        content: ['Content 1'],
        layout: 'content',
        animation: 'fade-in'
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    exporter = new PPTXExporter(mockPresentation);
  });

  it('should generate and save PPTX file', async () => {
    await exporter.export();

    expect(mockAddSlide).toHaveBeenCalledTimes(1);
    expect(mockWriteFile).toHaveBeenCalledWith({ fileName: 'Test Pres.pptx' });
  });
});
