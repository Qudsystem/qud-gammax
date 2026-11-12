# Planning Guide

A complete Gamma AI clone: an AI-powered presentation and document generator that transforms ideas, prompts, or outlines into beautiful, professionally designed slides with AI-generated images, intelligent content generation, and modern interactive layouts.

**Experience Qualities**: 
1. **Magical** - AI seamlessly transforms raw ideas into polished presentations with stunning visuals, feeling effortless and delightful
2. **Modern** - Cutting-edge design with smooth animations, gradient accents, and contemporary visual language
3. **Empowering** - Users create professional content with AI-generated images without design skills, focusing purely on ideas

**Complexity Level**: Complex Application (advanced functionality with AI integration)
  - Integrates AI content generation, AI image generation, complex state management, dynamic slide rendering, fullscreen presentation mode, and sophisticated UI interactions

## Essential Features

### AI Prompt Input with Enhanced UX
- **Functionality**: Accept detailed text prompts with visual style selector and keyboard shortcuts
- **Purpose**: Enable users to generate presentations from natural language descriptions with ease
- **Trigger**: User enters prompt in main input area and clicks generate or presses Cmd/Ctrl+Enter
- **Progression**: Prompt entered → Style selected → AI processes → Images generated → Outline created → Slides created → Preview displayed
- **Success criteria**: Generates 6-10 relevant slides with images within 15-20 seconds; handles various prompt styles

### AI Image Generation
- **Functionality**: Automatically generates relevant images for slides using AI image generation API
- **Purpose**: Create visually rich presentations with custom imagery matching content
- **Trigger**: During slide generation for image-focused layouts
- **Progression**: Slide content analyzed → Image prompt created → API called → Image URL generated → Image embedded
- **Success criteria**: 2-3 slides per presentation include relevant, high-quality AI-generated images

### Intelligent Slide Generation with 8 Layouts
- **Functionality**: AI creates structured slides with titles, content, layouts (title, content, bullets, two-column, quote, image-text, split-image, full-image), and design suggestions
- **Purpose**: Automate the entire slide creation process with visual variety
- **Trigger**: Prompt submission
- **Progression**: Prompt analyzed → Content structured → Layout selected → Images generated → Design applied → Slides rendered
- **Success criteria**: Each slide has coherent content, appropriate layout, visual hierarchy, and variety across presentation

### Fullscreen Presentation Mode
- **Functionality**: Present slides in fullscreen with keyboard navigation and slide counter
- **Purpose**: Allow users to present directly from the app
- **Trigger**: Click "Present" button
- **Progression**: View entered → Fullscreen activated → Slide displayed → Arrow keys navigate → ESC exits
- **Success criteria**: Smooth transitions, clear controls, professional presentation experience

### Live Slide Preview with Animations
- **Functionality**: Animated preview of slides with smooth transitions and motion effects
- **Purpose**: Create an engaging, premium viewing experience
- **Trigger**: Slide selection or navigation
- **Progression**: Slide selected → Fade/scale animation → Content revealed → Motion effects applied
- **Success criteria**: Smooth 60fps animations, staggered content reveals, professional feel

### Style Customization System
- **Functionality**: Switch between 4 presentation styles (minimal, bold, professional, creative) with instant preview
- **Purpose**: Personalize visual aesthetic to match brand or preference
- **Trigger**: Style selector in dialog or prompt input
- **Progression**: Style selected → Theme applied → Colors/fonts updated → All slides refresh → Changes persisted
- **Success criteria**: Instant visual changes, consistent styling across all slides, smooth transitions

### Presentation Management with KV Storage
- **Functionality**: Auto-save, load, and manage multiple presentations with persistence using useKV
- **Purpose**: Enable iterative work and portfolio of presentations
- **Trigger**: Auto-save after generation, manual load from grid view
- **Progression**: Slides created → Auto-saved to KV → Listed in grid → Retrievable anytime → Delete option
- **Success criteria**: Presentations persist across sessions, instant load times, visual grid layout

### Enhanced Loading Experience
- **Functionality**: Multi-stage animated loading screen showing generation progress
- **Purpose**: Keep users engaged during AI processing
- **Trigger**: Generation started
- **Progression**: Animation shown → Steps displayed → Progress bar animated → Completion transition
- **Success criteria**: Engaging visuals, clear communication, estimated time shown

## Edge Case Handling
- **Vague prompts**: Guide user with 6 diverse example prompts and generate best-guess content
- **Very long prompts**: Truncate at 1000 characters with visual counter
- **AI generation failures**: Show friendly error with retry option and troubleshooting tips
- **Image generation failures**: Gracefully skip images and continue with text-only slides
- **Empty slides**: Provide placeholder content and edit capabilities
- **Slow generation**: Show detailed progress with animated loading states

## Design Direction
The design should feel magical, premium, and cutting-edge like Gamma AI - featuring bold gradient accents, generous white space, smooth animations, floating cards with subtle shadows, and delightful micro-interactions that make content creation feel like magic.

