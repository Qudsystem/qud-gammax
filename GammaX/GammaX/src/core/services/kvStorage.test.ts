import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { KVStorageService, KVStorageError, STORAGE_KEYS } from './kvStorage'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    _getStore: () => store
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('KVStorageService', () => {
  let storage: KVStorageService

  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()

    // Reset implementations to default
    localStorageMock.getItem.mockImplementation((key: string) => {
      const store = (localStorageMock as any)._getStore();
      return store[key] || null;
    });
    localStorageMock.setItem.mockImplementation((key: string, value: string) => {
      const store = (localStorageMock as any)._getStore();
      store[key] = value;
    });
    localStorageMock.removeItem.mockImplementation((key: string) => {
      const store = (localStorageMock as any)._getStore();
      delete store[key];
    });
    localStorageMock.key.mockImplementation((index: number) => {
      const store = (localStorageMock as any)._getStore();
      return Object.keys(store)[index] || null;
    });

    storage = new KVStorageService({ prefix: 'test:' })
  })

  describe('Basic Operations', () => {
    it('should set and get a value', async () => {
      const key = 'testKey'
      const value = { name: 'test', count: 42 }

      await storage.set(key, value)
      const retrieved = await storage.get(key)

      expect(retrieved).toEqual(value)
    })

    it('should return null for non-existent key', async () => {
      const result = await storage.get('nonExistent')
      expect(result).toBeNull()
    })

    it('should check if key exists', async () => {
      const key = 'existsTest'

      expect(await storage.has(key)).toBe(false)

      await storage.set(key, 'value')
      expect(await storage.has(key)).toBe(true)
    })

    it('should delete a key', async () => {
      const key = 'deleteTest'
      await storage.set(key, 'value')

      const deleted = await storage.delete(key)
      expect(deleted).toBe(true)
      expect(await storage.has(key)).toBe(false)

      const deletedAgain = await storage.delete(key)
      expect(deletedAgain).toBe(false)
    })

    it('should clear all keys with prefix', async () => {
      await storage.set('key1', 'value1')
      await storage.set('key2', 'value2')

      await storage.clear()

      expect(await storage.has('key1')).toBe(false)
      expect(await storage.has('key2')).toBe(false)
    })

    it('should get all keys', async () => {
      await storage.set('key1', 'value1')
      await storage.set('key2', 'value2')

      const keys = await storage.keys()
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
      expect(keys).toHaveLength(2)
    })
  })

  describe('Property: Data Integrity', () => {
    it('Property: should preserve data through set/get cycle', async () => {
      await fc.assert(
        fc.property(
          fc.record({
            key: fc.string({ minLength: 1, maxLength: 50 }),
            value: fc.oneof(
              fc.string(),
              fc.integer(),
              fc.boolean(),
              fc.array(fc.string()),
              fc.record({
                name: fc.string(),
                age: fc.integer({ min: 0, max: 150 }),
                active: fc.boolean()
              })
            )
          }),
          async ({ key, value }) => {
            localStorageMock.clear()
            vi.clearAllMocks()
            const testStorage = new KVStorageService({ prefix: 'test:' })
            await testStorage.set(key, value)
            const retrieved = await testStorage.get(key)
            expect(retrieved).toEqual(value)
          }
        ),
        { numRuns: 50 }
      )
    })

    it('Property: should handle various key formats', async () => {
      await fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => !s.includes('\0')),
          fc.string(),
          async (key, value) => {
            localStorageMock.clear()
            vi.clearAllMocks()
            const testStorage = new KVStorageService({ prefix: 'test:' })
            await testStorage.set(key, value)
            expect(await testStorage.has(key)).toBe(true)
            expect(await testStorage.get(key)).toBe(value)
          }
        ),
        { numRuns: 30 }
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle localStorage quota exceeded', async () => {
      const originalSetItem = localStorageMock.setItem
      localStorageMock.setItem = vi.fn(() => {
        const error = new DOMException('QuotaExceededError', 'QuotaExceededError')
        // @ts-ignore
        error.code = 22
        throw error
      })

      try {
        await expect(storage.set('key', 'value')).rejects.toThrow(KVStorageError)
      } finally {
        localStorageMock.setItem = originalSetItem
      }
    })

    it('should handle localStorage access errors', async () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Access denied')
      })

      await expect(storage.get('key')).rejects.toThrow(KVStorageError)
      await expect(storage.get('key')).rejects.toThrow(/GET failed after/)
    })

    it('should handle corrupted data gracefully', async () => {
      localStorageMock.getItem.mockReturnValue('invalid json')

      await expect(storage.get('key')).rejects.toThrow(KVStorageError)
      await expect(storage.get('key')).rejects.toThrow(/GET failed after/)
    })
  })

  describe('Batch Operations', () => {
    it('should perform batch operations', async () => {
      const operations = [
        { type: 'set' as const, key: 'key1', value: 'value1' },
        { type: 'set' as const, key: 'key2', value: 'value2' },
        { type: 'delete' as const, key: 'key3' }
      ]

      await storage.batch(operations)

      expect(await storage.get('key1')).toBe('value1')
      expect(await storage.get('key2')).toBe('value2')
    })
  })

  describe('Storage Info', () => {
    it('should provide storage information', async () => {
      const info = await storage.getStorageInfo()

      expect(info).toHaveProperty('used')
      expect(info).toHaveProperty('available')
      expect(info).toHaveProperty('total')
      expect(info).toHaveProperty('percentage')
      expect(info.used).toBeGreaterThanOrEqual(0)
      expect(info.total).toBeGreaterThan(0)
      expect(info.percentage).toBeGreaterThanOrEqual(0)
      expect(info.percentage).toBeLessThanOrEqual(100)
    })
  })

  describe('Retry Logic', () => {
    it('should retry failed operations', async () => {
      let attempts = 0
      localStorageMock.setItem.mockImplementation(() => {
        attempts++
        if (attempts < 3) {
          throw new Error('Temporary failure')
        }
      })

      await storage.set('key', 'value')
      expect(attempts).toBe(3)
    })

    it('should fail after max retries', async () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Permanent failure')
      })

      await expect(storage.set('key', 'value')).rejects.toThrow(KVStorageError)
      await expect(storage.set('key', 'value')).rejects.toThrow(/SET failed after/)
    })
  })

  describe('Prefix Isolation', () => {
    it('should isolate keys by prefix', async () => {
      const storage1 = new KVStorageService({ prefix: 'app1:' })
      const storage2 = new KVStorageService({ prefix: 'app2:' })

      await storage1.set('key', 'value1')
      await storage2.set('key', 'value2')

      expect(await storage1.get('key')).toBe('value1')
      expect(await storage2.get('key')).toBe('value2')
    })
  })
})

