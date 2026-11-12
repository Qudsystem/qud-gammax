import pptxgen from 'pptxgenjs';
import { Presentation, Slide } from '@/lib/types';

export class PPTXExporter {
  private pptx: pptxgen;
  private presentation: Presentation;

  constructor(presentation: Presentation) {
    this.pptx = new pptxgen();
    this.presentation = presentation;
  }

  async export(): Promise<void> {
    this.pptx.title = this.presentation.title;
    this.pptx.subject = this.presentation.description;
    this.pptx.author = 'GammaX AI';

    // Add slides
    this.presentation.slides.forEach((slide) => {
      this.addSlide(slide);
    });

    // Save the file
    await this.pptx.writeFile({ fileName: `${this.presentation.title}.pptx` });
  }

  private addSlide(slideData: Slide): void {
    const slide = this.pptx.addSlide();

    // Set background based on style
    // This is a simplified version - in a real app we'd map styles to PPTX themes
    slide.background = { fill: 'FFFFFF' };

    // Add title
    slide.addText(slideData.title, {
      x: 0.5,
      y: 0.5,
      w: '90%',
      h: 1,
      fontSize: 32,
      bold: true,
      color: '363636',
      align: 'center'
    });

    // Flow-like diagrams to shapes (flowchart/mindmap/org-chart/timeline)
    if (slideData.diagram && !['pie', 'bar', 'line'].includes(slideData.diagram.type as any)) {
      try {
        const nodes = slideData.diagram.nodes || []
        const edges = slideData.diagram.edges || []
        const area = { x: 0.5, y: 1.6, w: 9, h: 4.6 }
        // Auto layout if no positions
        const cols = Math.ceil(Math.sqrt(nodes.length || 1))
        const rows = Math.ceil((nodes.length || 1) / cols)
        const cellW = area.w / Math.max(1, cols)
        const cellH = area.h / Math.max(1, rows)
        const positions: Record<string, {x:number;y:number}> = {}
        nodes.forEach((n, i) => {
          const hasPos = n.position && typeof n.position.x === 'number' && typeof n.position.y === 'number'
          const col = i % cols
          const row = Math.floor(i / cols)
          positions[n.id] = hasPos
            ? { x: area.x + (n.position!.x/100)*area.w, y: area.y + (n.position!.y/100)*area.h }
            : { x: area.x + col * cellW + 0.2, y: area.y + row * cellH + 0.2 }
          const shapeName = ((): any => {
            switch (n.type) {
              case 'decision': return (this.pptx as any).ShapeType.diamond
              case 'data': return (this.pptx as any).ShapeType.parallelogram
              case 'start':
              case 'end': return (this.pptx as any).ShapeType.roundRect
              default: return (this.pptx as any).ShapeType.rect
            }
          })()
          slide.addText(n.label || n.id, {
            shape: shapeName,
            x: positions[n.id].x,
            y: positions[n.id].y,
            w: Math.max(1.5, cellW - 0.4),
            h: 0.8,
            align: 'center',
            valign: 'middle',
            fontSize: 14,
            fill: { color: 'F6F6F6' },
            color: '333333',
            line: { color: '999999' }
          })
        })
        edges.forEach(e => {
          const from = positions[e.from]
          const to = positions[e.to]
          if (!from || !to) return
          slide.addShape((this.pptx as any).ShapeType.line, {
            x: from.x + 0.75, y: from.y + 0.8,
            w: (to.x - from.x), h: (to.y - from.y),
            line: { color: '666666', width: 1 },
            flipH: to.x < from.x, flipV: to.y < from.y
          } as any)
        })
        if (slideData.content?.length) {
          slide.addText(slideData.content.join('\n'), { x: 0.5, y: 6.1, w: '90%', h: 0.9, fontSize: 12, color: '444444', align: 'center' })
        }
        return
      } catch (e) {
        console.warn('Flowchart export failed, falling back to text:', e)
      }
    }

    // Diagram to chart (pie/bar/line)
    if (slideData.diagram && ['pie', 'bar', 'line'].includes(slideData.diagram.type as any)) {
      try {
        const labels = slideData.diagram.nodes.map((n) => n.label || n.id);
        const values = slideData.diagram.nodes.map((_, idx) => {
          // naive value derivation if not provided
          const degree = (slideData.diagram?.edges || []).filter(e => e.from === _.id || e.to === _.id).length;
          return degree || idx + 1;
        });
        const data = [{ name: 'Data', labels, values }];
        const chartType = ((): any => {
          switch (slideData.diagram!.type) {
            case 'pie': return (this.pptx as any).ChartType.pie;
            case 'bar': return (this.pptx as any).ChartType.bar;
            case 'line': return (this.pptx as any).ChartType.line;
            default: return (this.pptx as any).ChartType.pie;
          }
        })();
        (slide as any).addChart(chartType, data, { x: 1, y: 1.5, w: 8, h: 4 });
        // Add optional description
        if (slideData.content?.length) {
          slide.addText(slideData.content.join('\n'), {
            x: 0.5, y: 5.6, w: '90%', h: 1.2, fontSize: 14, color: '444444', align: 'center'
          });
        }
        return;
      } catch (e) {
        // fall-through to default content rendering
        console.warn('Chart export failed, falling back to text:', e);
      }
    }

    // Add content
    if (slideData.layout === 'title') {
      slide.addText(slideData.content.join('\n'), {
        x: 0.5,
        y: 2,
        w: '90%',
        h: 3,
        fontSize: 24,
        color: '666666',
        align: 'center'
      });
    } else {
      slide.addText(slideData.content.join('\n'), {
        x: 0.5,
        y: 1.5,
        w: '90%',
        h: 3.5,
        fontSize: 18,
        color: '444444',
        bullet: true,
        valign: 'top'
      });
    }

    // Add image if exists
    if (slideData.imageUrl) {
      // In a real app, we might need to fetch the image or handle data URLs
      try {
        slide.addImage({
          path: slideData.imageUrl,
          x: 6.5,
          y: 1.5,
          w: 3,
          h: 2.5
        });
      } catch (e) {
        console.warn('Failed to add image to PPTX:', e);
      }
    }

    // Add speaker notes
    if (slideData.notes) {
      slide.addNotes(slideData.notes);
    }

    // Add annotations as image overlays (simulated)
    if (slideData.annotations && slideData.annotations.length > 0) {
      slide.addText('(Slide contains annotations)', {
        x: 0.5,
        y: 5.2,
        fontSize: 10,
        italic: true,
        color: '888888'
      });
    }
  }
}
