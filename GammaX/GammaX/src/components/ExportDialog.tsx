import { useState } from 'react'
import { Presentation } from '@/lib/types'
import { exportToPDF, exportToPowerPoint, exportToJSON } from '@/lib/exportUtils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { DownloadSimple, FilePdf, FilePpt, FileImage, Check, Info, FileCode } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ExportDialogProps {
  presentation: Presentation
  trigger?: React.ReactNode
}

export function ExportDialog({ presentation, trigger }: ExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'pptx' | 'json' | null>(null)

  const handleExportPDF = async () => {
    setExporting(true)
    setSelectedFormat('pdf')
    try {
      await exportToPDF(presentation)
      toast.success('PDF export ready! Use your browser\'s print dialog to save as PDF.')
      setOpen(false)
    } catch (error) {
      toast.error('Failed to export PDF. Please try again.')
      console.error(error)
    } finally {
      setExporting(false)
      setSelectedFormat(null)
    }
  }

  const handleExportPowerPoint = async () => {
    setExporting(true)
    setSelectedFormat('pptx')
    try {
      await exportToPowerPoint(presentation)
      toast.success('Presentation exported as PPTX. Open in PowerPoint or Google Slides.')
      setOpen(false)
    } catch (error) {
      toast.error('Failed to export presentation. Please try again.')
      console.error(error)
    } finally {
      setExporting(false)
      setSelectedFormat(null)
    }
  }

  const handleExportJSON = async () => {
    setExporting(true)
    setSelectedFormat('json')
    try {
      await exportToJSON(presentation)
      toast.success('Presentation data exported as JSON!')
      setOpen(false)
    } catch (error) {
      toast.error('Failed to export JSON. Please try again.')
      console.error(error)
    } finally {
      setExporting(false)
      setSelectedFormat(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <DownloadSimple className="w-4 h-4 mr-2" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <DownloadSimple className="w-6 h-6 text-primary" weight="bold" />
            Export Presentation
          </DialogTitle>
          <DialogDescription>
            Choose your preferred format to download and share your presentation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className={`cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] hover:bg-primary/5 hover:border-primary/30 border-2 ${
                selectedFormat === 'pdf' ? 'ring-2 ring-primary bg-primary/5 border-primary/40' : 'border-border'
              }`}
              onClick={exporting ? undefined : handleExportPDF}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                    <FilePdf className="w-7 h-7 text-white" weight="fill" />
                  </div>
                  <Badge variant="secondary" className="text-xs bg-red-100 text-red-700 hover:bg-red-200">
                    Print-Ready
                  </Badge>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-1">PDF Document</h3>
                  <p className="text-sm text-muted-foreground">
                    Universal format for viewing and printing. Best for sharing and archiving.
                  </p>
                </div>

                <Separator />

                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-green-600" weight="bold" />
                    Preserves layout and formatting
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-green-600" weight="bold" />
                    Works on all devices
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-green-600" weight="bold" />
                    Includes speaker notes
                  </li>
                </ul>

                <Button 
                  className="w-full bg-red-600 hover:bg-red-700 shadow-md" 
                  disabled={exporting}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleExportPDF()
                  }}
                >
                  {exporting && selectedFormat === 'pdf' ? 'Exporting...' : 'Export as PDF'}
                </Button>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] hover:bg-orange-50 hover:border-orange-200 border-2 ${
                selectedFormat === 'pptx' ? 'ring-2 ring-orange-500 bg-orange-50 border-orange-300' : 'border-border'
              }`}
              onClick={exporting ? undefined : handleExportPowerPoint}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                    <FilePpt className="w-7 h-7 text-white" weight="fill" />
                  </div>
                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 hover:bg-orange-200">
                    Editable
                  </Badge>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-1">PowerPoint (PPTX)</h3>
                  <p className="text-sm text-muted-foreground">
                    Fully editable slides compatible with PowerPoint and Google Slides.
                  </p>
                </div>

                <Separator />

                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-green-600" weight="bold" />
                    Edit text and content
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-green-600" weight="bold" />
                    Compatible with all platforms
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-green-600" weight="bold" />
                    Ready for customization
                  </li>
                </ul>

                <Button 
                  className="w-full bg-orange-600 hover:bg-orange-700 shadow-md" 
                  disabled={exporting}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleExportPowerPoint()
                  }}
                >
                  {exporting && selectedFormat === 'pptx' ? 'Exporting...' : 'Export PPTX'}
                </Button>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] hover:bg-primary/5 hover:border-primary/30 border-2 ${
                selectedFormat === 'json' ? 'ring-2 ring-primary bg-primary/5 border-primary/40' : 'border-border'
              }`}
              onClick={exporting ? undefined : handleExportJSON}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                    <FileCode className="w-7 h-7 text-white" weight="fill" />
                  </div>
                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary hover:bg-primary/20">
                    Data
                  </Badge>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-1">JSON Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Raw presentation data for developers and integrations.
                  </p>
                </div>

                <Separator />

                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-green-600" weight="bold" />
                    Complete presentation data
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-green-600" weight="bold" />
                    Developer-friendly format
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-green-600" weight="bold" />
                    API integration ready
                  </li>
                </ul>

                <Button 
                  className="w-full shadow-md" 
                  variant="outline"
                  disabled={exporting}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleExportJSON()
                  }}
                >
                  {exporting && selectedFormat === 'json' ? 'Exporting...' : 'Export JSON'}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border">
            <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" weight="fill" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-foreground">Export Information</p>
              <p className="text-muted-foreground leading-relaxed">
                Your presentation contains <strong>{presentation.slides.length} slides</strong>.
                Images, diagrams, and speaker notes will be preserved in all formats.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
