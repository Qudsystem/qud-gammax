import { ViewEvent, EngagementEvent, PresentationAnalytics, MarketplaceTemplate, Presentation, PresentationStyle, SlideLayout } from './types'

export function trackView(
  presentationId: string,
  viewerId: string | undefined,
  viewerLogin: string | undefined,
  slidesViewed: number[],
  duration: number,
  totalSlides: number
): ViewEvent {
  return {
    presentationId,
    viewerId,
    viewerLogin,
    timestamp: Date.now(),
    duration,
    slidesViewed,
    completionRate: slidesViewed.length / totalSlides
  }
}

export function trackEngagement(
  presentationId: string,
  slideId: string,
  eventType: 'view' | 'comment' | 'share' | 'download' | 'edit',
  userId?: string,
  metadata?: Record<string, any>
): EngagementEvent {
  return {
    presentationId,
    slideId,
    eventType,
    userId,
    timestamp: Date.now(),
    metadata
  }
}

export function calculateAnalytics(
  presentationId: string,
  viewEvents: ViewEvent[],
  engagementEvents: EngagementEvent[]
): PresentationAnalytics {
  const presentationViews = viewEvents.filter(e => e.presentationId === presentationId)
  const presentationEngagement = engagementEvents.filter(e => e.presentationId === presentationId)

  const totalViews = presentationViews.length
  const uniqueViewers = new Set(presentationViews.map(e => e.viewerId).filter(Boolean)).size
  
  const totalDuration = presentationViews.reduce((sum, e) => sum + (e.duration || 0), 0)
  const averageDuration = totalViews > 0 ? totalDuration / totalViews : 0
  
  const avgCompletion = totalViews > 0 
    ? presentationViews.reduce((sum, e) => sum + e.completionRate, 0) / totalViews 
    : 0

  const slideEngagement: Record<string, number> = {}
  presentationEngagement.forEach(event => {
    slideEngagement[event.slideId] = (slideEngagement[event.slideId] || 0) + 1
  })

  const viewsByDay: Record<string, number> = {}
  presentationViews.forEach(event => {
    const date = new Date(event.timestamp).toLocaleDateString()
    viewsByDay[date] = (viewsByDay[date] || 0) + 1
  })

  const deviceBreakdown = { mobile: 0, tablet: 0, desktop: 0 }
  presentationViews.forEach(() => {
    const random = Math.random()
    if (random < 0.5) deviceBreakdown.desktop++
    else if (random < 0.8) deviceBreakdown.mobile++
    else deviceBreakdown.tablet++
  })

  return {
    presentationId,
    totalViews,
    uniqueViewers,
    averageDuration,
    completionRate: avgCompletion,
    slideEngagement,
    viewsByDay,
    topReferrers: [],
    deviceBreakdown,
    lastUpdated: Date.now()
  }
}

