import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Plus,
  Palette,
  Eye,
  Pencil,
  Trash,
  Copy,
  Download,
  Upload,
  CheckCircle,
  Building,
  Image as ImageIcon
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { BrandingPreset, PreviewData } from '../types';
import { brandingManager } from '../BrandingManager';

interface BrandingPresetsPanelProps {
  presets: BrandingPreset[];
  onSelect: (preset: BrandingPreset) => void;
  onCreate: () => void;
  onEdit: (presetId: string) => void;
  onDelete: (presetId: string) => void;
  selectedPresetId?: string;
  presentationId?: string;
}

const BrandingPresetsPanel: React.FC<BrandingPresetsPanelProps> = ({
  presets,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
  selectedPresetId,
  presentationId
}) => {
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<Map<string, PreviewData>>(new Map());
  const [applyingId, setApplyingId] = useState<string | null>(null);

  useEffect(() => {
    // Generate preview data for all presets
    const previews = new Map<string, PreviewData>();
    presets.forEach(preset => {
      previews.set(preset.id, brandingManager.previewPreset(preset));
    });
    setPreviewData(previews);
  }, [presets]);

  const handleApplyPreset = async (preset: BrandingPreset) => {
    if (!presentationId) {
      toast.error('لا يوجد عرض تقديمي محدد');
      return;
    }

    try {
      setApplyingId(preset.id);
      await brandingManager.applyPreset(presentationId, preset.id);
      onSelect(preset);
      toast.success(`تم تطبيق العلامة التجارية "${preset.name}" بنجاح`);
    } catch (error) {
      toast.error('فشل تطبيق العلامة التجارية');
      console.error('Failed to apply preset:', error);
    } finally {
      setApplyingId(null);
    }
  };

  const handleDuplicatePreset = async (preset: BrandingPreset) => {
    try {
      setLoading(true);
      const newName = `${preset.name} - نسخة`;
      await brandingManager.duplicatePreset(preset.id, newName);
      toast.success('تم نسخ العلامة التجارية بنجاح');
      // Refresh presets list (parent component should handle this)
    } catch (error) {
      toast.error('فشل نسخ العلامة التجارية');
      console.error('Failed to duplicate preset:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPreset = async (preset: BrandingPreset) => {
    try {
      const exportData = await brandingManager.exportPreset(preset.id);
      
      // Create and download file
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${preset.name.replace(/[^a-zA-Z0-9]/g, '_')}_branding.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('تم تصدير العلامة التجارية بنجاح');
    } catch (error) {
      toast.error('فشل تصدير العلامة التجارية');
      console.error('Failed to export preset:', error);
    }
  };

  const PresetCard: React.FC<{ preset: BrandingPreset; preview: PreviewData }> = ({ 
    preset, 
    preview 
  }) => {
    const isSelected = selectedPresetId === preset.id;
    const isApplying = applyingId === preset.id;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -2 }}
        className={`relative ${isSelected ? 'ring-2 ring-purple-500' : ''}`}
      >
        <Card className={`cursor-pointer transition-all hover:shadow-md ${
          isSelected ? 'border-purple-500 shadow-lg' : 'border-gray-200'
        }`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {preset.logo && <ImageIcon className="w-4 h-4 text-gray-500" />}
                  {preset.companyName && <Building className="w-4 h-4 text-gray-500" />}
                  {preset.name}
                </CardTitle>
                {preset.companyName && (
                  <p className="text-xs text-gray-500">{preset.companyName}</p>
                )}
              </div>
              {isSelected && (
                <Badge variant="default" className="bg-purple-600">
                  مطبق
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Color Palette Preview */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600">الألوان</p>
              <div className="flex gap-1">
                {preview.colorPalette.map((color, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded border border-gray-200 flex-shrink-0"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Font Preview */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600">الخطوط</p>
              <div className="space-y-1">
                {preview.fontSamples.map((font, index) => (
                  <div
                    key={index}
                    className="text-xs truncate"
                    style={{
                      fontFamily: font.family,
                      fontWeight: font.weight,
                      color: preview.sampleSlide.textColor
                    }}
                  >
                    {font.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Logo Preview */}
            {preset.logo && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-600">الشعار</p>
                <div className="flex items-center justify-center h-12 bg-gray-50 rounded border">
                  <img
                    src={preset.logo.url}
                    alt="Logo"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            )}

            <Separator />

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(preset.id);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicatePreset(preset);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-800"
                  disabled={loading}
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportPreset(preset);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Download className="w-3 h-3" />
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(preset.id);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash className="w-3 h-3" />
                </Button>
              </div>

              {presentationId && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApplyPreset(preset);
                  }}
                  disabled={isApplying || isSelected}
                  size="sm"
                  className={`${
                    isSelected 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {isApplying ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                  ) : isSelected ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      مطبق
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3" />
                      تطبيق
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-600" />
            العلامات التجارية
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={onCreate}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="w-4 h-4" />
              إنشاء جديد
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {presets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Palette className="w-12 h-12 text-gray-400" />
            <div className="text-center space-y-2">
              <h3 className="font-medium text-gray-900">لا توجد علامات تجارية</h3>
              <p className="text-sm text-gray-500 max-w-sm">
                أنشئ علامتك التجارية الأولى لتطبيق ألوان وخطوط شركتك على جميع العروض التقديمية
              </p>
            </div>
            <Button
              onClick={onCreate}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="w-4 h-4" />
              إنشاء علامة تجارية
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="grid gap-4">
              <AnimatePresence>
                {presets.map((preset) => {
                  const preview = previewData.get(preset.id);
                  if (!preview) return null;
                  
                  return (
                    <PresetCard
                      key={preset.id}
                      preset={preset}
                      preview={preview}
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default BrandingPresetsPanel;