import { describe, it, expect, beforeEach } from 'vitest';
import { TemplateManager } from '../services/TemplateManager';

describe('TemplateManager', () => {
  let manager: TemplateManager;

  beforeEach(() => {
    manager = new TemplateManager();
  });

  it('should return initial templates', () => {
    const templates = manager.getTemplates();
    expect(templates.length).toBeGreaterThan(0);
  });

  it('should filter by category', () => {
    const templates = manager.getTemplatesByCategory('business');
    expect(templates.every(t => t.category === 'business')).toBe(true);
  });

  it('should search templates', () => {
    const results = manager.searchTemplates('timeline');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name.toLowerCase()).toContain('timeline');
  });

  it('should get template by ID', () => {
    const t1 = manager.getTemplates()[0];
    const found = manager.getTemplateById(t1.id);
    expect(found).toEqual(t1);
  });
});