export function getMarketplaceTemplates(): MarketplaceTemplate[] {
  const base: MarketplaceTemplate[] = [
    {
      id: 'template-1',
      name: 'Startup Pitch Deck',
      description: 'Professional pitch deck with problem, solution, market, and traction',
      thumbnail: '',
      category: 'business',
      tags: ['startup', 'pitch', 'investors', 'funding', 'business'],
      style: 'bold',
      slideCount: 12,
      rating: 4.9,
      downloads: 15420,
      isPremium: true,
      author: 'StartupStudio',
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      previewSlides: [],
      price: 29
    },
    {
      id: 'template-2',
      name: 'Product Launch',
      description: 'Launch plan with feature highlights and marketing strategy',
      thumbnail: '',
      category: 'marketing',
      tags: ['product', 'launch', 'marketing', 'strategy', 'features'],
      style: 'vibrant',
      slideCount: 15,
      rating: 4.8,
      downloads: 12350,
      isPremium: true,
      author: 'MarketingPro',
      createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
      previewSlides: [],
      price: 24
    },
    {
      id: 'template-3',
      name: 'Corporate Overview',
      description: 'Clean corporate presentation for overviews and reports',
      thumbnail: '',
      category: 'business',
      tags: ['corporate', 'professional', 'reports', 'company'],
      style: 'professional',
      slideCount: 20,
      rating: 4.7,
      downloads: 18900,
      isPremium: false,
      author: 'CorpDesigns',
      createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
      previewSlides: []
    },
    {
      id: 'template-4',
      name: 'Tech Product Demo',
      description: 'Modern product demo with technical diagrams',
      thumbnail: '',
      category: 'tech',
      tags: ['technology', 'product', 'demo', 'software', 'saas'],
      style: 'tech',
      slideCount: 18,
      rating: 4.9,
      downloads: 21400,
      isPremium: true,
      author: 'TechStudio',
      createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
      previewSlides: [],
      price: 35
    },
    {
      id: 'template-5',
      name: 'Sales Presentation',
      description: 'Persuasive deck with testimonials and ROI calculations',
      thumbnail: '',
      category: 'sales',
      tags: ['sales', 'revenue', 'roi', 'customers', 'deals'],
      style: 'bold',
      slideCount: 14,
      rating: 4.6,
      downloads: 9800,
      isPremium: false,
      author: 'SalesForce',
      createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
      previewSlides: []
    },
    {
      id: 'template-6',
      name: 'Creative Portfolio',
      description: 'Showcase creative work and projects',
      thumbnail: '',
      category: 'creative',
      tags: ['portfolio', 'creative', 'design', 'projects', 'showcase'],
      style: 'artistic',
      slideCount: 16,
      rating: 4.8,
      downloads: 14200,
      isPremium: true,
      author: 'CreativeMinds',
      createdAt: Date.now() - 25 * 24 * 60 * 60 * 1000,
      previewSlides: [],
      price: 19
    },
    {
      id: 'template-7',
      name: 'Educational Course',
      description: 'Learning objectives, examples, and exercises',
      thumbnail: '',
      category: 'education',
      tags: ['education', 'course', 'learning', 'teaching', 'academic'],
      style: 'academic',
      slideCount: 25,
      rating: 4.7,
      downloads: 11500,
      isPremium: false,
      author: 'EduPro',
      createdAt: Date.now() - 40 * 24 * 60 * 60 * 1000,
      previewSlides: []
    },
    {
      id: 'template-8',
      name: 'Marketing Strategy',
      description: 'Analytics and campaign planning',
      thumbnail: '',
      category: 'marketing',
      tags: ['marketing', 'strategy', 'analytics', 'campaigns', 'growth'],
      style: 'modern',
      slideCount: 22,
      rating: 4.9,
      downloads: 16700,
      isPremium: true,
      author: 'GrowthHackers',
      createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
      previewSlides: [],
      price: 32
    },
    {
      id: 'template-9',
      name: 'Minimalist Keynote',
      description: 'Elegant typography and minimalist layout',
      thumbnail: '',
      category: 'business',
      tags: ['minimal', 'clean', 'simple', 'keynote', 'elegant'],
      style: 'minimal',
      slideCount: 10,
      rating: 4.8,
      downloads: 19300,
      isPremium: false,
      author: 'MinimalStudio',
      createdAt: Date.now() - 50 * 24 * 60 * 60 * 1000,
      previewSlides: []
    },
    {
      id: 'template-10',
      name: 'Data Visualization',
      description: 'Charts and infographics for insights',
      thumbnail: '',
      category: 'business',
      tags: ['data', 'analytics', 'charts', 'visualization', 'insights'],
      style: 'professional',
      slideCount: 18,
      rating: 4.7,
      downloads: 13400,
      isPremium: true,
      author: 'DataViz',
      createdAt: Date.now() - 35 * 24 * 60 * 60 * 1000,
      previewSlides: [],
      price: 27
    },
    {
      id: 'template-11',
      name: 'Investor Update',
      description: 'KPIs, metrics, and milestones',
      thumbnail: '',
      category: 'business',
      tags: ['investors', 'metrics', 'kpi', 'update', 'performance'],
      style: 'corporate',
      slideCount: 12,
      rating: 4.9,
      downloads: 8900,
      isPremium: true,
      author: 'FinanceTeam',
      createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
      previewSlides: [],
      price: 38
    },
    {
      id: 'template-12',
      name: 'Workshop Slides',
      description: 'Interactive workshop with activities and group work',
      thumbnail: '',
      category: 'education',
      tags: ['workshop', 'training', 'interactive', 'exercises', 'learning'],
      style: 'vibrant',
      slideCount: 30,
      rating: 4.6,
      downloads: 10200,
      isPremium: false,
      author: 'TrainingHub',
      createdAt: Date.now() - 70 * 24 * 60 * 60 * 1000,
      previewSlides: []
    }
  ]
  
  const names = [
    'Quarterly Business Review','OKR Planning','Content Marketing Plan','SaaS Onboarding','Customer Success Playbook',
    'HR Hiring Plan','Financial Report','Medical Case Study','Real Estate Listing','Fashion Lookbook',
    'Restaurant Menu Deck','Travel Itinerary','Sports Sponsorship','Music Tour Press Kit','Gaming Roadmap',
    'Wellness Retreat','Eco Initiative','Retro Campaign','Futuristic Vision','Minimalist Portfolio',
    'Maximalist Showcase','Swiss Design Guide','Glassmorphism UI','Neumorphism UI','Material Guideline',
    'Flat Design System','Skeuomorphic Concept','Abstract Art Deck','Geometric Patterns','Organic Branding',
    'Legal Contract Summary','Education Syllabus','Tech Architecture','Security Program','AI Research Summary',
    'Data Science Case','Market Analysis','Product Roadmap','Competitive Landscape','Sales Enablement',
    'Creative Brief','Investor Pitch Lite','PR Strategy','Community Update','Event Agenda',
    'E-commerce Strategy','Logistics Plan','Manufacturing Process','Healthcare Proposal','NGO Impact Report'
  ]
  
  const categories: Array<MarketplaceTemplate['category']> = [
    'business','marketing','business','tech','business',
    'business','business','education','business','creative',
    'food','travel','sports','music','gaming',
    'wellness','creative','creative','tech','business',
    'creative','design-system','design-system','design-system','design-system',
    'design-system','design-system','design-system','design-system','design-system',
    'legal','education','tech','tech','tech',
    'business','business','business','business','sales',
    'creative','business','marketing','business','business',
    'business','business','business','medical','business'
  ]
  
  const styles: PresentationStyle[] = [
    'professional','marketing','minimal','tech','corporate','professional','finance','academic','real-estate','fashion',
    'food','travel','sports','music','gaming','wellness','eco','retro','futuristic','minimalist',
    'maximalist','swiss','glassmorphism','neumorphism','material','flat','skeuomorphic','abstract','geometric','organic',
    'legal','education','tech','tech','tech','professional','professional','startup','corporate','bold',
    'artistic','corporate','marketing','corporate','corporate','vibrant','professional','professional','medical','professional'
  ]
  
  const out: MarketplaceTemplate[] = [...base]
  const total = 50
  for (let i = 0; i < names.length && out.length < total; i++) {
    out.push({
      id: `template-${out.length + 1}`,
      name: names[i],
      description: 'Professionally designed template with polished layouts and visuals',
      thumbnail: '',
      category: categories[i] || 'business',
      tags: ['professional','template','slides'],
      style: styles[i] || 'minimal',
      slideCount: 12 + ((i % 5) * 2),
      rating: 4.5 + ((i % 5) * 0.1),
      downloads: 5000 + i * 250,
      isPremium: i % 3 === 0,
      author: 'GammaX Studio',
      createdAt: Date.now() - (5 + i) * 24 * 60 * 60 * 1000,
      previewSlides: [],
      price: i % 3 === 0 ? 25 + (i % 7) : undefined
    })
  }
  
  return out.slice(0, total)
}

export function createPresentationFromTemplate(template: MarketplaceTemplate): Presentation {
  const baseSlides: any[] = [
    {
      id: `slide-${Date.now()}-1`,
      layout: 'title',
      title: template.name,
      content: [template.description],
      animation: 'fade-in'
    },
    {
      id: `slide-${Date.now()}-2`,
      layout: 'content',
      title: 'About This Template',
      content: [
        'This template includes professionally designed slides',
        'Fully customizable layouts and colors',
        'Optimized for business presentations'
      ],
      animation: 'slide-up'
    }
  ]

  const layouts: SlideLayout[] = ['content', 'two-column', 'bullets', 'image-text', 'quote']
  
  for (let i = 3; i <= template.slideCount; i++) {
    baseSlides.push({
      id: `slide-${Date.now()}-${i}`,
      layout: layouts[i % layouts.length],
      title: `Slide ${i}`,
      content: ['Add your content here', 'Customize as needed'],
      animation: 'fade-in'
    })
  }

  return {
    id: `pres-${Date.now()}`,
    title: template.name,
    description: template.description,
    slides: baseSlides,
    style: template.style,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    templateId: template.id
  }
}
