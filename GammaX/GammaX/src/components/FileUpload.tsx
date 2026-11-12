import { useCallback, useState } from 'react'
import { UploadSimple } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

interface FileUploadProps {
  onFileUpload: (fileName: string, content: string) => void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback((file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large', {
        description: 'Please upload a file smaller than 10MB'
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (content) {
        onFileUpload(file.name, content)
        toast.success('File uploaded', {
          description: `Analyzing ${file.name}...`
        })
      }
    }
    reader.onerror = () => {
      toast.error('Failed to read file')
    }
    reader.readAsText(file)
  }, [onFileUpload])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleClick = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.log,.txt'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        handleFile(file)
      }
    }
    input.click()
  }, [handleFile])

  return (
    <Card
      className={`relative overflow-hidden border-2 border-dashed transition-all duration-200 cursor-pointer ${
        isDragging 
          ? 'border-primary bg-accent/10 scale-[1.02]' 
          : 'border-border hover:border-primary/50 hover:bg-accent/5'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
    >
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <div className={`p-4 rounded-full transition-colors ${
          isDragging ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
        }`}>
          <UploadSimple className="w-8 h-8" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground mb-1">
            {isDragging ? 'Drop your log file here' : 'Upload Log File'}
          </p>
          <p className="text-sm text-muted-foreground">
            Drag and drop or click to browse
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Supports .log and .txt files up to 10MB
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={(e) => e.stopPropagation()}>
          Select File
        </Button>
      </div>
    </Card>
  )
}
