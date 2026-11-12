/**
 * Event Bus for inter-module communication
 * Provides a centralized event system for decoupled communication between features
 */

export type EventCallback<T = any> = (data: T) => void;

export interface EventSubscription {
  unsubscribe: () => void;
}

export interface EventBusEvents {
  // AI Suggestions Events
  'ai:suggestions:generated': { presentationId: string; suggestions: any[] };
  'ai:suggestions:applied': { suggestionId: string; presentationId: string };
  'ai:suggestions:dismissed': { suggestionId: string; presentationId: string };
  
  // Annotation Events
  'annotation:created': { slideId: string; annotation: any };
  'annotation:updated': { slideId: string; annotationId: string; changes: any };
  'annotation:deleted': { slideId: string; annotationId: string };
  
  // Branding Events
  'branding:preset:created': { presetId: string; preset: any };
  'branding:preset:applied': { presentationId: string; presetId: string };
  'branding:preset:deleted': { presetId: string };
  
  // Comments Events
  'comment:created': { presentationId: string; slideIndex: number; comment: any };
  'comment:replied': { presentationId: string; parentId: string; reply: any };
  'comment:resolved': { presentationId: string; commentId: string };
  'comment:updated': { presentationId: string; commentId: string; changes: any };
  
  // Import/Export Events
  'import:started': { fileName: string; fileSize: number };
  'import:progress': { fileName: string; progress: number };
  'import:completed': { fileName: string; presentationId: string };
  'import:failed': { fileName: string; error: string };
  'export:started': { presentationId: string; format: string };
  'export:completed': { presentationId: string; format: string; blob: Blob };
  'export:failed': { presentationId: string; format: string; error: string };
  
  // Diagram Events
  'diagram:node:created': { slideId: string; nodeId: string; node: any };
  'diagram:node:updated': { slideId: string; nodeId: string; changes: any };
  'diagram:node:deleted': { slideId: string; nodeId: string };
  'diagram:connection:created': { slideId: string; connectionId: string; connection: any };
  'diagram:connection:updated': { slideId: string; connectionId: string; changes: any };
  'diagram:connection:deleted': { slideId: string; connectionId: string };
  
  // Template Events
  'template:applied': { slideId: string; templateId: string };
  'template:customized': { slideId: string; templateId: string; changes: any };
  
  // General Events
  'presentation:updated': { presentationId: string; changes: any };
  'slide:updated': { presentationId: string; slideId: string; changes: any };
  'error:occurred': { module: string; error: Error; context?: any };
}

