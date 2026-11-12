import { Presentation } from '@/lib/types'
import { SlidePreview } from './SlidePreview'
import { useEffect } from 'react'

interface PrintViewProps {
  presentation: Presentation
  onClose: () => void
}

export function PrintView({ presentation, onClose }: PrintViewProps) {
  useEffect(() => {
    const handleAfterPrint = () => {
      onClose()
    }

    window.addEventListener('afterprint', handleAfterPrint)
    
    setTimeout(() => {
      window.print()
    }, 500)

    return () => {
      window.removeEventListener('afterprint', handleAfterPrint)
    }
  }, [onClose])

  return (
    <div className="print-view">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-view, .print-view * {
            visibility: visible;
          }
          .print-view {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
          }
          .slide-container {
            page-break-after: always;
            page-break-inside: avoid;
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            margin: 0;
          }
          .slide-container:last-child {
            page-break-after: auto;
          }
          * {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
        }
        @media screen {
          .print-view {
            display: none;
          }
        }
      `}</style>
      
      {presentation.slides.map((slide, index) => (
        <div key={slide.id} className="slide-container">
          <div style={{ width: '1920px', height: '1080px' }}>
            <SlidePreview
              slide={slide}
              style={presentation.style}
              isActive={false}
            />
          </div>
          {slide.notes && (
            <div style={{ pageBreakBefore: 'always', padding: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Speaker Notes - Slide {index + 1}</h3>
              <p style={{ lineHeight: 1.6 }}>{slide.notes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
