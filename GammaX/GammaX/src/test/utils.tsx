import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import * as fc from 'fast-check'

// Test wrapper with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Fast-check arbitraries for common types
export const arbitraries = {
  // Basic types
  nonEmptyString: () => fc.string({ minLength: 1, maxLength: 100 }),
  email: () => fc.emailAddress(),
  url: () => fc.webUrl(),
  uuid: () => fc.uuid(),
  
  // Colors
  hexColor: () => fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
  rgbColor: () => fc.record({
    r: fc.integer({ min: 0, max: 255 }),
    g: fc.integer({ min: 0, max: 255 }),
    b: fc.integer({ min: 0, max: 255 })
  }),
  
  // Coordinates and dimensions
  coordinate: () => fc.float({ min: -1000, max: 1000 }),
  positiveNumber: () => fc.float({ min: 0.1, max: 1000 }),
  percentage: () => fc.float({ min: 0, max: 100 }),
  
  // Dates
  pastDate: () => fc.date({ max: new Date() }),
  futureDate: () => fc.date({ min: new Date() }),
  
  // File-related
  fileName: () => fc.string({ minLength: 1, maxLength: 50 }).map(s => `${s}.txt`),
  fileSize: () => fc.integer({ min: 1, max: 50 * 1024 * 1024 }), // Up to 50MB
  
  // Presentation-related
  slideContent: () => fc.record({
    id: fc.uuid(),
    title: fc.string({ minLength: 1, maxLength: 100 }),
    content: fc.string({ maxLength: 1000 }),
    order: fc.integer({ min: 0, max: 100 })
  }),
  
  // Engagement data
  engagementMetrics: () => fc.record({
    views: fc.integer({ min: 0, max: 10000 }),
    averageViewTime: fc.float({ min: 0, max: 3600 }),
    dropOffRate: fc.float({ min: 0, max: 1 }),
    interactionCount: fc.integer({ min: 0, max: 1000 })
  }),
  
  // Annotation data
  annotation: () => fc.record({
    id: fc.uuid(),
    type: fc.constantFrom('arrow', 'circle', 'rectangle', 'line', 'freehand', 'text', 'highlight'),
    position: fc.record({
      x: fc.float({ min: 0, max: 1920 }),
      y: fc.float({ min: 0, max: 1080 })
    }),
    style: fc.record({
      color: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
      strokeWidth: fc.integer({ min: 1, max: 10 })
    })
  }),
  
  // Branding data
  brandingPreset: () => fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    colors: fc.record({
      primary: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
      secondary: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
      accent: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`)
    }),
    fonts: fc.record({
      heading: fc.constantFrom('Arial', 'Helvetica', 'Times New Roman', 'Georgia'),
      body: fc.constantFrom('Arial', 'Helvetica', 'Times New Roman', 'Georgia')
    })
  }),
  
  // Comment data
  comment: () => fc.record({
    id: fc.uuid(),
    content: fc.string({ minLength: 1, maxLength: 500 }),
    author: fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1, max: 50 }),
      avatar: fc.option(fc.webUrl())
    }),
    createdAt: fc.date(),
    resolved: fc.boolean()
  }),
  
  // Diagram data
  diagramNode: () => fc.record({
    id: fc.uuid(),
    type: fc.constantFrom('rectangle', 'circle', 'diamond', 'hexagon'),
    position: fc.record({
      x: fc.float({ min: 0, max: 1000 }),
      y: fc.float({ min: 0, max: 1000 })
    }),
    size: fc.record({
      width: fc.float({ min: 50, max: 300 }),
      height: fc.float({ min: 30, max: 200 })
    }),
    text: fc.string({ maxLength: 100 }),
    style: fc.record({
      fillColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
      borderColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
      borderWidth: fc.integer({ min: 1, max: 5 })
    })
  })
}

// Property test helpers
const propertyTestObj = {
  // Run a property test with default configuration
  run: function<T>(
    arbitrary: fc.Arbitrary<T>,
    predicate: (value: T) => boolean | void,
    options: { numRuns?: number; seed?: number } = {}
  ) {
    return fc.assert(
      fc.property(arbitrary, predicate),
      { 
        numRuns: options.numRuns || 100,
        seed: options.seed,
        verbose: true
      }
    )
  },
  
  // Run a property test that expects an exception
  expectThrow: function<T>(
    arbitrary: fc.Arbitrary<T>,
    predicate: (value: T) => void,
    options: { numRuns?: number } = {}
  ) {
    return fc.assert(
      fc.property(arbitrary, (value: T) => {
        try {
          predicate(value)
          return false // Should have thrown
        } catch {
          return true // Expected exception
        }
      }),
      { numRuns: options.numRuns || 100 }
    )
  }
}

export const propertyTest = propertyTestObj

// Mock data generators
export const mockData = {
  presentation: () => ({
    id: fc.sample(fc.uuid(), 1)[0],
    title: fc.sample(fc.string({ minLength: 1, maxLength: 100 }), 1)[0],
    slides: fc.sample(fc.array(arbitraries.slideContent(), { minLength: 1, maxLength: 20 }), 1)[0],
    createdAt: new Date(),
    updatedAt: new Date()
  }),
  
  user: () => ({
    id: fc.sample(fc.uuid(), 1)[0],
    name: fc.sample(fc.string({ minLength: 1, maxLength: 50 }), 1)[0],
    email: fc.sample(fc.emailAddress(), 1)[0]
  })
}