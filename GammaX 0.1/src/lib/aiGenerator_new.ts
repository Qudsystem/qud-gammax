import { Presentation, Slide, PresentationStyle, SlideLayout } from './types'
import { generateImageUrl } from './imageGenerator'
import { generateContentWithGemini } from './geminiAI'

// A more sophisticated mock generation function
async function generateRealisticMockPresentation(
  prompt: string,
  style: PresentationStyle,
  numSlides: number
): Promise<Presentation> {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 2500));

  const keywords = prompt.split(' ').filter(w => w.length > 3);
  const mainTopic = keywords.length > 0 ? keywords.join(' ') : 'New Presentation';

  const slideTemplates: { title: (topic: string) => string; layout: SlideLayout; content: (topic: string) => string[] }[] = [
    {
      title: (topic) => `The Future of ${topic}`,
      layout: 'title',
      content: (topic) => [`A comprehensive overview of what's next for ${topic}.`, `Key predictions and upcoming innovations.`]
    },
    {
      title: (topic) => `Understanding ${topic}`,
      layout: 'content',
      content: (topic) => [`${topic} is a paradigm-shifting technology with far-reaching implications.`, `This presentation will break down its core principles and applications.`]
    },
    {
      title: (topic) => `Key Features of ${topic}`,
      layout: 'bullets',
      content: (topic) => [`Scalable architecture for ${topic}`, `Intuitive user interface`, `Seamless integration with existing systems`, `Advanced security protocols for ${topic}`]
    },
    {
      title: () => 'A Word from an Expert',
      layout: 'quote',
      content: () => [`"We are at the precipice of a new era, and this technology is leading the charge."`, `Industry Analyst`]
    },
    {
      title: (topic) => `${topic} in Practice`,
      layout: 'image-text',
      content: (topic) => [`Real-world applications of ${topic} are already making a significant impact across various sectors.`]
    },
    {
      title: () => 'Pros and Cons',
      layout: 'two-column',
      content: () => [`Highly efficient and cost-effective.`, `Reduces manual labor by up to 70%.`, `Initial setup can be complex.`, `Requires specialized training for team members.`]
    },
    {
      title: (topic) => `Visualizing ${topic}`,
      layout: 'split-image',
      content: (topic) => [`A powerful visual metaphor for ${topic}'s core concept.`]
    },
    {
      title: (topic) => `The Impact of ${topic}`,
      layout: 'full-image',
      content: (topic) => [`A stunning visual that captures essence of ${topic}'s influence.`]
    }
  ];

  const slides: Slide[] = [];
  for (let i = 0; i < numSlides; i++) {
    const template = slideTemplates[i % slideTemplates.length];
    const slideTitle = template.title(mainTopic);
    const slideContent = template.content(mainTopic);
    const needsImage = template.layout === 'title' || template.layout === 'image-text' || template.layout === 'full-image' || template.layout === 'split-image';

    const slide: Slide = {
      id: `slide-${Date.now()}-${i}`,
      layout: template.layout,
      title: slideTitle,
      content: slideContent,
      notes: `This is a slide about ${slideTitle}`,
      animation: 'fade',
      transitionDuration: 400,
      ...(needsImage && {
        imagePrompt: `A professional, high-quality image representing: ${mainTopic}, ${slideTitle}`
      })
    };
    slides.push(slide);
  }

  const slidesWithImages = await Promise.all(
    slides.map(async (slide) => {
      if (slide.imagePrompt) {
        try {
          slide.imageUrl = await generateImageUrl(slide.imagePrompt);
        } catch (error) {
          console.error('Failed to generate image for slide:', error);
          // Keep going without image if generation fails
        }
      }
      return slide;
    })
  );

  return {
    id: `pres-${Date.now()}`,
    title: mainTopic,
    description: `A presentation about ${prompt}`,
    slides: slidesWithImages,
    style,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export async function generatePresentation(
    prompt: string,
    style: PresentationStyle = 'minimal',
    numSlides: number = 6,
    config: { language?: string; ratio?: string; textDensity?: string } = {}
  ): Promise<Presentation> {
    console.log(`Generating presentation with Gemini AI for: "${prompt}"`);
    try {
      // استخدام Gemini AI لإنشاء العرض التقديمي
      const presentation = await generateContentWithGemini(prompt, style, numSlides);

      // إضافة الصور إلى الشرائح التي تتطلب صور
      const slidesWithImages = await Promise.all(
        presentation.slides.map(async (slide) => {
          if (slide.imagePrompt) {
            try {
              slide.imageUrl = await generateImageUrl(slide.imagePrompt);
            } catch (error) {
              console.error('Failed to generate image for slide:', error);
              // الاستمرار بدون صورة إذا فشل إنشاؤها
            }
          }
          return slide;
        })
      );

      return {
        ...presentation,
        slides: slidesWithImages
      };
    } catch (error) {
      console.error('Presentation generation failed:', error);
      // في حالة فشل Gemini AI، استخدام المحاكاة كبديل
      console.log('Falling back to mock generation...');
      return generateRealisticMockPresentation(prompt, style, numSlides);
    }
}
