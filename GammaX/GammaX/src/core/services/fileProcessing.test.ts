import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { 
  FileProcessorBase, 
  FileProcessingError, 
  FileTypeDetector, 
  FileSizeUtils, 
  FileValidator,
  FileMetadata,
  ProcessingProgress
} from './fileProcessing'

// Mock FileReader
class MockFileReader {
  result: string | ArrayBuffer | null = null
  error: Error | null = null
  onload: ((event: any) => void) | null = null
  onerror: ((event: any) => void) | null = null

  readAsText(file: File) {
    setTimeout(() => {
      if (this.error) {
        this.onerror?.(new Event('error'))
      } else {
        this.result = 'mock file content'
        this.onload?.(new Event('load'))
      }
    }, 0)
  }

  readAsArrayBuffer(file: File) {
    setTimeout(() => {
      if (this.error) {
        this.onerror?.(new Event('error'))
      } else {
        this.result = new ArrayBuffer(8)
        this.onload?.(new Event('load'))
      }
    }, 0)
  }

  readAsDataURL(file: File) {
    setTimeout(() => {
      if (this.error) {
        this.onerror?.(new Event('error'))
      } else {
        this.result = 'data:text/plain;base64,bW9jayBmaWxlIGNvbnRlbnQ='
        this.onload?.(new Event('load'))
      }
    }, 0)
  }
}

global.FileReader = MockFileReader as any

// Test implementation of FileProcessorBase
class TestFileProcessor extends FileProcessorBase<string, { processed: string }> {
  protected async customValidation(file: File, metadata: FileMetadata) {
    const errors: string[] = []
    const warnings: string[] = []
    
    if (file.name.includes('invalid')) {
      errors.push('File name contains invalid marker')
    }
    
    if (file.size > 1000000) {
      warnings.push('Large file detected')
    }
    
    return { errors, warnings }
  }

  protected async parseFile(file: File): Promise<string> {
    if (file.name.includes('parse-error')) {
      throw new FileProcessingError('PARSE_ERROR', 'Mock parse error')
    }
    return await this.readFileAsText(file)
  }

  protected async transformContent(input: string): Promise<{ processed: string }> {
    return { processed: input.toUpperCase() }
  }

  protected async postProcess(output: { processed: string }): Promise<{ processed: string }> {
    return { ...output, processed: output.processed + ' [POST-PROCESSED]' }
  }
}

