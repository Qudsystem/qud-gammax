/**
 * KV Storage Service
 * 
 * Provides a unified interface for key-value storage operations
 * with error handling, type safety, and browser compatibility.
 */

export interface StorageError extends Error {
  code: string;
  details?: any;
}

export class KVStorageError extends Error implements StorageError {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'KVStorageError';
  }
}

export interface KVStorageOptions {
  prefix?: string;
  maxRetries?: number;
  retryDelay?: number;
}

export interface SerializedData<T = any> {
  version: string;
  data: T;
  timestamp: number;
}

/**
 * KV Storage Service Implementation
 */
export class KVStorageService {
  private prefix: string;
  private maxRetries: number;
  private retryDelay: number;

  constructor(options: KVStorageOptions = {}) {
    this.prefix = options.prefix || 'gammax:';
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 100;
  }

  /**
   * Get the full key with prefix
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Serialize data for storage
   */
  private serialize<T>(data: T): string {
    const serialized: SerializedData<T> = {
      version: '1.0',
      data,
      timestamp: Date.now()
    };
    return JSON.stringify(serialized);
  }

  /**
   * Deserialize data from storage
   */
  private deserialize<T>(serialized: string): T {
    try {
      const parsed: SerializedData<T> = JSON.parse(serialized);
      return parsed.data;
    } catch (error) {
      throw new KVStorageError(
        'DESERIALIZATION_ERROR',
        'Failed to deserialize stored data',
        { error, serialized }
      );
    }
  }

  /**
   * Check if storage is available
   */
  private checkStorageAvailability(): void {
    if (typeof Storage === 'undefined') {
      throw new KVStorageError(
        'STORAGE_UNAVAILABLE',
        'Web Storage is not available in this environment'
      );
    }
  }

