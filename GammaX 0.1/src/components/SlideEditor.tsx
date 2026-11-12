import React, { useState } from 'react'
import { Slide, SlideLayout } from '@/lib/types'
import { Button } from './ui/button'
import { 
  ArrowLeft, 
  ArrowRight, 
  Image as ImageIcon, 
  Palette,
  TextT as TextIcon,
  Trash,
  Plus,
  Check
} from '@phosphor-icons/react'

interface SlideEditorProps {
  slide: Slide
  onSlideChange: (updatedSlide: Slide) => void
}

export function SlideEditor({ slide, onSlideChange }: SlideEditorProps) {
  const [activeTab, setActiveTab] = useState('content')
  const [selectedColor, setSelectedColor] = useState('#3b82f6')
  const [selectedFont, setSelectedFont] = useState('Inter')
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSlideChange({ ...slide, title: e.target.value })
  }

  const handleContentChange = (index: number, value: string) => {
    const newContent = [...slide.content]
    newContent[index] = value
    onSlideChange({ ...slide, content: newContent })
  }

  const addContentItem = () => {
    const newContent = [...slide.content, 'عنصر جديد']
    onSlideChange({ ...slide, content: newContent })
  }

  const removeContentItem = (index: number) => {
    const newContent = slide.content.filter((_, i) => i !== index)
    onSlideChange({ ...slide, content: newContent })
  }
  
  const handleImageChange = async () => {
    if (!slide.imagePrompt) return
    
    try {
      // استيراد دالة توليد الصور
      const { generateImageUrl } = await import('@/lib/imageGenerator')
      const newImageUrl = await generateImageUrl(slide.imagePrompt)
      onSlideChange({ ...slide, imageUrl: newImageUrl })
    } catch (error) {
      console.error('Failed to generate new image:', error)
    }
  }
  
  const handleImagePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSlideChange({ ...slide, imagePrompt: e.target.value })
  }

  const renderLayoutEditor = () => {
    switch (slide.layout) {
      case 'bullets':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">Content</label>
            {slide.content.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleContentChange(index, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <Button variant="destructive" size="sm" onClick={() => removeContentItem(index)}>
                  Remove
                </Button>
              </div>
            ))}
            <Button onClick={addContentItem} size="sm">Add Bullet</Button>
          </div>
        )
      case 'two-column':
        const midpoint = Math.ceil(slide.content.length / 2)
        const leftContent = slide.content.slice(0, midpoint)
        const rightContent = slide.content.slice(midpoint)
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Left Column</label>
              {leftContent.map((item, index) => (
                <textarea
                  key={index}
                  value={item}
                  onChange={(e) => handleContentChange(index, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              ))}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Right Column</label>
              {rightContent.map((item, index) => (
                <textarea
                  key={index + midpoint}
                  value={item}
                  onChange={(e) => handleContentChange(index + midpoint, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              ))}
            </div>
          </div>
        )
      case 'quote':
        return (
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium">Quote</label>
              <textarea
                value={slide.content[0] || ''}
                onChange={(e) => handleContentChange(0, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Author</label>
              <input
                type="text"
                value={slide.content[1] || ''}
                onChange={(e) => handleContentChange(1, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        )
      case 'image-text':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">المحتوى</label>
              <textarea
                value={slide.content.join('\n')}
                onChange={(e) => onSlideChange({ ...slide, content: e.target.value.split('\n') })}
                className="w-full p-2 border border-gray-300 rounded h-32 text-right"
                dir="rtl"
              />
            </div>
            <div>
              <label className="text-sm font-medium">وصف الصورة</label>
              <input
                type="text"
                value={slide.imagePrompt || ''}
                onChange={handleImagePromptChange}
                className="w-full p-2 border border-gray-300 rounded mt-1 text-right"
                dir="rtl"
                placeholder="صف الصورة المطلوبة..."
              />
            </div>
            <Button size="sm" onClick={handleImageChange} className="flex items-center gap-2">
              <ImageIcon size={16} />
              تغيير الصورة
            </Button>
          </div>
        )
      case 'split-image':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">المحتوى النصي</label>
              <textarea
                value={slide.content.join('\n')}
                onChange={(e) => onSlideChange({ ...slide, content: e.target.value.split('\n') })}
                className="w-full p-2 border border-gray-300 rounded h-24 text-right"
                dir="rtl"
              />
            </div>
            <div>
              <label className="text-sm font-medium">وصف الصورة (الجانب الأيسر)</label>
              <input
                type="text"
                value={slide.imagePrompt || ''}
                onChange={handleImagePromptChange}
                className="w-full p-2 border border-gray-300 rounded mt-1 text-right"
                dir="rtl"
                placeholder="صف الصورة..."
              />
            </div>
            <Button size="sm" onClick={handleImageChange} className="flex items-center gap-2">
              <ImageIcon size={16} />
              تغيير الصورة
            </Button>
          </div>
        )
      case 'full-image':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">العنوان الرئيسي</label>
              <input
                type="text"
                value={slide.title}
                onChange={handleTitleChange}
                className="w-full p-2 border border-gray-300 rounded mt-1 text-right"
                dir="rtl"
              />
            </div>
            <div>
              <label className="text-sm font-medium">وصف الصورة الخلفية</label>
              <input
                type="text"
                value={slide.imagePrompt || ''}
                onChange={handleImagePromptChange}
                className="w-full p-2 border border-gray-300 rounded mt-1 text-right"
                dir="rtl"
                placeholder="صف الصورة الخلفية..."
              />
            </div>
            <Button size="sm" onClick={handleImageChange} className="flex items-center gap-2">
              <ImageIcon size={16} />
              تغيير الصورة الخلفية
            </Button>
          </div>
        )
      case 'content':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">المحتوى</label>
            <textarea
              value={slide.content.join('\n')}
              onChange={(e) => onSlideChange({ ...slide, content: e.target.value.split('\n') })}
              className="w-full p-2 border border-gray-300 rounded h-40 text-right"
              dir="rtl"
              placeholder="اكتب المحتوى هنا، كل سطر يكون فقرة منفصلة..."
            />
          </div>
        )
      case 'stats-grid':
      case 'timeline':
      case 'comparison':
        return (
          <div>
            <label className="text-sm font-medium">Content</label>
            <textarea
              value={slide.content.join('\n')}
              onChange={(e) => onSlideChange({ ...slide, content: e.target.value.split('\n') })}
              className="w-full p-2 border border-gray-300 rounded h-32"
            />
          </div>
        )
      case 'title':
      default:
        return (
          <div>
            <label className="text-sm font-medium">Content</label>
            <textarea
              value={slide.content.join('\n')}
              onChange={(e) => onSlideChange({ ...slide, content: e.target.value.split('\n') })}
              className="w-full p-2 border border-gray-300 rounded h-32"
            />
          </div>
        )
    }
  }

  return (
    <div className="p-4 border-l border-gray-200 h-full overflow-y-auto flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">تحرير الشريحة</h3>
        <div className="flex gap-1">
          <Button
            variant={activeTab === 'content' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('content')}
            className="flex items-center gap-1"
          >
            <TextIcon size={16} />
            المحتوى
          </Button>
          <Button
            variant={activeTab === 'design' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('design')}
            className="flex items-center gap-1"
          >
            <Palette size={16} />
            التصميم
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'content' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">العنوان</label>
              <input
                type="text"
                value={slide.title}
                onChange={handleTitleChange}
                className="w-full p-2 border border-gray-300 rounded mt-1 text-right"
                dir="rtl"
              />
            </div>
            {renderLayoutEditor()}
          </div>
        )}
        
        {activeTab === 'design' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">لون الخلفية</label>
              <div className="flex gap-2 flex-wrap">
                {['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#1f2937'].map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-gray-800' : 'border-gray-300'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">الخط</label>
              <select 
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="Inter">Inter</option>
                <option value="Cairo">القاهرة</option>
                <option value="Noto Sans Arabic">Noto Sans Arabic</option>
                <option value="Tajawal">تجول</option>
                <option value="Amiri">أميري</option>
              </select>
            </div>
            
            {slide.imagePrompt && (
              <div>
                <label className="text-sm font-medium mb-2 block">وصف الصورة</label>
                <input
                  type="text"
                  value={slide.imagePrompt}
                  onChange={handleImagePromptChange}
                  className="w-full p-2 border border-gray-300 rounded text-right"
                  dir="rtl"
                />
                <Button
                  onClick={handleImageChange}
                  className="mt-2 flex items-center gap-2"
                  size="sm"
                >
                  <ImageIcon size={16} />
                  تغيير الصورة
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
