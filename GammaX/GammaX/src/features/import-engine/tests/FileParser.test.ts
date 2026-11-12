import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileParser } from '../FileParser';

// Mock dependencies
vi.mock('pizzip', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      files: {
        'ppt/slides/slide1.xml': {
          asText: () => '<p:sld><p:txBody><a:t>Slide Title</a:t></p:txBody></p:sld>'
        }
      }
    }))
  };
});

vi.mock('xml2js', () => ({
  parseStringPromise: vi.fn().mockResolvedValue({
    'p:sld': {
      'p:txBody': [{
        'a:t': ['Slide Title']
      }]
    }
  })
}));

vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: {},
  getDocument: vi.fn().mockReturnValue({
    promise: Promise.resolve({
      numPages: 1,
      getPage: vi.fn().mockResolvedValue({
        getTextContent: vi.fn().mockResolvedValue({
          items: [{ str: 'PDF Title' }, { str: 'Content line 1' }]
        })
      })
    })
  })
}));

describe('FileParser', () => {
  let parser: FileParser;

  beforeEach(() => {
    parser = new FileParser();
  });

  it('should parse PPTX file', async () => {
    const file = new File([''], 'test.pptx', { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
    const presentation = await parser.parsePPTX(file);

    expect(presentation).toBeDefined();
    expect(presentation.title).toBe('test');
    expect(presentation.slides.length).toBeGreaterThan(0);
  });

  it('should parse PDF file', async () => {
    const file = new File([''], 'test.pdf', { type: 'application/pdf' });
    const presentation = await parser.parsePDF(file);

    expect(presentation).toBeDefined();
    expect(presentation.title).toBe('test');
    expect(presentation.slides.length).toBeGreaterThan(0);
    expect(presentation.slides[0].title).toBe('PDF Title');
  });
});