  /**
   * Execute operation with retry logic
   */
  private async withRetry<T>(
    operation: () => T | Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.maxRetries) {
          await new Promise(resolve => 
            setTimeout(resolve, this.retryDelay * Math.pow(2, attempt))
          );
        }
      }
    }

    throw new KVStorageError(
      'OPERATION_FAILED',
      `${operationName} failed after ${this.maxRetries + 1} attempts`,
      { lastError }
    );
  }

  /**
   * Set a value in storage
   */
  async set<T>(key: string, value: T): Promise<void> {
    this.checkStorageAvailability();

    return this.withRetry(async () => {
      try {
        const serialized = this.serialize(value);
        const fullKey = this.getKey(key);
        
        localStorage.setItem(fullKey, serialized);
      } catch (error) {
        if (error instanceof DOMException && error.code === 22) {
          throw new KVStorageError(
            'STORAGE_QUOTA_EXCEEDED',
            'Storage quota exceeded. Please free up space.',
            { key, error }
          );
        }
        throw new KVStorageError(
          'STORAGE_WRITE_ERROR',
          'Failed to write to storage',
          { key, error }
        );
      }
    }, 'SET');
  }

  /**
   * Get a value from storage
   */
  async get<T>(key: string): Promise<T | null> {
    this.checkStorageAvailability();

    return this.withRetry(async () => {
      try {
        const fullKey = this.getKey(key);
        const serialized = localStorage.getItem(fullKey);
        if (serialized === null) return null;
        return this.deserialize<T>(serialized);
      } catch (error) {
        throw new KVStorageError(
          'STORAGE_READ_ERROR',
          'Failed to read from storage',
          { key, error }
        );
      }
    }, 'GET');
  }

  /**
   * Check if a key exists in storage
   */
  async has(key: string): Promise<boolean> {
    this.checkStorageAvailability();

    return this.withRetry(async () => {
      try {
        const fullKey = this.getKey(key);
        return localStorage.getItem(fullKey) !== null;
      } catch (error) {
        throw new KVStorageError(
          'STORAGE_READ_ERROR',
          'Failed to check key existence',
          { key, error }
        );
      }
    }, 'HAS');
  }

  /**
   * Delete a value from storage
   */
  async delete(key: string): Promise<boolean> {
    this.checkStorageAvailability();

    return this.withRetry(async () => {
      try {
        const fullKey = this.getKey(key);
        const existed = localStorage.getItem(fullKey) !== null;
        localStorage.removeItem(fullKey);
        return existed;
      } catch (error) {
        throw new KVStorageError(
          'STORAGE_DELETE_ERROR',
          'Failed to delete from storage',
          { key, error }
        );
      }
    }, 'DELETE');
  }

  /**
   * Clear all keys with the current prefix
   */
  async clear(): Promise<void> {
    this.checkStorageAvailability();

    return this.withRetry(async () => {
      try {
        const keysToDelete: string[] = [];
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.prefix)) {
            keysToDelete.push(key);
          }
        }

        keysToDelete.forEach(key => localStorage.removeItem(key));
      } catch (error) {
        throw new KVStorageError(
          'STORAGE_CLEAR_ERROR',
          'Failed to clear storage',
          { error }
        );
      }
    }, 'CLEAR');
  }

  /**
   * Get all keys with the current prefix
   */
  async keys(): Promise<string[]> {
    this.checkStorageAvailability();

    return this.withRetry(async () => {
      try {
        const keys: string[] = [];
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.prefix)) {
            keys.push(key.substring(this.prefix.length));
          }
        }

        return keys;
      } catch (error) {
        throw new KVStorageError(
          'STORAGE_READ_ERROR',
          'Failed to get keys from storage',
          { error }
        );
      }
    }, 'KEYS');
  }

  /**
   * Get storage usage information
   */
  async getStorageInfo(): Promise<{
    used: number;
    available: number;
    total: number;
    percentage: number;
  }> {
    this.checkStorageAvailability();

    return this.withRetry(async () => {
      try {
        // Calculate used space by serializing all localStorage content
        let used = 0;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          const value = localStorage.getItem(key || '');
          if (key && value) {
            used += key.length + value.length;
          }
        }

        // Estimate total available space (varies by browser, typically 5-10MB)
        const total = 10 * 1024 * 1024; // 10MB estimate
        const available = total - used;
        const percentage = (used / total) * 100;

        return {
          used,
          available,
          total,
          percentage
        };
      } catch (error) {
        throw new KVStorageError(
          'STORAGE_INFO_ERROR',
          'Failed to get storage information',
          { error }
        );
      }
    }, 'STORAGE_INFO');
  }

  /**
   * Batch operations for better performance
   */
  async batch(operations: Array<{
    type: 'set' | 'delete';
    key: string;
    value?: any;
  }>): Promise<void> {
    this.checkStorageAvailability();

    return this.withRetry(async () => {
      try {
        for (const op of operations) {
          if (op.type === 'set') {
            await this.set(op.key, op.value);
          } else if (op.type === 'delete') {
            await this.delete(op.key);
          }
        }
      } catch (error) {
        throw new KVStorageError(
          'BATCH_OPERATION_ERROR',
          'Batch operation failed',
          { operations, error }
        );
      }
    }, 'BATCH');
  }
}

// Storage key constants for the application
export const STORAGE_KEYS = {
  // Presentations
  presentation: (id: string) => `presentation:${id}`,
  presentationList: () => 'presentations:list',
  
  // AI Suggestions
  suggestions: (presentationId: string) => `suggestions:${presentationId}`,
  suggestionHistory: (presentationId: string) => `suggestions:history:${presentationId}`,
  
  // Annotations
  annotations: (slideId: string) => `annotations:${slideId}`,
  annotationHistory: (slideId: string) => `annotations:history:${slideId}`,
  
  // Branding
  brandingPresets: () => 'branding:presets',
  brandingPreset: (id: string) => `branding:preset:${id}`,
  
  // Comments
  comments: (presentationId: string) => `comments:${presentationId}`,
  commentThreads: (presentationId: string) => `comments:threads:${presentationId}`,
  
  // Diagrams
  diagram: (slideId: string) => `diagram:${slideId}`,
  diagramHistory: (slideId: string) => `diagram:history:${slideId}`,
  
  // Templates
  templates: () => 'templates:diagrams',
  templatesByCategory: (category: string) => `templates:${category}`,
  
  // Engagement Data
  engagement: (presentationId: string) => `engagement:${presentationId}`,
} as const;

// Default storage service instance
export const kvStorage = new KVStorageService({
  prefix: 'gammax:',
  maxRetries: 3,
  retryDelay: 100
});