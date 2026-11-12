import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowUpRight,
  Circle,
  Square,
  Minus,
  PencilSimple,
  TextT,
  Highlighter,
  Eraser,
  ArrowCounterClockwise,
  ArrowClockwise,
  Palette,
  X
} from '@phosphor-icons/react';
import { 
  AnnotationTool, 
  AnnotationStyle, 
  ANNOTATION_COLORS, 
  STROKE_WIDTH_OPTIONS,
  DEFAULT_ANNOTATION_STYLE 
} from '../types';

interface AnnotationToolbarProps {
  selectedTool: AnnotationTool;
  onToolChange: (tool: AnnotationTool) => void;
  color: string;
  strokeWidth: number;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onClose?: () => void;
}

const AnnotationToolbar: React.FC<AnnotationToolbarProps> = ({
  selectedTool,
  onToolChange,
  color,
  strokeWidth,
  onColorChange,
  onStrokeWidthChange,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onClose
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showStrokePicker, setShowStrokePicker] = useState(false);

  const tools = [
    { type: 'arrow' as AnnotationTool, icon: ArrowUpRight, label: 'سهم' },
    { type: 'circle' as AnnotationTool, icon: Circle, label: 'دائرة' },
    { type: 'rectangle' as AnnotationTool, icon: Square, label: 'مربع' },
    { type: 'line' as AnnotationTool, icon: Minus, label: 'خط' },
    { type: 'freehand' as AnnotationTool, icon: PencilSimple, label: 'رسم حر' },
    { type: 'text' as AnnotationTool, icon: TextT, label: 'نص' },
    { type: 'highlight' as AnnotationTool, icon: Highlighter, label: 'تظليل' },
    { type: 'eraser' as AnnotationTool, icon: Eraser, label: 'ممحاة' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 flex items-center gap-2 flex-wrap"
    >
      {/* Close Button */}
      {onClose && (
        <>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
        </>
      )}

      {/* Drawing Tools */}
      <div className="flex items-center gap-1">
        {tools.map(({ type, icon: Icon, label }) => (
          <Button
            key={type}
            onClick={() => onToolChange(type)}
            variant={selectedTool === type ? "default" : "ghost"}
            size="sm"
            className={`relative ${
              selectedTool === type 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
            title={label}
          >
            <Icon className="w-4 h-4" />
            {selectedTool === type && (
              <motion.div
                layoutId="selectedTool"
                className="absolute inset-0 bg-purple-600 rounded-md -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </Button>
        ))}
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Color Picker */}
      <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <Palette className="w-4 h-4" />
            <div 
              className="w-4 h-4 rounded border border-gray-300"
              style={{ backgroundColor: color }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3">
          <div className="space-y-3">
            <h4 className="font-medium text-sm">اختر اللون</h4>
            <div className="grid grid-cols-8 gap-2">
              {ANNOTATION_COLORS.map((colorOption) => (
                <button
                  key={colorOption}
                  onClick={() => {
                    onColorChange(colorOption);
                    setShowColorPicker(false);
                  }}
                  className={`w-6 h-6 rounded border-2 transition-all hover:scale-110 ${
                    color === colorOption 
                      ? 'border-gray-800 shadow-md' 
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: colorOption }}
                  title={colorOption}
                />
              ))}
            </div>
            
            {/* Custom Color Input */}
            <div className="space-y-2">
              <label className="text-xs text-gray-600">لون مخصص</label>
              <input
                type="color"
                value={color}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-full h-8 rounded border border-gray-300 cursor-pointer"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Stroke Width Picker */}
      <Popover open={showStrokePicker} onOpenChange={setShowStrokePicker}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <div className="flex flex-col items-center">
              <div 
                className="bg-gray-800 rounded"
                style={{ 
                  width: '16px', 
                  height: `${Math.max(1, strokeWidth / 2)}px` 
                }}
              />
            </div>
            <Badge variant="secondary" className="text-xs">
              {strokeWidth}px
            </Badge>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-3">
          <div className="space-y-3">
            <h4 className="font-medium text-sm">سمك الخط</h4>
            
            {/* Slider */}
            <div className="space-y-2">
              <Slider
                value={[strokeWidth]}
                onValueChange={([value]) => onStrokeWidthChange(value)}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1px</span>
                <span>10px</span>
              </div>
            </div>

            {/* Preset Options */}
            <div className="grid grid-cols-5 gap-1">
              {STROKE_WIDTH_OPTIONS.map((width) => (
                <button
                  key={width}
                  onClick={() => {
                    onStrokeWidthChange(width);
                    setShowStrokePicker(false);
                  }}
                  className={`p-2 rounded border text-xs transition-colors ${
                    strokeWidth === width
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {width}px
                </button>
              ))}
            </div>

            {/* Visual Preview */}
            <div className="bg-gray-50 rounded p-3 flex items-center justify-center">
              <div 
                className="rounded"
                style={{ 
                  backgroundColor: color,
                  width: '40px',
                  height: `${strokeWidth}px`
                }}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="h-6" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <Button
          onClick={onUndo}
          disabled={!canUndo}
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
          title="تراجع"
        >
          <ArrowCounterClockwise className="w-4 h-4" />
        </Button>
        <Button
          onClick={onRedo}
          disabled={!canRedo}
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
          title="إعادة"
        >
          <ArrowClockwise className="w-4 h-4" />
        </Button>
      </div>

      {/* Current Tool Indicator */}
      <div className="flex items-center gap-2 ml-auto">
        <Badge variant="outline" className="text-xs">
          {tools.find(t => t.type === selectedTool)?.label || selectedTool}
        </Badge>
      </div>
    </motion.div>
  );
};

export default AnnotationToolbar;