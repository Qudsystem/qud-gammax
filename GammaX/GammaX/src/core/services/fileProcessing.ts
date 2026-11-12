/**
 * File Processing Service
 * 
 * Base class and utilities for handling file operations including
 * validation, parsing, and transformation for various file formats.
 */

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: FileMetadata;
}

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: Date;
  extension: string;
}

export interface ProcessingProgress {
  stage: string;
  progress: number; // 0-100
  message: string;
}

export interface FileProcessingOptions {
  maxFileSize?: number;
  allowedTypes?: string[];
  validateContent?: boolean;
  progressCallback?: (progress: ProcessingProgress) => void;
}

export class FileProcessingError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'FileProcessingError';
  }
}

/**
 * Abstract base class for file processing operations
 */
export abstract class FileProcessorBase<TInput, TOutput> {
  protected options: FileProcessingOptions;

  constructor(options: FileProcessingOptions = {}) {
    this.options = {
      maxFileSize: 50 * 1024 * 1024, // 50MB default
      allowedTypes: [],
      validateContent: true,
      ...options
    };
  }

  /**
   * Process a file from input to output format
   */
  async processFile(file: File): Promise<TOutput> {
    try {
      this.reportProgress('validation', 0, 'Validating file...');
      
      // Validate file
      const validation = await this.validateFile(file);
      if (!validation.valid) {
        throw new FileProcessingError(
          'VALIDATION_FAILED',
          `File validation failed: ${validation.errors.join(', ')}`,
          { validation }
        );
      }

      this.reportProgress('parsing', 25, 'Parsing file content...');
      
      // Parse file content
      const parsed = await this.parseFile(file);
      
      this.reportProgress('transformation', 50, 'Transforming content...');
      
      // Transform to output format
      const transformed = await this.transformContent(parsed);
      
      this.reportProgress('finalization', 75, 'Finalizing...');
      
      // Post-process if needed
      const result = await this.postProcess(transformed);
      
      this.reportProgress('complete', 100, 'Processing complete');
      
      return result;
    } catch (error) {
      this.reportProgress('error', -1, `Processing failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate file before processing
   */
  async validateFile(file: File): Promise<FileValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file size
    if (this.options.maxFileSize && file.size > this.options.maxFileSize) {
      errors.push(`File size (${this.formatFileSize(file.size)}) exceeds maximum allowed size (${this.formatFileSize(this.options.maxFileSize)})`);
    }

    // Check file type
    if (this.options.allowedTypes && this.options.allowedTypes.length > 0) {
      const isAllowed = this.options.allowedTypes.some(type => 
        file.type === type || file.name.toLowerCase().endsWith(type.toLowerCase())
      );
      
      if (!isAllowed) {
        errors.push(`File type '${file.type}' is not allowed. Allowed types: ${this.options.allowedTypes.join(', ')}`);
      }
    }

    // Extract metadata
    const metadata: FileMetadata = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified),
      extension: this.getFileExtension(file.name)
    };

    // Perform custom validation
    const customValidation = await this.customValidation(file, metadata);
    errors.push(...customValidation.errors);
    warnings.push(...customValidation.warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metadata
    };
  }

  /**
   * Get file extension
   */
  protected getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot > 0 ? filename.substring(lastDot + 1).toLowerCase() : '';
  }

  /**
   * Format file size for display
   */
  protected formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Report processing progress
   */
  protected reportProgress(stage: string, progress: number, message: string): void {
    if (this.options.progressCallback) {
      this.options.progressCallback({ stage, progress, message });
    }
  }

  /**
   * Read file as text
   */
  protected async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new FileProcessingError(
        'FILE_READ_ERROR',
        'Failed to read file as text',
        { error: reader.error }
      ));
      reader.readAsText(file);
    });
  }

  /**
   * Read file as array buffer
   */
  protected async readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new FileProcessingError(
        'FILE_READ_ERROR',
        'Failed to read file as array buffer',
        { error: reader.error }
      ));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Read file as data URL
   */
  protected async readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new FileProcessingError(
        'FILE_READ_ERROR',
        'Failed to read file as data URL',
        { error: reader.error }
      ));
      reader.readAsDataURL(file);
    });
  }

  // Abstract methods to be implemented by subclasses
  protected abstract customValidation(file: File, metadata: FileMetadata): Promise<{ errors: string[]; warnings: string[] }>;
  protected abstract parseFile(file: File): Promise<TInput>;
  protected abstract transformContent(input: TInput): Promise<TOutput>;
  protected abstract postProcess(output: TOutput): Promise<TOutput>;
}

/**
 * File type detection utilities
 */
export class FileTypeDetector {
  private static readonly MIME_TYPE_MAP: Record<string, string[]> = {
    'application/vnd.ms-powerpoint': ['.ppt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    'application/pdf': ['.pdf'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/svg+xml': ['.svg'],
    'text/plain': ['.txt'],
    'application/json': ['.json'],
    'text/csv': ['.csv']
  };

  /**
   * Detect file type from file object
   */
  static detectFileType(file: File): {
    detectedType: string;
    confidence: number;
    possibleTypes: string[];
  } {
    const extension = file.name.toLowerCase().split('.').pop() || '';
    const mimeType = file.type;

    // Check if MIME type matches extension
    const expectedExtensions = this.MIME_TYPE_MAP[mimeType] || [];
    const extensionMatches = expectedExtensions.includes(`.${extension}`);

    let confidence = 0.5; // Base confidence
    let detectedType = mimeType || 'application/octet-stream';
    const possibleTypes: string[] = [];

    if (mimeType && extensionMatches) {
      confidence = 0.9; // High confidence when both match
      possibleTypes.push(mimeType);
    } else if (mimeType) {
      confidence = 0.7; // Medium confidence with MIME type only
      possibleTypes.push(mimeType);
    } else if (extension) {
      // Try to infer from extension
      for (const [mime, extensions] of Object.entries(this.MIME_TYPE_MAP)) {
        if (extensions.includes(`.${extension}`)) {
          detectedType = mime;
          confidence = 0.6; // Lower confidence when inferring
          possibleTypes.push(mime);
          break;
        }
      }
    }

    return {
      detectedType,
      confidence,
      possibleTypes
    };
  }

  /**
   * Check if file type is supported for a specific operation
   */
  static isSupported(file: File, supportedTypes: string[]): boolean {
    const detection = this.detectFileType(file);
    return supportedTypes.some(type => 
      detection.possibleTypes.includes(type) || 
      file.name.toLowerCase().endsWith(type.toLowerCase())
    );
  }
}

/**
 * File size utilities
 */
export class FileSizeUtils {
  static readonly UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

  /**
   * Convert bytes to human readable format
   */
  static formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + this.UNITS[i];
  }

  /**
   * Parse human readable size to bytes
   */
  static parseSize(sizeStr: string): number {
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*([KMGT]?B)$/i);
    if (!match) {
      throw new Error(`Invalid size format: ${sizeStr}`);
    }

    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    const unitIndex = this.UNITS.indexOf(unit as any);

    if (unitIndex === -1) {
      throw new Error(`Unknown unit: ${unit}`);
    }

    return value * Math.pow(1024, unitIndex);
  }

  /**
   * Check if file size is within limit
   */
  static isWithinLimit(fileSize: number, limit: number | string): boolean {
    const limitBytes = typeof limit === 'string' ? this.parseSize(limit) : limit;
    return fileSize <= limitBytes;
  }
}

/**
 * File validation utilities
 */
export class FileValidator {
  /**
   * Validate file name
   */
  static validateFileName(fileName: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for empty name
    if (!fileName || fileName.trim().length === 0) {
      errors.push('File name cannot be empty');
    }

    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (invalidChars.test(fileName)) {
      errors.push('File name contains invalid characters');
    }

    // Check length
    if (fileName.length > 255) {
      errors.push('File name is too long (maximum 255 characters)');
    }

    // Check for reserved names (Windows)
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i;
    if (reservedNames.test(fileName)) {
      errors.push('File name uses a reserved system name');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate file extension
   */
  static validateExtension(fileName: string, allowedExtensions: string[]): boolean {
    const extension = fileName.toLowerCase().split('.').pop() || '';
    return allowedExtensions.some(ext => 
      ext.toLowerCase() === extension || ext.toLowerCase() === `.${extension}`
    );
  }

  /**
   * Check if file appears to be corrupted based on basic checks
   */
  static async checkFileIntegrity(file: File): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Check if file can be read
      const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file.slice(0, 1024)); // Read first 1KB
      });

      // Basic checks based on file type
      if (file.type.startsWith('text/')) {
        // For text files, try to decode as UTF-8
        try {
          new TextDecoder('utf-8', { fatal: true }).decode(buffer);
        } catch {
          issues.push('File appears to contain invalid UTF-8 text');
        }
      }

      // Check for minimum file size for certain types
      if (file.type === 'application/pdf' && file.size < 100) {
        issues.push('PDF file appears to be too small to be valid');
      }

      if (file.type.includes('powerpoint') && file.size < 1000) {
        issues.push('PowerPoint file appears to be too small to be valid');
      }

    } catch (error) {
      issues.push('Unable to read file content');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}