describe('FileProcessorBase', () => {
  let processor: TestFileProcessor
  let mockProgressCallback: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockProgressCallback = vi.fn()
    processor = new TestFileProcessor({
      maxFileSize: 1024 * 1024, // 1MB
      allowedTypes: ['text/plain', '.txt'],
      progressCallback: mockProgressCallback
    })
  })

  describe('File Processing', () => {
    it('should process a valid file successfully', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
      
      const result = await processor.processFile(file)
      
      expect(result.processed).toBe('MOCK FILE CONTENT [POST-PROCESSED]')
      expect(mockProgressCallback).toHaveBeenCalledWith(
        expect.objectContaining({ stage: 'complete', progress: 100 })
      )
    })

    it('should report progress during processing', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      
      await processor.processFile(file)
      
      const progressCalls = mockProgressCallback.mock.calls.map(call => call[0])
      expect(progressCalls).toContainEqual(
        expect.objectContaining({ stage: 'validation', progress: 0 })
      )
      expect(progressCalls).toContainEqual(
        expect.objectContaining({ stage: 'parsing', progress: 25 })
      )
      expect(progressCalls).toContainEqual(
        expect.objectContaining({ stage: 'transformation', progress: 50 })
      )
      expect(progressCalls).toContainEqual(
        expect.objectContaining({ stage: 'complete', progress: 100 })
      )
    })

    it('should handle validation errors', async () => {
      const file = new File(['test'], 'invalid-test.txt', { type: 'text/plain' })
      
      await expect(processor.processFile(file)).rejects.toThrow(FileProcessingError)
      await expect(processor.processFile(file)).rejects.toThrow('VALIDATION_FAILED')
    })

    it('should handle parsing errors', async () => {
      const file = new File(['test'], 'parse-error.txt', { type: 'text/plain' })
      
      await expect(processor.processFile(file)).rejects.toThrow(FileProcessingError)
      await expect(processor.processFile(file)).rejects.toThrow('PARSE_ERROR')
    })
  })

  describe('File Validation', () => {
    it('should validate file size', async () => {
      const largeFile = new File(['x'.repeat(2 * 1024 * 1024)], 'large.txt', { type: 'text/plain' })
      
      const result = await processor.validateFile(largeFile)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain(expect.stringContaining('exceeds maximum allowed size'))
    })

    it('should validate file type', async () => {
      const invalidFile = new File(['test'], 'test.exe', { type: 'application/x-executable' })
      
      const result = await processor.validateFile(invalidFile)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain(expect.stringContaining('not allowed'))
    })

    it('should extract file metadata', async () => {
      const file = new File(['test'], 'test.txt', { 
        type: 'text/plain',
        lastModified: Date.now()
      })
      
      const result = await processor.validateFile(file)
      
      expect(result.metadata).toEqual({
        name: 'test.txt',
        size: 4,
        type: 'text/plain',
        lastModified: expect.any(Date),
        extension: 'txt'
      })
    })

    it('Property: should handle various file sizes', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10 * 1024 * 1024 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          async (size, name) => {
            const content = 'x'.repeat(Math.min(size, 1000)) // Limit for test performance
            const file = new File([content], `${name}.txt`, { type: 'text/plain' })
            
            const result = await processor.validateFile(file)
            
            expect(result.metadata?.size).toBe(content.length)
            expect(result.metadata?.name).toBe(`${name}.txt`)
          }
        ),
        { numRuns: 20 }
      )
    })
  })

  describe('File Reading Methods', () => {
    it('should read file as text', async () => {
      const file = new File(['test content'], 'test.txt')
      
      const content = await (processor as any).readFileAsText(file)
      
      expect(content).toBe('mock file content')
    })

    it('should read file as array buffer', async () => {
      const file = new File(['test content'], 'test.txt')
      
      const buffer = await (processor as any).readFileAsArrayBuffer(file)
      
      expect(buffer).toBeInstanceOf(ArrayBuffer)
    })

    it('should read file as data URL', async () => {
      const file = new File(['test content'], 'test.txt')
      
      const dataUrl = await (processor as any).readFileAsDataURL(file)
      
      expect(dataUrl).toMatch(/^data:/)
    })

    it('should handle file reading errors', async () => {
      const mockReader = new MockFileReader()
      mockReader.error = new Error('Read failed')
      global.FileReader = vi.fn(() => mockReader) as any

      const file = new File(['test'], 'test.txt')
      
      await expect((processor as any).readFileAsText(file)).rejects.toThrow(FileProcessingError)
    })
  })
})

describe('FileTypeDetector', () => {
  describe('File Type Detection', () => {
    it('should detect file type from MIME type and extension', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      
      const result = FileTypeDetector.detectFileType(file)
      
      expect(result.detectedType).toBe('application/pdf')
      expect(result.confidence).toBeGreaterThan(0.8)
      expect(result.possibleTypes).toContain('application/pdf')
    })

    it('should handle missing MIME type', () => {
      const file = new File(['content'], 'test.txt', { type: '' })
      
      const result = FileTypeDetector.detectFileType(file)
      
      expect(result.detectedType).toBe('text/plain')
      expect(result.confidence).toBeGreaterThan(0.5)
    })

    it('should check if file type is supported', () => {
      const pdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      const txtFile = new File(['content'], 'test.txt', { type: 'text/plain' })
      
      expect(FileTypeDetector.isSupported(pdfFile, ['application/pdf'])).toBe(true)
      expect(FileTypeDetector.isSupported(txtFile, ['application/pdf'])).toBe(false)
    })

    it('Property: should always return valid confidence range', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.constantFrom('txt', 'pdf', 'pptx', 'jpg', 'png'),
          (name, mimeType, extension) => {
            const file = new File(['content'], `${name}.${extension}`, { type: mimeType })
            
            const result = FileTypeDetector.detectFileType(file)
            
            expect(result.confidence).toBeGreaterThanOrEqual(0)
            expect(result.confidence).toBeLessThanOrEqual(1)
            expect(result.detectedType).toBeTruthy()
          }
        ),
        { numRuns: 30 }
      )
    })
  })
})

