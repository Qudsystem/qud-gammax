import { Presentation, Slide } from './types'
import { PPTXExporter } from '@/features/export-engine/PPTXExporter'

export async function exportToPDF(presentation: Presentation): Promise<void> {
  window.print()
}

export async function exportToPowerPoint(presentation: Presentation): Promise<void> {
  const exporter = new PPTXExporter(presentation)
  await exporter.export()
}

export function exportToJSON(presentation: Presentation): Promise<void> {
  return new Promise((resolve) => {
    const jsonContent = JSON.stringify(presentation, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${presentation.title}.json`
    a.click()
    URL.revokeObjectURL(url)
    resolve()
  })
}