export class EventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private onceListeners: Map<string, Set<EventCallback>> = new Map();
  private maxListeners = 100;
  private debugMode = false;

  /**
   * Subscribe to an event
   */
  on<K extends keyof EventBusEvents>(
    event: K,
    callback: EventCallback<EventBusEvents[K]>
  ): EventSubscription {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const eventListeners = this.listeners.get(event)!;
    
    if (eventListeners.size >= this.maxListeners) {
      console.warn(`EventBus: Maximum listeners (${this.maxListeners}) reached for event: ${event}`);
    }

    eventListeners.add(callback);

    if (this.debugMode) {
      console.log(`EventBus: Subscribed to ${event}. Total listeners: ${eventListeners.size}`);
    }

    return {
      unsubscribe: () => {
        eventListeners.delete(callback);
        if (eventListeners.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  /**
   * Subscribe to an event that will only fire once
   */
  once<K extends keyof EventBusEvents>(
    event: K,
    callback: EventCallback<EventBusEvents[K]>
  ): EventSubscription {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set());
    }

    const onceEventListeners = this.onceListeners.get(event)!;
    onceEventListeners.add(callback);

    if (this.debugMode) {
      console.log(`EventBus: Subscribed once to ${event}. Total once listeners: ${onceEventListeners.size}`);
    }

    return {
      unsubscribe: () => {
        onceEventListeners.delete(callback);
        if (onceEventListeners.size === 0) {
          this.onceListeners.delete(event);
        }
      }
    };
  }

  /**
   * Emit an event to all subscribers
   */
  emit<K extends keyof EventBusEvents>(
    event: K,
    data: EventBusEvents[K]
  ): void {
    if (this.debugMode) {
      console.log(`EventBus: Emitting ${event}`, data);
    }

    // Call regular listeners
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`EventBus: Error in listener for ${event}:`, error);
          // Emit error event
          this.emit('error:occurred', {
            module: 'EventBus',
            error: error as Error,
            context: { event, data }
          });
        }
      });
    }

    // Call once listeners and remove them
    const onceEventListeners = this.onceListeners.get(event);
    if (onceEventListeners) {
      onceEventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`EventBus: Error in once listener for ${event}:`, error);
          this.emit('error:occurred', {
            module: 'EventBus',
            error: error as Error,
            context: { event, data }
          });
        }
      });
      this.onceListeners.delete(event);
    }
  }

  /**
   * Remove all listeners for a specific event
   */
  off<K extends keyof EventBusEvents>(event: K): void {
    this.listeners.delete(event);
    this.onceListeners.delete(event);
    
    if (this.debugMode) {
      console.log(`EventBus: Removed all listeners for ${event}`);
    }
  }

  /**
   * Remove all listeners for all events
   */
  clear(): void {
    this.listeners.clear();
    this.onceListeners.clear();
    
    if (this.debugMode) {
      console.log('EventBus: Cleared all listeners');
    }
  }

  /**
   * Get the number of listeners for an event
   */
  listenerCount<K extends keyof EventBusEvents>(event: K): number {
    const regularCount = this.listeners.get(event)?.size || 0;
    const onceCount = this.onceListeners.get(event)?.size || 0;
    return regularCount + onceCount;
  }

  /**
   * Get all event names that have listeners
   */
  eventNames(): string[] {
    const regularEvents = Array.from(this.listeners.keys());
    const onceEvents = Array.from(this.onceListeners.keys());
    return [...new Set([...regularEvents, ...onceEvents])];
  }

  /**
   * Enable or disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  /**
   * Set maximum number of listeners per event
   */
  setMaxListeners(max: number): void {
    this.maxListeners = max;
  }

  /**
   * Create a namespaced event bus for a specific module
   */
  namespace(prefix: string) {
    return {
      on: <K extends keyof EventBusEvents>(
        event: K,
        callback: EventCallback<EventBusEvents[K]>
      ) => this.on(`${prefix}:${event}` as K, callback),
      
      once: <K extends keyof EventBusEvents>(
        event: K,
        callback: EventCallback<EventBusEvents[K]>
      ) => this.once(`${prefix}:${event}` as K, callback),
      
      emit: <K extends keyof EventBusEvents>(
        event: K,
        data: EventBusEvents[K]
      ) => this.emit(`${prefix}:${event}` as K, data),
      
      off: <K extends keyof EventBusEvents>(event: K) => 
        this.off(`${prefix}:${event}` as K)
    };
  }

  /**
   * Wait for an event to be emitted (Promise-based)
   */
  waitFor<K extends keyof EventBusEvents>(
    event: K,
    timeout?: number
  ): Promise<EventBusEvents[K]> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | undefined;
      
      const subscription = this.once(event, (data) => {
        if (timeoutId) clearTimeout(timeoutId);
        resolve(data);
      });

      if (timeout) {
        timeoutId = setTimeout(() => {
          subscription.unsubscribe();
          reject(new Error(`EventBus: Timeout waiting for event: ${event}`));
        }, timeout);
      }
    });
  }

  /**
   * Create a filtered event listener that only fires when condition is met
   */
  filter<K extends keyof EventBusEvents>(
    event: K,
    condition: (data: EventBusEvents[K]) => boolean,
    callback: EventCallback<EventBusEvents[K]>
  ): EventSubscription {
    return this.on(event, (data) => {
      if (condition(data)) {
        callback(data);
      }
    });
  }
}

// Singleton instance
export const eventBus = new EventBus();

// Development helper
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).eventBus = eventBus;
  eventBus.setDebugMode(true);
}