describe('FileSizeUtils', () => {
  describe('Size Formatting', () => {
    it('should format bytes correctly', () => {
      expect(FileSizeUtils.formatBytes(0)).toBe('0 B')
      expect(FileSizeUtils.formatBytes(1024)).toBe('1.0 KB')
      expect(FileSizeUtils.formatBytes(1024 * 1024)).toBe('1.0 MB')
      expect(FileSizeUtils.formatBytes(1536)).toBe('1.5 KB')
    })

    it('should parse size strings correctly', () => {
      expect(FileSizeUtils.parseSize('1 B')).toBe(1)
      expect(FileSizeUtils.parseSize('1 KB')).toBe(1024)
      expect(FileSizeUtils.parseSize('1 MB')).toBe(1024 * 1024)
      expect(FileSizeUtils.parseSize('1.5 KB')).toBe(1536)
    })

    it('should handle invalid size strings', () => {
      expect(() => FileSizeUtils.parseSize('invalid')).toThrow()
      expect(() => FileSizeUtils.parseSize('1 XB')).toThrow()
    })

    it('should check size limits', () => {
      expect(FileSizeUtils.isWithinLimit(1024, '2 KB')).toBe(true)
      expect(FileSizeUtils.isWithinLimit(2048, '1 KB')).toBe(false)
      expect(FileSizeUtils.isWithinLimit(1024, 2048)).toBe(true)
    })

    it('Property: format and parse should be inverse operations', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1024 * 1024 * 1024 }),
          (bytes) => {
            const formatted = FileSizeUtils.formatBytes(bytes)
            const parsed = FileSizeUtils.parseSize(formatted)
            
            // Allow for small rounding differences
            expect(Math.abs(parsed - bytes)).toBeLessThan(bytes * 0.01)
          }
        ),
        { numRuns: 50 }
      )
    })
  })
})

describe('FileValidator', () => {
  describe('File Name Validation', () => {
    it('should validate correct file names', () => {
      const result = FileValidator.validateFileName('test.txt')
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject empty file names', () => {
      const result = FileValidator.validateFileName('')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('File name cannot be empty')
    })

    it('should reject file names with invalid characters', () => {
      const result = FileValidator.validateFileName('test<file>.txt')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('File name contains invalid characters')
    })

    it('should reject reserved names', () => {
      const result = FileValidator.validateFileName('CON.txt')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('File name uses a reserved system name')
    })

    it('Property: should handle various valid file names', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 })
            .filter(s => !/[<>:"/\\|?*\x00-\x1f]/.test(s))
            .filter(s => !/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i.test(s)),
          (fileName) => {
            const result = FileValidator.validateFileName(fileName)
            expect(result.valid).toBe(true)
          }
        ),
        { numRuns: 30 }
      )
    })
  })

  describe('Extension Validation', () => {
    it('should validate allowed extensions', () => {
      expect(FileValidator.validateExtension('test.txt', ['.txt', '.md'])).toBe(true)
      expect(FileValidator.validateExtension('test.pdf', ['.txt', '.md'])).toBe(false)
    })

    it('should handle extensions with and without dots', () => {
      expect(FileValidator.validateExtension('test.txt', ['txt'])).toBe(true)
      expect(FileValidator.validateExtension('test.txt', ['.txt'])).toBe(true)
    })
  })

  describe('File Integrity Check', () => {
    it('should check basic file integrity', async () => {
      const file = new File(['valid content'], 'test.txt', { type: 'text/plain' })
      
      const result = await FileValidator.checkFileIntegrity(file)
      
      expect(result.valid).toBe(true)
      expect(result.issues).toHaveLength(0)
    })

    it('should detect suspiciously small files', async () => {
      const smallPdf = new File(['x'], 'test.pdf', { type: 'application/pdf' })
      
      const result = await FileValidator.checkFileIntegrity(smallPdf)
      
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('PDF file appears to be too small to be valid')
    })
  })
})