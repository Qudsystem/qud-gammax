// تكامل مع Gemini AI API
const API_KEY = (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : import.meta.env.VITE_GEMINI_API_KEY) || '';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export interface GeminiConfig {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
}

export async function generateContentWithGemini(
  prompt: string,
  config: GeminiConfig = {}
): Promise<string> {
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: config.temperature || 0.7,
          topK: config.topK || 40,
          topP: config.topP || 0.95,
          maxOutputTokens: config.maxOutputTokens || 8192,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

// دالة متخصصة لإنشاء عروض تقديمية
export async function generatePresentationWithGemini(
  topic: string,
  numSlides: number,
  style: string,
  language: string = 'en'
): Promise<any> {
  const prompt = `
    Generate a presentation about "${topic}" with ${numSlides} slides in ${language} language.

    The presentation should follow the "${style}" style.

    Return the result as a JSON object with the following structure:
    {
      "title": "Presentation title",
      "slides": [
        {
          "id": "slide-1",
          "layout": "title",
          "title": "Slide title",
          "content": ["Content point 1", "Content point 2"],
          "imagePrompt": "A professional image representing the slide content"
        },
        ...
      ]
    }

    Available layouts: title, content, bullets, two-column, quote, image-text, split-image, full-image.

    For slides with images (title, image-text, split-image, full-image), include an "imagePrompt" field.

    Ensure at least 2-3 slides have images.
  `;

  try {
    const response = await generateContentWithGemini(prompt);
    // محاولة تحليل الاستجابة كـ JSON
    try {
      return JSON.parse(response);
    } catch (parseError) {
      // إذا فشل التحليل، محاولة استخراج JSON من النص
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Failed to parse JSON from Gemini response');
    }
  } catch (error) {
    console.error('Error generating presentation with Gemini:', error);
    throw error;
  }
}