describe('STORAGE_KEYS', () => {
  it('should generate correct storage keys', () => {
    expect(STORAGE_KEYS.presentation('123')).toBe('presentation:123')
    expect(STORAGE_KEYS.presentationList()).toBe('presentations:list')
    expect(STORAGE_KEYS.suggestions('abc')).toBe('suggestions:abc')
    expect(STORAGE_KEYS.annotations('slide1')).toBe('annotations:slide1')
    expect(STORAGE_KEYS.brandingPresets()).toBe('branding:presets')
    expect(STORAGE_KEYS.comments('pres1')).toBe('comments:pres1')
    expect(STORAGE_KEYS.diagram('slide2')).toBe('diagram:slide2')
    expect(STORAGE_KEYS.templates()).toBe('templates:diagrams')
    expect(STORAGE_KEYS.engagement('pres2')).toBe('engagement:pres2')
  })

  it('Property: should generate unique keys for different IDs', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        (id1, id2) => {
          fc.pre(id1 !== id2)

          expect(STORAGE_KEYS.presentation(id1)).not.toBe(STORAGE_KEYS.presentation(id2))
          expect(STORAGE_KEYS.suggestions(id1)).not.toBe(STORAGE_KEYS.suggestions(id2))
          expect(STORAGE_KEYS.annotations(id1)).not.toBe(STORAGE_KEYS.annotations(id2))
        }
      ),
      { numRuns: 50 }
    )
  })
})