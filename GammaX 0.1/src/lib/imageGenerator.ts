export async function generateImageUrl(prompt: string): Promise<string> {
  // لتفادي أخطاء ORB/CORS، لا نجري طلبات HEAD من المتصفح
  // نرجّح مصدر صور ثابت وموثوق ثم نوفّر بديل SVG عند الحاجة
  const seed = Math.abs(
    prompt.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  ) + Math.floor(Math.random() * 1000);

  // Picsum كمصدر أساسي
  const picsum = `https://picsum.photos/seed/${seed}/1920/1080.jpg`;
  // Dicebear كبديل SVG آمن
  const fallback = getPlaceholderImage(prompt);

  // نُعيد رابط picsum مباشرةً؛ المتصفح يتعامل مع الفشل تلقائياً
  // ويمكن للمكوّنات إضافة onError إن لزم الأمر
  return picsum || fallback;
}

export function getPlaceholderImage(topic: string, width: number = 1920, height: number = 1080): string {
  // قائمة من الألوان الاحترافية
  const colors = [
    '6366f1,8b5cf6', // أزرق بنفسجي
    '8b5cf6,d946ef', // بنفسجي وردي
    '3b82f6,06b6d4', // أزرق سماوي
    'f59e0b,ef4444', // برتقالي أحمر
    '10b981,06b6d4', // أخضر سماوي
    'ec4899,8b5cf6', // وردي بنفسجي
    'f97316,ef4444', // برتقالي أحمر
    '0ea5e9,6366f1', // أزرق سماوي أزرق بنفسجي
  ];

  // اختيار لون عشوائي
  const color = colors[Math.floor(Math.random() * colors.length)];

  // إنشاء seed فريد من الموضوع
  const seed = Math.abs(topic.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));

  // استخدام خدمات متعددة للصور البديلة
  const placeholderServices = [
    // Dicebear للصور المولدة
    `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundColor=${color}&width=${width}&height=${height}`,
    // Picsum كخيار آخر
    `https://picsum.photos/seed/${seed}/${width}/${height}.jpg`,
    // Herokuapp كخيار ثالث
    `https://picsum.photos/seed/${topic.replace(/\s+/g, '-')}/${width}/${height}.jpg`,
  ];

  // إرجاع أول خيار متاح
  return placeholderServices[0];
}