## Color Selection
Complementary color scheme with vibrant purple/blue gradients for AI/tech feeling, cyan accents for energy and interactivity, and soft lavender backgrounds for elegance.

- **Primary Color**: Rich purple (oklch(0.50 0.22 280)) - Innovation, creativity, premium AI technology
- **Secondary Colors**: Soft lavender backgrounds (oklch(0.94 0.04 280)) - Elegant, spacious, modern
- **Accent Color**: Electric cyan (oklch(0.65 0.20 220)) - Energy, technology, interactive focus elements
- **Foreground/Background Pairings**: 
  - Background (Light lavender oklch(0.98 0.02 280)): Dark purple text oklch(0.20 0.08 280) - Ratio 14.5:1 ✓
  - Card (White oklch(1 0 0)): Dark text oklch(0.20 0.08 280) - Ratio 15.2:1 ✓
  - Primary (Rich purple oklch(0.50 0.22 280)): White text oklch(1 0 0) - Ratio 8.2:1 ✓
  - Accent (Cyan oklch(0.65 0.20 220)): Light background oklch(0.98 0.02 280) - Ratio 7.1:1 ✓
  - Secondary (Lavender oklch(0.94 0.04 280)): Dark text oklch(0.20 0.08 280) - Ratio 12.3:1 ✓

## Font Selection
Use Outfit for headings (geometric, modern, distinctive with tight letter-spacing) and Inter for body text (highly legible, professional), creating a contemporary premium feel.

- **Typographic Hierarchy**: 
  - H1 (App Title): Outfit Bold/48px/tight letter spacing (-0.02em)
  - H2 (Page Titles): Outfit Semibold/32px/tight spacing
  - H3 (Section Headers): Outfit Semibold/24px/normal spacing
  - Body (Slide content): Inter Regular/18px/relaxed line height 1.7
  - UI Text: Inter Medium/14px/normal spacing
  - Labels: Inter Semibold/11px/wide letter spacing uppercase
  - Small Text: Inter Regular/12px/normal spacing

## Animations
Purposeful, smooth animations emphasizing AI magic and premium feel - slide generation with staggered fade-ins, smooth page transitions, floating gradients, scale transforms, and micro-interactions on all controls.

- **Purposeful Meaning**: 
  - Loading screen uses rotating sparkle icon with pulsing gradient backdrop to show AI processing
  - Slide generation uses staggered fade-in (100ms delays) to show AI creating content progressively
  - Smooth page transitions with fade/scale reinforce spatial relationships
  - Button interactions provide tactile feedback with hover states
  - Presentation mode transitions use slide animations for professional feel
  
- **Hierarchy of Movement**: 
  - Critical feedback (Generation progress) → Page transitions (300ms) → Slide appearance (200ms stagger) → Navigation (200ms) → Hover states (150ms) → Click feedback (100ms)

## Component Selection
- **Components**: 
  - Card for slide previews, prompt input, and list items with elevation and hover states
  - Button with gradient variants for primary CTA, outline for secondary actions
  - Textarea with character counter for prompt input
  - Dialog for style picker and settings
  - Tabs for switching between Create and View modes
  - ScrollArea for slide navigation sidebar
  - Badge for slide count, layout type, and style indicators
  - Separator for visual sections
  - Motion components for all animations (framer-motion)
  
- **Customizations**: 
  - Gradient button with animated background for primary CTA ("Generate Presentation")
  - Fullscreen presentation viewer with overlay controls
  - Animated loading screen with multi-stage progress
  - Style selector grid with emoji indicators
  - Enhanced prompt input with example chips and keyboard shortcuts
  - Slide preview with 8 different layout renderers including image support
  - Grid layout for presentation library
  
- **States**: 
  - Generate button: default (gradient), hover (opacity change), active (pressed), loading (animated sparkle)
  - Slide cards: default (subtle shadow), hover (lift + scale), selected (accent border + background)
  - Input: default, focus (accent ring), counting (character limit), disabled
  - Presentation mode: fullscreen overlay with controls
  
- **Icon Selection**: 
  - Sparkle (filled) for AI generation and branding
  - Lightning for prompt input
  - Image for image indicators
  - Play (filled) for presentation mode
  - Palette for style selection
  - CaretLeft/CaretRight for navigation
  - Plus for new presentation
  - Trash for delete
  - Calendar for timestamps
  - CheckCircle for completion states
  
- **Spacing**: 
  - Generous spacing: 8-unit (2rem) gaps between major sections
  - Card padding: 6-unit (1.5rem) for comfortable breathing room
  - Component groups: 4-unit (1rem) for related items
  - Tight spacing: 2-unit (0.5rem) for inline elements
  - Emphasis on negative space and visual clarity
  
- **Mobile**: 
  - Fullscreen slide editor on mobile with swipe gestures
  - Stacked layout for Create tab (no sidebar)
  - Simplified toolbar with essential actions only
  - Vertical slide thumbnails in scrollable list
  - Touch-optimized 44px minimum tap targets
  - Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
