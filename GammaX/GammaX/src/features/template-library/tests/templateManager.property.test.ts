import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { TemplateManager } from '../services/TemplateManager';

describe('TemplateManager Property Tests', () => {
  let manager: TemplateManager;

  beforeEach(() => {
    manager = new TemplateManager();
  });

  it('search should be case insensitive', () => {
    fc.assert(
      fc.property(fc.string(), (query) => {
        const resultsLower = manager.searchTemplates(query.toLowerCase());
        const resultsUpper = manager.searchTemplates(query.toUpperCase());
        expect(resultsLower.length).toEqual(resultsUpper.length);
      })
    );
  });

  it('getTemplateById should always return consistent result', () => {
    const templates = manager.getTemplates();
    if (templates.length === 0) return;
    
    fc.assert(
      fc.property(fc.constantFrom(...templates.map(t => t.id)), (id) => {
        const t1 = manager.getTemplateById(id);
        const t2 = manager.getTemplateById(id);
        expect(t1).toEqual(t2);
        expect(t1).toBeDefined();
      })
    );
  });
});
