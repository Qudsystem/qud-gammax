import { MarketplaceTemplate } from '@/lib/types';

export class TemplateManager {
  private templates: MarketplaceTemplate[] = [];

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // Initial dummy templates
    this.templates = [
      {
        id: 'template-1',
        name: 'Project Timeline',
        description: 'A timeline for project milestones',
        thumbnail: '',
        category: 'business',
        tags: ['timeline', 'project'],
        style: 'professional',
        slideCount: 1,
        rating: 4.5,
        downloads: 100,
        isPremium: false,
        author: 'GammaX',
        createdAt: Date.now(),
        previewSlides: []
      }
    ];
  }

  getTemplates(): MarketplaceTemplate[] {
    return this.templates;
  }

  getTemplatesByCategory(category: MarketplaceTemplate['category']): MarketplaceTemplate[] {
    return this.templates.filter(t => t.category === category);
  }

  searchTemplates(query: string): MarketplaceTemplate[] {
    const q = query.toLowerCase();
    return this.templates.filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.description.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }

  getTemplateById(id: string): MarketplaceTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }
}

export const templateManager = new TemplateManager();
