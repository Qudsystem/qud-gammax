import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { FileArrowUp, FilePdf, FileDoc, Check, X, WarningCircle } from '@phosphor-icons/react'
import { Presentation, PresentationStyle } from '@/lib/types'
import { FileParser } from '@/features/import-engine/FileParser'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface FileImportProps {
  onImport: (presentation: Presentation) => void
  onCancel: () => void
}

interface ImportStatus {
  stage: 'idle' | 'uploading' | 'processing' | 'extracting' | 'generating' | 'complete' | 'error'
  progress: number
  message: string
  error?: string
}

export function FileImport({ onImport, onCancel }: FileImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<ImportStatus>({
    stage: 'idle',
    progress: 0,
    message: 'Ready to import',
  })
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const parser = new FileParser()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (selectedFile: File) => {
    const validTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ]

    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Please select a PDF or PowerPoint file')
      return
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB')
      return
    }

    setFile(selectedFile)
    toast.success('File selected')
  }

  const processFile = async () => {
    if (!file) return

    try {
      setStatus({ stage: 'uploading', progress: 10, message: 'Uploading file...' })
      await new Promise(resolve => setTimeout(resolve, 500))

      setStatus({ stage: 'processing', progress: 30, message: 'Analyzing file structure...' })
      
      let presentation: Presentation
      if (file.type === 'application/pdf') {
        presentation = await parser.parsePDF(file)
      } else {
        presentation = await parser.parsePPTX(file)
      }
      
      setStatus({ stage: 'extracting', progress: 60, message: 'Extracting content...' })
      await new Promise(resolve => setTimeout(resolve, 500))

      setStatus({ stage: 'generating', progress: 85, message: 'Generating presentation...' })
      await new Promise(resolve => setTimeout(resolve, 500))

      setStatus({ stage: 'complete', progress: 100, message: 'Import complete!' })
      await new Promise(resolve => setTimeout(resolve, 300))

      onImport(presentation)
      toast.success('Presentation imported successfully')
    } catch (error) {
      console.error('Import error:', error)
      setStatus({
        stage: 'error',
        progress: 0,
        message: 'Import failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      toast.error('Failed to import file')
    }
  }

  const reset = () => {
    setFile(null)
    setStatus({ stage: 'idle', progress: 0, message: 'Ready to import' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') {
      return <FilePdf className="w-12 h-12 text-destructive" weight="fill" />
    }
    return <FileDoc className="w-12 h-12 text-primary" weight="fill" />
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FileArrowUp className="w-5 h-5 text-primary" weight="bold" />
            Import Presentation
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Upload PowerPoint or PDF files
          </p>
        </div>
        <Button onClick={onCancel} variant="ghost" size="sm">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {status.stage === 'idle' && !file ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
                dragActive
                  ? 'border-primary bg-primary/5 scale-[1.02]'
                  : 'border-border hover:border-primary/50 hover:bg-accent/5'
              }`}
            >
              <FileArrowUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-lg font-semibold text-foreground mb-2">
                Drop your file here
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                Select File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.ppt,.pptx"
                onChange={handleFileInput}
                className="hidden"
              />
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-xs">PDF</Badge>
                <Badge variant="secondary" className="text-xs">PPT</Badge>
                <Badge variant="secondary" className="text-xs">PPTX</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Maximum file size: 50MB
              </p>
            </div>
          </motion.div>
        ) : file && status.stage === 'idle' ? (
          <motion.div
            key="selected"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-accent/5">
              {getFileIcon(file)}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground truncate">
                  {file.name}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button onClick={reset} variant="ghost" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <Button
              onClick={processFile}
              className="w-full bg-gradient-to-r from-primary to-accent"
              size="lg"
            >
              <FileArrowUp className="w-4 h-4 mr-2" weight="fill" />
              Import Presentation
            </Button>
          </motion.div>
        ) : status.stage !== 'idle' && status.stage !== 'error' ? (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-accent/5">
              {file && getFileIcon(file)}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground truncate">
                  {file?.name}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {status.message}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Progress value={status.progress} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{status.message}</span>
                <span>{status.progress}%</span>
              </div>
            </div>

            {status.stage === 'complete' && (
              <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
                <Check className="w-5 h-5" weight="bold" />
                <span className="font-medium">Import successful!</span>
              </div>
            )}
          </motion.div>
        ) : status.stage === 'error' ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-3 p-6 rounded-lg border border-destructive/20 bg-destructive/5">
              <WarningCircle className="w-12 h-12 text-destructive" weight="fill" />
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Import Failed
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {status.error || 'An unknown error occurred'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={reset} variant="outline" className="flex-1">
                Try Again
              </Button>
              <Button onClick={onCancel} variant="ghost" className="flex-1">
                Cancel
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t border-border">
        <p>• Supported formats: PDF, PPT, PPTX</p>
        <p>• AI will analyze and recreate the presentation structure</p>
        <p>• Text, images, and layout will be extracted</p>
        <p>• Original formatting may be adjusted to match templates</p>
      </div>
    </Card>
  )
}
