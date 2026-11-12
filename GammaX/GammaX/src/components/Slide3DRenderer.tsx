import { useEffect, useRef, useState } from 'react'
import { Slide, PresentationStyle, Transition3DConfig } from '@/lib/types'
import { SlidePreview } from '@/components/SlidePreview'
import { motion, AnimatePresence } from 'framer-motion'

interface Slide3DRendererProps {
  currentSlide: Slide
  nextSlide?: Slide
  style: PresentationStyle
  transition?: Transition3DConfig
  isTransitioning: boolean
  direction: 'forward' | 'backward'
}

export function Slide3DRenderer({
  currentSlide,
  nextSlide,
  style,
  transition,
  isTransitioning,
  direction
}: Slide3DRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
      setMousePosition({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  if (!transition) {
    return (
      <div ref={containerRef} className="w-full h-full">
        <SlidePreview slide={currentSlide} style={style} isActive={true} />
      </div>
    )
  }

  const getTransitionStyles = () => {
    const { effect, duration, perspective, parallaxIntensity = 50, easing = 'ease-in-out' } = transition
    const parallaxX = mousePosition.x * (parallaxIntensity / 100) * 20
    const parallaxY = mousePosition.y * (parallaxIntensity / 100) * 20

    const baseStyle = {
      transition: `all ${duration}ms ${easing}`,
      transformStyle: 'preserve-3d' as const,
      perspective: `${perspective}px`,
    }

    switch (effect) {
      case 'cube-rotate':
        return {
          ...baseStyle,
          transform: isTransitioning
            ? `rotateY(${direction === 'forward' ? -90 : 90}deg) translateZ(${parallaxX}px)`
            : `rotateY(0deg) translateZ(${parallaxX}px)`,
        }

      case 'flip-3d':
        return {
          ...baseStyle,
          transform: isTransitioning
            ? `rotateX(${direction === 'forward' ? 180 : -180}deg) translateY(${parallaxY}px)`
            : `rotateX(0deg) translateY(${parallaxY}px)`,
        }

      case 'door-swing':
        return {
          ...baseStyle,
          transformOrigin: direction === 'forward' ? 'left center' : 'right center',
          transform: isTransitioning
            ? `rotateY(${direction === 'forward' ? -90 : 90}deg)`
            : 'rotateY(0deg)',
        }

      case 'carousel-3d':
        return {
          ...baseStyle,
          transform: isTransitioning
            ? `rotateY(${direction === 'forward' ? -45 : 45}deg) translateZ(-200px)`
            : `rotateY(0deg) translateZ(${parallaxX}px)`,
        }

      case 'page-curl':
        return {
          ...baseStyle,
          transformOrigin: 'bottom right',
          transform: isTransitioning
            ? `rotateX(${direction === 'forward' ? 45 : -45}deg) rotateZ(${direction === 'forward' ? 5 : -5}deg) translateZ(-100px)`
            : `rotateX(0deg) rotateZ(0deg) translateZ(${parallaxX}px)`,
          filter: isTransitioning ? 'drop-shadow(0 20px 30px rgba(0,0,0,0.3))' : 'none',
        }

      case 'book-flip':
        return {
          ...baseStyle,
          transformOrigin: direction === 'forward' ? 'left center' : 'right center',
          transform: isTransitioning
            ? `perspective(${perspective}px) rotateY(${direction === 'forward' ? -180 : 180}deg)`
            : `perspective(${perspective}px) rotateY(0deg)`,
        }

      case 'cover-flow':
        return {
          ...baseStyle,
          transform: isTransitioning
            ? `rotateY(${direction === 'forward' ? -60 : 60}deg) translateX(${direction === 'forward' ? -300 : 300}px) translateZ(-200px)`
            : `rotateY(0deg) translateX(0px) translateZ(${parallaxX}px)`,
        }

      case 'ribbon-3d':
        return {
          ...baseStyle,
          transform: isTransitioning
            ? `rotateX(${direction === 'forward' ? 90 : -90}deg) rotateZ(${direction === 'forward' ? 180 : -180}deg) translateZ(-300px)`
            : `rotateX(0deg) rotateZ(0deg) translateZ(${parallaxX}px)`,
        }

      case 'fold-3d':
        return {
          ...baseStyle,
          transformOrigin: 'top center',
          transform: isTransitioning
            ? `perspective(${perspective}px) rotateX(${direction === 'forward' ? -90 : 90}deg) scaleY(0.5)`
            : `perspective(${perspective}px) rotateX(0deg) scaleY(1)`,
        }

      case 'cascade':
        return {
          ...baseStyle,
          transform: isTransitioning
            ? `translateZ(-500px) translateX(${direction === 'forward' ? -100 : 100}px) translateY(${parallaxY * 2}px)`
            : `translateZ(0px) translateX(${parallaxX}px) translateY(${parallaxY}px)`,
          opacity: isTransitioning ? 0 : 1,
        }

      case 'wave-3d':
        return {
          ...baseStyle,
          transform: isTransitioning
            ? `rotateX(${Math.sin(Date.now() / 100) * 30}deg) rotateY(${Math.cos(Date.now() / 100) * 30}deg) translateZ(-200px)`
            : `rotateX(0deg) rotateY(0deg) translateZ(${parallaxX}px)`,
        }

      case 'spiral-3d':
        return {
          ...baseStyle,
          transform: isTransitioning
            ? `rotateZ(${direction === 'forward' ? 360 : -360}deg) scale(0) translateZ(-500px)`
            : `rotateZ(0deg) scale(1) translateZ(${parallaxX}px)`,
        }

      default:
        return baseStyle
    }
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative overflow-hidden"
      style={{ 
        perspective: `${transition.perspective}px`,
        perspectiveOrigin: 'center center'
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.id}
          style={getTransitionStyles()}
          className="w-full h-full absolute inset-0"
        >
          <SlidePreview slide={currentSlide} style={style} isActive={true} />
        </motion.div>
      </AnimatePresence>

      {currentSlide.parallaxLayers && currentSlide.parallaxLayers.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {currentSlide.parallaxLayers.map((layer) => {
            const layerParallaxX = mousePosition.x * layer.depth * 10
            const layerParallaxY = mousePosition.y * layer.depth * 10

            return (
              <motion.div
                key={layer.id}
                style={{
                  position: 'absolute',
                  left: `${layer.position.x}%`,
                  top: `${layer.position.y}%`,
                  width: layer.size?.width || 'auto',
                  height: layer.size?.height || 'auto',
                  opacity: layer.opacity || 1,
                  filter: layer.blur ? `blur(${layer.blur}px)` : 'none',
                  transform: `translate3d(${layerParallaxX}px, ${layerParallaxY}px, ${layer.depth * 100}px)`,
                  transition: 'transform 0.3s ease-out',
                }}
              >
                {layer.type === 'text' && layer.content && (
                  <div className="text-2xl font-bold text-white drop-shadow-lg">
                    {layer.content}
                  </div>
                )}
                {layer.type === 'image' && layer.imageUrl && (
                  <img
                    src={layer.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
                {layer.type === 'shape' && (
                  <div
                    className="w-full h-full rounded-lg"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                    }}
                  />
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
