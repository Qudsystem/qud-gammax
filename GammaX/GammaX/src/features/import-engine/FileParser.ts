import PizZip from 'pizzip';
import { parseStringPromise } from 'xml2js';
import * as pdfjs from 'pdfjs-dist';
import { Presentation, Slide, PresentationStyle } from '@/lib/types';
import { generateId } from '@/lib/utils';

// Configure pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export class FileParser {
  async parsePPTX(file: File): Promise<Presentation> {
    const arrayBuffer = await file.arrayBuffer();
    const zip = new PizZip(arrayBuffer);
    
    // In a real implementation, we'd traverse the PPTX structure:
    // ppt/slides/slide[1..n].xml
    // ppt/slides/_rels/slide[1..n].xml.rels
    // ppt/media/ (images)
    
    // For this implementation, we'll extract slide titles and text from the XML
    const slideEntries = Object.keys(zip.files).filter(name => 
      name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
    );

    const slides: Slide[] = [];

    for (const entry of slideEntries) {
      const xmlContent = zip.files[entry].asText();
      const parsed = await parseStringPromise(xmlContent);
      
      // Navigate the complex PPTX XML structure
      // a:t elements usually contain the text
      const textElements: string[] = [];
      this.findTextElements(parsed, textElements);

      slides.push({
        id: generateId(),
        title: textElements[0] || `Slide ${slides.length + 1}`,
        content: textElements.slice(1).filter(t => t.length > 5), // Filter short strings
        layout: 'content',
        animation: 'fade-in'
      });
    }

    return {
      id: generateId(),
      title: file.name.replace('.pptx', ''),
      description: `Imported from ${file.name}`,
      slides,
      style: 'professional' as PresentationStyle,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  async parsePDF(file: File): Promise<Presentation> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    const slides: Slide[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const items = textContent.items as any[];
      
      const text = items.map(item => item.str).join(' ');
      const lines = items.map(item => item.str).filter(s => s.trim().length > 0);

      slides.push({
        id: generateId(),
        title: lines[0] || `Page ${i}`,
        content: lines.slice(1).filter(l => l.length > 10),
        layout: 'content',
        animation: 'fade-in'
      });
    }

    return {
      id: generateId(),
      title: file.name.replace('.pdf', ''),
      description: `Imported from ${file.name}`,
      slides,
      style: 'modern' as PresentationStyle,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  private findTextElements(obj: any, results: string[]): void {
    if (!obj) return;

    if (typeof obj === 'string') {
      results.push(obj);
      return;
    }

    if (Array.isArray(obj)) {
      obj.forEach(item => this.findTextElements(item, results));
      return;
    }

    if (typeof obj === 'object') {
      // PPTX text elements are usually in 'a:t' or similar tags
      for (const key in obj) {
        if (key === 'a:t' || key === 't' || key === '_') {
          const val = obj[key];
          if (Array.isArray(val)) {
            val.forEach(v => {
              if (typeof v === 'string') results.push(v);
              else if (v._) results.push(v._);
            });
          } else if (typeof val === 'string') {
            results.push(val);
          } else if (val._) {
            results.push(val._);
          }
        } else {
          this.findTextElements(obj[key], results);
        }
      }
    }
  }
}
