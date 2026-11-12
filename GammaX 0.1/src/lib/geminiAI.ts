import { GoogleGenerativeAI } from "@google/generative-ai";
import { Presentation, PresentationStyle } from './types';
import { loadProviderSettings } from './settings';

function getGeminiKey(): string | undefined {
  const settings = loadProviderSettings();
  const settingsKey = settings.geminiApiKey;
  const envKey = (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_GEMINI_API_KEY : undefined) as string | undefined;
  const procKey = (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined) as string | undefined;
  const lsKey = (typeof window !== 'undefined' ? window.localStorage.getItem('gemini_api_key') || undefined : undefined) as string | undefined;
  return settingsKey || envKey || procKey || lsKey;
}

export async function generateContentWithGemini(prompt: string, style: PresentationStyle, numSlides: number): Promise<Presentation> {
  const key = getGeminiKey();
  if (!key) throw new Error('مفتاح Gemini API غير متوفر');

  const genAI = new GoogleGenerativeAI(key);
  const modelCandidates = [
    "gemini-1.5-pro-latest",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro"
  ];

  const sys = `You are a professional presentation designer and content strategist.
Your goal is to create a high-quality, professional, and visually engaging slide presentation based on the user's topic.

CRITICAL INSTRUCTIONS:
1. CONTENT DEPTH: Each slide must have substantial, well-researched content. Avoid generic "placeholder" text. Provide actual insights, data points (where applicable), and professional phrasing.
2. STRUCTURE: The presentation should follow a logical flow: Introduction -> Problem Statement/Context -> Core Solutions/Key Points -> Detailed Breakdown -> Practical Applications -> Conclusion/Summary.
3. VISUALS: Provide highly descriptive "imagePrompt" values that describe professional, context-relevant imagery (e.g., "A high-resolution photograph of a modern office space with diverse professionals collaborating on a digital interface, symbolizing innovation and teamwork").
4. FORMATTING: Return ONLY valid JSON with the following structure:
{
  "title": "Presentation Main Title",
  "description": "Professional executive summary of the presentation",
  "slides": [
    {
      "id": "slide-id",
      "layout": "title | content | bullets | two-column | quote | image-text | split-image | full-image",
      "title": "Slide Title",
      "content": ["Key point 1", "Detailed explanation of key point 2", "Insightful conclusion for this slide"],
      "imagePrompt": "Detailed description of a professional image related to this slide's content",
      "notes": "Speaker notes providing more depth and context for this slide"
    }
  ]
}
5. LAYOUT VARIETY: Use a mix of layouts (e.g., bullets for lists, two-column for comparisons, quote for emphasis) to keep the presentation engaging.
6. LANGUAGE: Generate content in the same language as the user's topic unless specified otherwise.

Topic: ${prompt}
Style: ${style}
Number of Slides: ${numSlides}
`;

  let result: any = null;
  let lastErr: any = null;
  for (const m of modelCandidates) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      result = await model.generateContent([
        { text: sys },
        { text: `Topic: ${prompt}` },
        { text: `Style: ${style}` },
        { text: `Number of slides: ${numSlides}` },
      ]);
      if (result) break;
    } catch (err: any) {
      lastErr = err;
      const msg = String(err?.message || "");
      if (msg.includes("404") || msg.includes("not found") || msg.includes("not supported")) {
        // جرّب الموديل التالي
        continue;
      }
      throw err;
    }
  }
  if (!result) {
    throw lastErr || new Error("فشل اختيار نموذج Gemini مناسب");
  }

  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('لم يتم العثور على JSON صالح في استجابة Gemini AI');
  }
  const data = JSON.parse(jsonMatch[0]);

  const presentation: Presentation = {
    id: `pres-${Date.now()}`,
    title: data.title || 'عرض تقديمي جديد',
    description: data.description || `عرض تقديمي حول ${prompt}`,
    slides: (data.slides || []).map((slide: any, index: number) => ({
      id: `slide-${Date.now()}-${index}`,
      layout: slide.layout || 'content',
      title: slide.title || `شريحة ${index + 1}`,
      content: Array.isArray(slide.content) ? slide.content : [slide.content || ''],
      notes: `ملاحظات لشريحة ${index + 1}`,
      animation: 'fade',
      transitionDuration: 400,
      ...(slide.imagePrompt && { imagePrompt: slide.imagePrompt })
    })),
    style,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return presentation;
}

export async function generateImageWithGemini(prompt: string): Promise<string> {
  const key = getGeminiKey();
  if (!key) throw new Error('مفتاح Gemini API غير متوفر');
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const res = await model.generateContent([
    { text: `وصف محسّن لإنشاء صورة: "${prompt}". قم بتحسين هذا الوصف ليكون أكثر تفصيلاً ومناسباً لإنشاء صورة احترافية.` }
  ]);
  const enhancedPrompt = res.response.text();
  return `https://picsum.photos/seed/${encodeURIComponent(enhancedPrompt)}/800/600.jpg`;
}
