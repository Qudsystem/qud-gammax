import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { FileParser } from '../FileParser';

vi.mock('pizzip', () => ({
  default: vi.fn().mockImplementation(() => ({
    files: {}
  }))
}));

vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: {},
  getDocument: vi.fn().mockReturnValue({
    promise: Promise.resolve({
      numPages: 0
    })
  })
}));

describe('FileParser Property Tests', () => {
  it('should handle different filenames correctly', async () => {
    const parser = new FileParser();
    
    await fc.assert(
      fc.asyncProperty(fc.string({ minLength: 1, maxLength: 50 }), async (name) => {
        const file = new File([''], `${name}.pdf`, { type: 'application/pdf' });
        const presentation = await parser.parsePDF(file);
        
        expect(presentation.title).toBe(name);
        expect(presentation.slides).toBeDefined();
      })
    );
  });
});
