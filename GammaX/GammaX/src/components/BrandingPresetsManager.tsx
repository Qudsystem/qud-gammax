import { useState, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { BrandingPreset } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'sonner'
import { 
  Plus, 
  Trash, 
  Image as ImageIcon,
  Palette,
  Check,
  Buildings,
  Sparkle
} from '@phosphor-icons/react'

interface BrandingPresetsManagerProps {
  currentPresetId?: string
  onApplyPreset: (preset: BrandingPreset) => void
  onClose?: () => void
}

const GOOGLE_FONTS = [
  'Inter',
  'Outfit',
  'Poppins',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Raleway',
  'Source Sans Pro',
  'Merriweather',
  'Playfair Display',
  'Space Grotesk',
  'IBM Plex Sans',
  'Crimson Pro',
  'Work Sans',
  'Nunito',
  'DM Sans',
  'Sora',
  'Manrope',
  'Lexend'
]

const COLOR_PALETTES = [
  { name: 'Professional Blue', primary: 'oklch(0.45 0.20 250)', secondary: 'oklch(0.60 0.15 240)', accent: 'oklch(0.70 0.18 200)', background: 'oklch(0.98 0.01 240)', text: 'oklch(0.25 0.05 250)' },
  { name: 'Corporate Gray', primary: 'oklch(0.35 0.02 260)', secondary: 'oklch(0.55 0.03 260)', accent: 'oklch(0.50 0.20 280)', background: 'oklch(0.97 0.01 260)', text: 'oklch(0.20 0.01 260)' },
  { name: 'Energetic Orange', primary: 'oklch(0.65 0.22 40)', secondary: 'oklch(0.75 0.18 50)', accent: 'oklch(0.55 0.25 30)', background: 'oklch(0.98 0.02 50)', text: 'oklch(0.25 0.08 40)' },
  { name: 'Tech Purple', primary: 'oklch(0.50 0.24 300)', secondary: 'oklch(0.60 0.20 280)', accent: 'oklch(0.70 0.22 320)', background: 'oklch(0.98 0.02 300)', text: 'oklch(0.25 0.08 300)' },
  { name: 'Eco Green', primary: 'oklch(0.55 0.20 150)', secondary: 'oklch(0.65 0.18 160)', accent: 'oklch(0.75 0.22 140)', background: 'oklch(0.98 0.02 150)', text: 'oklch(0.25 0.08 150)' },
  { name: 'Vibrant Red', primary: 'oklch(0.55 0.25 25)', secondary: 'oklch(0.65 0.20 35)', accent: 'oklch(0.70 0.22 15)', background: 'oklch(0.98 0.02 25)', text: 'oklch(0.25 0.08 25)' },
  { name: 'Elegant Navy', primary: 'oklch(0.35 0.15 260)', secondary: 'oklch(0.55 0.18 250)', accent: 'oklch(0.65 0.20 220)', background: 'oklch(0.98 0.01 260)', text: 'oklch(0.20 0.05 260)' },
  { name: 'Modern Teal', primary: 'oklch(0.55 0.18 200)', secondary: 'oklch(0.65 0.16 190)', accent: 'oklch(0.70 0.20 180)', background: 'oklch(0.98 0.02 200)', text: 'oklch(0.25 0.06 200)' }
]

export function BrandingPresetsManager({ currentPresetId, onApplyPreset, onClose }: BrandingPresetsManagerProps) {
  const [presets, setPresets] = useKV<BrandingPreset[]>('branding-presets', [])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingPreset, setEditingPreset] = useState<BrandingPreset | null>(null)
  
  const [presetName, setPresetName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [selectedPalette, setSelectedPalette] = useState(COLOR_PALETTES[0])
  const [customColors, setCustomColors] = useState({
    primary: COLOR_PALETTES[0].primary,
    secondary: COLOR_PALETTES[0].secondary,
    accent: COLOR_PALETTES[0].accent,
    background: COLOR_PALETTES[0].background,
    text: COLOR_PALETTES[0].text
  })
  const [headingFont, setHeadingFont] = useState('Outfit')
  const [bodyFont, setBodyFont] = useState('Inter')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreatePreset = () => {
    if (!presetName.trim() || !companyName.trim()) {
      toast.error('Please provide preset name and company name')
      return
    }

    const newPreset: BrandingPreset = {
      id: `preset-${Date.now()}`,
      name: presetName,
      company: companyName,
      logoUrl: logoPreview || undefined,
      colors: customColors,
      fonts: {
        heading: headingFont,
        body: bodyFont
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    setPresets((current) => [...(current || []), newPreset])
    toast.success('Branding preset created!')
    resetForm()
    setShowCreateDialog(false)
  }

  const handleUpdatePreset = () => {
    if (!editingPreset) return

    const updatedPreset: BrandingPreset = {
      ...editingPreset,
      name: presetName,
      company: companyName,
      logoUrl: logoPreview || editingPreset.logoUrl,
      colors: customColors,
      fonts: {
        heading: headingFont,
        body: bodyFont
      },
      updatedAt: Date.now()
    }

    setPresets((current) =>
      (current || []).map(p => p.id === updatedPreset.id ? updatedPreset : p)
    )
    toast.success('Branding preset updated!')
    resetForm()
    setEditingPreset(null)
  }

  const handleDeletePreset = (presetId: string) => {
    if (confirm('Delete this branding preset?')) {
      setPresets((current) => (current || []).filter(p => p.id !== presetId))
      toast.success('Preset deleted')
    }
  }

  const handleEditPreset = (preset: BrandingPreset) => {
    setEditingPreset(preset)
    setPresetName(preset.name)
    setCompanyName(preset.company)
    setLogoPreview(preset.logoUrl || null)
    setCustomColors({
      primary: preset.colors.primary,
      secondary: preset.colors.secondary,
      accent: preset.colors.accent,
      background: preset.colors.background,
      text: preset.colors.text
    })
    setSelectedPalette(COLOR_PALETTES.find(p => p.name === preset.name) || COLOR_PALETTES[0])
    setHeadingFont(preset.fonts.heading)
    setBodyFont(preset.fonts.body)
    setShowCreateDialog(true)
  }

  const resetForm = () => {
    setPresetName('')
    setCompanyName('')
    setLogoFile(null)
    setLogoPreview(null)
    setSelectedPalette(COLOR_PALETTES[0])
    setCustomColors({
      primary: COLOR_PALETTES[0].primary,
      secondary: COLOR_PALETTES[0].secondary,
      accent: COLOR_PALETTES[0].accent,
      background: COLOR_PALETTES[0].background,
      text: COLOR_PALETTES[0].text
    })
    setHeadingFont('Outfit')
    setBodyFont('Inter')
    setEditingPreset(null)
  }

  const handleApplyPalette = (palette: typeof COLOR_PALETTES[0]) => {
    setSelectedPalette(palette)
    setCustomColors({
      primary: palette.primary,
      secondary: palette.secondary,
      accent: palette.accent,
      background: palette.background,
      text: palette.text
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Branding Presets</h3>
          <p className="text-sm text-muted-foreground">Manage company logos and color schemes</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={(open) => {
          setShowCreateDialog(open)
          if (!open) {
            resetForm()
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Preset
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingPreset ? 'Edit' : 'Create'} Branding Preset</DialogTitle>
              <DialogDescription>
                Set up your company's visual identity for consistent presentations
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="preset-name">Preset Name</Label>
                  <Input
                    id="preset-name"
                    placeholder="e.g., Q4 2024 Brand"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    placeholder="e.g., Acme Corporation"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Company Logo</Label>
                  <div className="flex items-center gap-4">
                    {logoPreview && (
                      <div className="w-24 h-24 border-2 border-border rounded-lg overflow-hidden flex items-center justify-center bg-muted">
                        <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      {logoPreview ? 'Change Logo' : 'Upload Logo'}
                    </Button>
                    {logoPreview && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setLogoFile(null)
                          setLogoPreview(null)
                        }}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Color Palette</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {COLOR_PALETTES.map((palette) => (
                      <button
                        key={palette.name}
                        onClick={() => handleApplyPalette(palette)}
                        className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                          selectedPalette.name === palette.name
                            ? 'border-primary shadow-md'
                            : 'border-border'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-foreground">{palette.name}</span>
                          {selectedPalette.name === palette.name && (
                            <Check className="w-3 h-3 text-primary" />
                          )}
                        </div>
                        <div className="flex gap-1">
                          <div className="w-full h-6 rounded" style={{ backgroundColor: palette.primary }} />
                          <div className="w-full h-6 rounded" style={{ backgroundColor: palette.secondary }} />
                          <div className="w-full h-6 rounded" style={{ backgroundColor: palette.accent }} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(customColors).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <Label className="text-xs capitalize">{key}</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className="w-full h-10 rounded border-2 border-border hover:border-primary transition-colors"
                            style={{ backgroundColor: value }}
                          />
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                          <div className="space-y-2">
                            <Label>Custom Color</Label>
                            <Input
                              value={value}
                              onChange={(e) => setCustomColors({ ...customColors, [key]: e.target.value })}
                              placeholder="oklch(0.5 0.2 250)"
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="heading-font">Heading Font</Label>
                    <Select value={headingFont} onValueChange={setHeadingFont}>
                      <SelectTrigger id="heading-font">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GOOGLE_FONTS.map((font) => (
                          <SelectItem key={font} value={font}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="body-font">Body Font</Label>
                    <Select value={bodyFont} onValueChange={setBodyFont}>
                      <SelectTrigger id="body-font">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GOOGLE_FONTS.map((font) => (
                          <SelectItem key={font} value={font}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <Button
                    onClick={editingPreset ? handleUpdatePreset : handleCreatePreset}
                    className="flex-1"
                  >
                    {editingPreset ? 'Update' : 'Create'} Preset
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateDialog(false)
                      resetForm()
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[500px]">
        {!presets || presets.length === 0 ? (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                <Buildings className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-2">No Branding Presets</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first branding preset to maintain consistent visual identity
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Preset
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {presets.map((preset) => (
              <Card key={preset.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {preset.logoUrl ? (
                        <div className="w-12 h-12 border border-border rounded overflow-hidden flex items-center justify-center bg-muted">
                          <img src={preset.logoUrl} alt={preset.company} className="max-w-full max-h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 border border-border rounded flex items-center justify-center bg-muted">
                          <Buildings className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-base">{preset.name}</CardTitle>
                        <CardDescription className="text-xs">{preset.company}</CardDescription>
                      </div>
                    </div>
                    {currentPresetId === preset.id && (
                      <Badge variant="default" className="text-xs">
                        <Check className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Color Palette</p>
                    <div className="flex gap-1">
                      <div className="flex-1 h-8 rounded" style={{ backgroundColor: preset.colors.primary }} />
                      <div className="flex-1 h-8 rounded" style={{ backgroundColor: preset.colors.secondary }} />
                      <div className="flex-1 h-8 rounded" style={{ backgroundColor: preset.colors.accent }} />
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Fonts</p>
                    <div className="flex items-center gap-2 text-xs text-foreground">
                      <span className="font-semibold">{preset.fonts.heading}</span>
                      <span className="text-muted-foreground">/</span>
                      <span>{preset.fonts.body}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        onApplyPreset(preset)
                        toast.success(`Applied ${preset.name}`)
                      }}
                      disabled={currentPresetId === preset.id}
                      className="flex-1"
                    >
                      <Sparkle className="w-3 h-3 mr-1" />
                      Apply
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPreset(preset)}
                    >
                      <Palette className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePreset(preset.id)}
                    >
                      <Trash className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
