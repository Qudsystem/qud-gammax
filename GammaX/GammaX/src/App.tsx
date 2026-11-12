import { useState, useCallback, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster, toast } from 'sonner'
import { Presentation, PresentationStyle, Slide, AnimationType, VoiceOver, Comment, ViewEvent, EngagementEvent, MarketplaceTemplate, Annotation, BrandingPreset, AISuggestion, PresentationVersion, Transition3DConfig, Collaborator } from '@/lib/types'
import { generatePresentation } from '@/lib/aiGenerator'
import { trackView, trackEngagement, calculateAnalytics, getMarketplaceTemplates, createPresentationFromTemplate } from '@/lib/analyticsUtils'
import { PromptInput } from '@/components/PromptInput'
import { SlidePreview } from '@/components/SlidePreview'
import { PresentationList } from '@/components/PresentationList'
import { GeneratingState } from '@/components/GeneratingState'
import { StyleAnimationPicker } from '@/components/StyleAnimationPicker'
import { DiagramTemplatesLibrary } from '@/components/DiagramTemplatesLibrary'
import { DiagramEditor } from '@/components/DiagramEditor'
import { AnimationTimingControls } from '@/components/AnimationTimingControls'
import { ExportDialog } from '@/components/ExportDialog'
import { VoiceOverRecorder } from '@/components/VoiceOverRecorder'
import { CollaborationPanel } from '@/components/CollaborationPanel'
import { FileImport } from '@/components/FileImport'
import { CommentsPanel } from '@/components/CommentsPanel'
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard'
import { TemplateMarketplace } from '@/components/TemplateMarketplace'
import { AnnotationTools } from '@/components/AnnotationTools'
import { BrandingPresetsManager } from '@/components/BrandingPresetsManager'
import { AISuggestions } from '@/components/AISuggestions'
import { CollaborationCursors } from '@/components/CollaborationCursors'
import { VersionHistory } from '@/components/VersionHistory'
import { Transition3DPicker } from '@/components/Transition3DPicker'
import { Slide3DRenderer } from '@/components/Slide3DRenderer'
import { CollaboratorSimulator } from '@/components/CollaboratorSimulator'
import { AIEnhancementPanel } from '@/components/AIEnhancementPanel'
import { SlideEditor } from '@/components/SlideEditor'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkle,
  Plus,
  CaretLeft,
  CaretRight,
  List,
  Play,
  DownloadSimple,
  Palette,
  Trash,
  Image as ImageIcon,
  FlowArrow,
  PencilLine,
  SlidersHorizontal,
  Microphone,
  Users,
  FileArrowUp,
  ChatCircle,
  ChartBar,
  ShoppingBag,
  PencilSimple,
  Buildings,
  Lightbulb,
  ClockCounterClockwise,
  Cube,
  MagicWand
} from '@phosphor-icons/react'

function App() {
  const [presentations, setPresentations] = useKV<Presentation[]>('presentations', [])
  const [currentPresentation, setCurrentPresentation] = useState<Presentation | null>(null)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'create' | 'view'>('create')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showDiagramLibrary, setShowDiagramLibrary] = useState(false)
  const [showDiagramEditor, setShowDiagramEditor] = useState(false)
  const [showAnimationTiming, setShowAnimationTiming] = useState(false)
  const [showVoiceOver, setShowVoiceOver] = useState(false)
  const [showCollaboration, setShowCollaboration] = useState(false)
  const [showFileImport, setShowFileImport] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showMarketplace, setShowMarketplace] = useState(false)
  const [showAnnotations, setShowAnnotations] = useState(false)
  const [showBrandingPresets, setShowBrandingPresets] = useState(false)
  const [showAISuggestions, setShowAISuggestions] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [show3DTransitions, setShow3DTransitions] = useState(false)
  const [showAIEnhancements, setShowAIEnhancements] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward')

  const [viewEvents, setViewEvents] = useKV<ViewEvent[]>('view-events', [])
  const [engagementEvents, setEngagementEvents] = useKV<EngagementEvent[]>('engagement-events', [])
  const [presentationVersions, setPresentationVersions] = useKV<PresentationVersion[]>('presentation-versions', [])
  const [currentUser, setCurrentUser] = useState({ login: 'demo-user', avatarUrl: '', id: 'demo-user' })
  const [collaboratorCursors, setCollaboratorCursors] = useState<Collaborator[]>([])
  const [userColor, setUserColor] = useState('#8B5CF6')
  const lastCursorUpdate = useRef<number>(0)

  useEffect(() => {
    window.spark.user().then(user => {
      if (user) {
        setCurrentUser({ login: user.login, avatarUrl: user.avatarUrl, id: String(user.id) })
        const colors = [
          '#8B5CF6', '#EC4899', '#F59E0B', '#10B981',
          '#3B82F6', '#EF4444', '#14B8A6', '#F97316',
          '#8B5CF6', '#A855F7'
        ]
        const colorIndex = Math.abs(hashCode(String(user.id))) % colors.length
        setUserColor(colors[colorIndex])
      }
    }).catch(() => {
      setCurrentUser({ login: 'demo-user', avatarUrl: '', id: 'demo-user' })
    })
  }, [])

  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now()
      setCollaboratorCursors(current =>
        current.filter(c => (now - c.lastSeen) < 3000)
      )
    }, 1000)

    return () => clearInterval(cleanupInterval)
  }, [])

  const hashCode = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash
  }

  const handleGenerate = useCallback(async (prompt: string, style: PresentationStyle, slideCount?: number) => {
    // Validate inputs
    if (!prompt || prompt.trim().length === 0) {
      toast.error('Please enter a presentation prompt')
      return
    }

    if (!style) {
      toast.error('Please select a presentation style')
      return
    }

    setIsGenerating(true)
    try {
      console.log('🎬 Starting presentation generation...')
      console.log('📝 Prompt:', prompt.substring(0, 100) + '...')
      console.log('🎨 Style:', style)
      if (slideCount) console.log('📄 Requested slides:', slideCount)

      const presentation = await generatePresentation(prompt, style, slideCount)

      // Validate the generated presentation
      if (!presentation || !presentation.id) {
        throw new Error('Generated presentation is missing required fields')
      }

      if (!presentation.slides || presentation.slides.length === 0) {
        throw new Error('Generated presentation has no slides')
      }

      console.log('✅ Presentation generated successfully')
      console.log('📊 Slides count:', presentation.slides.length)

      // Update state safely
      setPresentations((current) => {
        try {
          const updated = [presentation, ...(current || [])]
          console.log('💾 Presentations updated in state')
          return updated
        } catch (stateError) {
          console.error('❌ Error updating presentations state:', stateError)
          throw stateError
        }
      })

      setCurrentPresentation(presentation)
      setCurrentSlideIndex(0)
      setActiveTab('view')

      toast.success(`Presentation created with ${presentation.slides.length} slides!`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('❌ Presentation generation failed:', errorMessage)
      toast.error(`Failed to generate presentation: ${errorMessage}`)
    } finally {
      setIsGenerating(false)
    }
  }, [setPresentations])

  const handleSelectPresentation = useCallback((presentation: Presentation) => {
    setCurrentPresentation(presentation)
    setCurrentSlideIndex(0)
    setActiveTab('view')
  }, [])

  const handleDeletePresentation = useCallback((id: string) => {
    setPresentations((current) => (current || []).filter((p) => p.id !== id))
    if (currentPresentation?.id === id) {
      setCurrentPresentation(null)
      setActiveTab('create')
    }
    toast.success('Presentation deleted')
  }, [setPresentations, currentPresentation])

  const handleNewPresentation = useCallback(() => {
    setCurrentPresentation(null)
    setCurrentSlideIndex(0)
    setActiveTab('create')
    setIsFullscreen(false)
  }, [])

  const handlePreviousSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => Math.max(0, prev - 1))
  }, [])

  const handleNextSlide = useCallback(() => {
    if (currentPresentation) {
      setCurrentSlideIndex((prev) => Math.min(currentPresentation.slides.length - 1, prev + 1))
    }
  }, [currentPresentation])

  const handleUpdateSlide = useCallback((updatedSlide: Slide) => {
    if (!currentPresentation) return

    const updatedPresentation = {
      ...currentPresentation,
      slides: currentPresentation.slides.map(slide =>
        slide.id === updatedSlide.id ? updatedSlide : slide
      ),
      updatedAt: Date.now()
    }

    setCurrentPresentation(updatedPresentation)
    setPresentations((current) =>
      (current || []).map(p =>
        p.id === updatedPresentation.id ? updatedPresentation : p
      )
    )
    toast.success('Slide updated')
  }, [currentPresentation, setPresentations])

  const handleChangeStyle = useCallback((newStyle: PresentationStyle) => {
    if (!currentPresentation) return

    const updatedPresentation = {
      ...currentPresentation,
      style: newStyle,
      updatedAt: Date.now()
    }

    setCurrentPresentation(updatedPresentation)
    setPresentations((current) =>
      (current || []).map(p =>
        p.id === updatedPresentation.id ? updatedPresentation : p
      )
    )
    toast.success('Style updated')
  }, [currentPresentation, setPresentations])

  const handleChangeAnimation = useCallback((newAnimation: AnimationType) => {
    if (!currentPresentation) return

    const updatedSlides = currentPresentation.slides.map(slide => ({
      ...slide,
      animation: newAnimation
    }))

    const updatedPresentation = {
      ...currentPresentation,
      slides: updatedSlides,
      updatedAt: Date.now()
    }

    setCurrentPresentation(updatedPresentation)
    setPresentations((current) =>
      (current || []).map(p =>
        p.id === updatedPresentation.id ? updatedPresentation : p
      )
    )
    toast.success('Animation updated')
  }, [currentPresentation, setPresentations])

  const handleAnimationDurationChange = useCallback((duration: number) => {
    if (!currentPresentation) return

    const updatedSlides = currentPresentation.slides.map(slide => ({
      ...slide,
      animationDuration: duration
    }))

    const updatedPresentation = {
      ...currentPresentation,
      slides: updatedSlides,
      updatedAt: Date.now()
    }

    setCurrentPresentation(updatedPresentation)
    setPresentations((current) =>
      (current || []).map(p =>
        p.id === updatedPresentation.id ? updatedPresentation : p
      )
    )
  }, [currentPresentation, setPresentations])

  const handleAnimationDelayChange = useCallback((delay: number) => {
    if (!currentPresentation) return

    const updatedSlides = currentPresentation.slides.map(slide => ({
      ...slide,
      animationDelay: delay
    }))

    const updatedPresentation = {
      ...currentPresentation,
      slides: updatedSlides,
      updatedAt: Date.now()
    }

    setCurrentPresentation(updatedPresentation)
    setPresentations((current) =>
      (current || []).map(p =>
        p.id === updatedPresentation.id ? updatedPresentation : p
      )
    )
  }, [currentPresentation, setPresentations])

  const handleAnimationEasingChange = useCallback((easing: string) => {
    if (!currentPresentation) return

    const updatedSlides = currentPresentation.slides.map(slide => ({
      ...slide,
      animationEasing: easing
    }))

    const updatedPresentation = {
      ...currentPresentation,
      slides: updatedSlides,
      updatedAt: Date.now()
    }

    setCurrentPresentation(updatedPresentation)
    setPresentations((current) =>
      (current || []).map(p =>
        p.id === updatedPresentation.id ? updatedPresentation : p
      )
    )
  }, [currentPresentation, setPresentations])

  const handleVoiceOverSave = useCallback((voiceOver: VoiceOver) => {
    if (!currentPresentation) return

    const updatedSlide = {
      ...currentPresentation.slides[currentSlideIndex],
      voiceOver
    }

    handleUpdateSlide(updatedSlide)
    setShowVoiceOver(false)
  }, [currentPresentation, currentSlideIndex, handleUpdateSlide])

  const handleVoiceOverDelete = useCallback(() => {
    if (!currentPresentation) return

    const updatedSlide = {
      ...currentPresentation.slides[currentSlideIndex],
      voiceOver: undefined
    }

    handleUpdateSlide(updatedSlide)
  }, [currentPresentation, currentSlideIndex, handleUpdateSlide])

  const handlePresentationUpdate = useCallback((updates: Partial<Presentation>) => {
    if (!currentPresentation) return

    const updatedPresentation = {
      ...currentPresentation,
      ...updates,
      updatedAt: Date.now()
    }

    setCurrentPresentation(updatedPresentation)
    setPresentations((current) =>
      (current || []).map(p =>
        p.id === updatedPresentation.id ? updatedPresentation : p
      )
    )
  }, [currentPresentation, setPresentations])

  const handleFileImport = useCallback((presentation: Presentation) => {
    setPresentations((current) => [presentation, ...(current || [])])
    setCurrentPresentation(presentation)
    setCurrentSlideIndex(0)
    setActiveTab('view')
    setShowFileImport(false)
    toast.success('Presentation imported successfully!')
  }, [setPresentations])

  const handleAddComment = useCallback((content: string) => {
    if (!currentPresentation) return

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      slideId: currentPresentation.slides[currentSlideIndex].id,
      userId: currentUser.login,
      userName: currentUser.login,
      userAvatar: currentUser.avatarUrl,
      content,
      createdAt: Date.now()
    }

    const updatedSlide = {
      ...currentPresentation.slides[currentSlideIndex],
      comments: [...(currentPresentation.slides[currentSlideIndex].comments || []), newComment]
    }

    handleUpdateSlide(updatedSlide)

    setEngagementEvents((current) => [
      ...(current || []),
      trackEngagement(currentPresentation.id, updatedSlide.id, 'comment', currentUser.login)
    ])

    toast.success('Comment added')
  }, [currentPresentation, currentSlideIndex, currentUser, handleUpdateSlide, setEngagementEvents])

  const handleAddReply = useCallback((commentId: string, content: string) => {
    if (!currentPresentation) return

    const slide = currentPresentation.slides[currentSlideIndex]
    const comments = slide.comments || []

    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [
            ...(comment.replies || []),
            {
              id: `reply-${Date.now()}`,
              userId: currentUser.login,
              userName: currentUser.login,
              userAvatar: currentUser.avatarUrl,
              content,
              createdAt: Date.now()
            }
          ]
        }
      }
      return comment
    })

    const updatedSlide = {
      ...slide,
      comments: updatedComments
    }

    handleUpdateSlide(updatedSlide)
    toast.success('Reply added')
  }, [currentPresentation, currentSlideIndex, currentUser, handleUpdateSlide])

  const handleResolveComment = useCallback((commentId: string) => {
    if (!currentPresentation) return

    const slide = currentPresentation.slides[currentSlideIndex]
    const comments = slide.comments || []

    const updatedComments = comments.map(comment =>
      comment.id === commentId ? { ...comment, resolved: true } : comment
    )

    const updatedSlide = {
      ...slide,
      comments: updatedComments
    }

    handleUpdateSlide(updatedSlide)
    toast.success('Comment resolved')
  }, [currentPresentation, currentSlideIndex, handleUpdateSlide])

  const handleDeleteComment = useCallback((commentId: string) => {
    if (!currentPresentation) return

    const slide = currentPresentation.slides[currentSlideIndex]
    const comments = slide.comments || []

    const updatedComments = comments.filter(comment => comment.id !== commentId)

    const updatedSlide = {
      ...slide,
      comments: updatedComments
    }

    handleUpdateSlide(updatedSlide)
    toast.success('Comment deleted')
  }, [currentPresentation, currentSlideIndex, handleUpdateSlide])

  const handleTemplateSelect = useCallback((template: MarketplaceTemplate) => {
    const newPresentation = createPresentationFromTemplate(template)
    setPresentations((current) => [newPresentation, ...(current || [])])
    setCurrentPresentation(newPresentation)
    setCurrentSlideIndex(0)
    setActiveTab('view')
    setShowMarketplace(false)
    toast.success(`Template "${template.name}" applied!`)
  }, [setPresentations])

  const handleAddAnnotation = useCallback((annotation: Annotation) => {
    if (!currentPresentation) return

    const updatedSlide = {
      ...currentPresentation.slides[currentSlideIndex],
      annotations: [...(currentPresentation.slides[currentSlideIndex].annotations || []), annotation]
    }

    handleUpdateSlide(updatedSlide)
  }, [currentPresentation, currentSlideIndex, handleUpdateSlide])

  const handleDeleteAnnotation = useCallback((annotationId: string) => {
    if (!currentPresentation) return

    const currentSlide = currentPresentation.slides[currentSlideIndex]
    const updatedSlide = {
      ...currentSlide,
      annotations: (currentSlide.annotations || []).filter(a => a.id !== annotationId)
    }

    handleUpdateSlide(updatedSlide)
  }, [currentPresentation, currentSlideIndex, handleUpdateSlide])

  const handleApplyBrandingPreset = useCallback((preset: BrandingPreset) => {
    if (!currentPresentation) return

    const updatedPresentation = {
      ...currentPresentation,
      brandingPresetId: preset.id,
      updatedAt: Date.now()
    }

    setCurrentPresentation(updatedPresentation)
    setPresentations((current) =>
      (current || []).map(p =>
        p.id === updatedPresentation.id ? updatedPresentation : p
      )
    )
  }, [currentPresentation, setPresentations])

  const handleApplyAISuggestion = useCallback((suggestion: AISuggestion) => {
    if (!currentPresentation) return

    const updatedSuggestions = [
      ...(currentPresentation.aiSuggestions || []).filter(s => s.id !== suggestion.id),
      { ...suggestion, applied: true }
    ]

    const updatedPresentation = {
      ...currentPresentation,
      aiSuggestions: updatedSuggestions,
      updatedAt: Date.now()
    }

    setCurrentPresentation(updatedPresentation)
    setPresentations((current) =>
      (current || []).map(p =>
        p.id === updatedPresentation.id ? updatedPresentation : p
      )
    )

    if (suggestion.targetSlideId) {
      const slideIndex = currentPresentation.slides.findIndex(s => s.id === suggestion.targetSlideId)
      if (slideIndex !== -1) {
        setCurrentSlideIndex(slideIndex)
      }
    }
  }, [currentPresentation, setPresentations])

  const handleDismissAISuggestion = useCallback((suggestionId: string) => {
    if (!currentPresentation) return

    const updatedSuggestions = (currentPresentation.aiSuggestions || []).filter(s => s.id !== suggestionId)

    const updatedPresentation = {
      ...currentPresentation,
      aiSuggestions: updatedSuggestions,
      updatedAt: Date.now()
    }

    setCurrentPresentation(updatedPresentation)
    setPresentations((current) =>
      (current || []).map(p =>
        p.id === updatedPresentation.id ? updatedPresentation : p
      )
    )
  }, [currentPresentation, setPresentations])

  const handleCreateVersion = useCallback((changeDescription: string) => {
    if (!currentPresentation) return

    const newVersion: PresentationVersion = {
      id: `version-${Date.now()}`,
      presentationId: currentPresentation.id,
      version: (currentPresentation.currentVersion || 0) + 1,
      title: currentPresentation.title,
      description: currentPresentation.description,
      slides: currentPresentation.slides,
      style: currentPresentation.style,
      createdAt: Date.now(),
      createdBy: currentUser.id,
      createdByName: currentUser.login,
      changeDescription,
      isAutoSave: false
    }

    setPresentationVersions((current) => [...(current || []), newVersion])

    const updatedPresentation = {
      ...currentPresentation,
      currentVersion: newVersion.version,
      updatedAt: Date.now()
    }

    setCurrentPresentation(updatedPresentation)
    setPresentations((current) =>
      (current || []).map(p =>
        p.id === updatedPresentation.id ? updatedPresentation : p
      )
    )
  }, [currentPresentation, currentUser, setPresentationVersions, setPresentations])

  const handleRestoreVersion = useCallback((version: PresentationVersion) => {
    if (!currentPresentation) return

    const restoredPresentation = {
      ...currentPresentation,
      title: version.title,
      description: version.description,
      slides: version.slides,
      style: version.style,
      currentVersion: version.version,
      updatedAt: Date.now()
    }

    setCurrentPresentation(restoredPresentation)
    setPresentations((current) =>
      (current || []).map(p =>
        p.id === restoredPresentation.id ? restoredPresentation : p
      )
    )
  }, [currentPresentation, setPresentations])

  const handle3DTransitionChange = useCallback((transition: Transition3DConfig) => {
    if (!currentPresentation) return

    const updatedSlides = currentPresentation.slides.map(slide => ({
      ...slide,
      transition3D: transition
    }))

    const updatedPresentation = {
      ...currentPresentation,
      slides: updatedSlides,
      updatedAt: Date.now()
    }

    setCurrentPresentation(updatedPresentation)
    setPresentations((current) =>
      (current || []).map(p =>
        p.id === updatedPresentation.id ? updatedPresentation : p
      )
    )
    toast.success('3D transition applied to all slides')
  }, [currentPresentation, setPresentations])

  const handleMouseMoveInSlide = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentPresentation?.shareSettings?.isShared || !currentPresentation.slides[currentSlideIndex]) return

    const now = Date.now()
    if (now - lastCursorUpdate.current < 100) return
    lastCursorUpdate.current = now

    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    const updatedCollaborator: Collaborator = {
      id: currentUser.id,
      login: currentUser.login,
      avatarUrl: currentUser.avatarUrl,
      lastSeen: Date.now(),
      currentSlide: currentSlideIndex,
      color: userColor,
      cursor: {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
        slideId: currentPresentation.slides[currentSlideIndex].id
      }
    }

    setCollaboratorCursors((current) => {
      const filtered = current.filter(c => c.id !== currentUser.id)
      return [...filtered, updatedCollaborator]
    })
  }, [currentPresentation, currentSlideIndex, currentUser, userColor])

  const handlePreviousSlideWithTransition = useCallback(() => {
    setTransitionDirection('backward')
    setIsTransitioning(true)
    setTimeout(() => {
      handlePreviousSlide()
      setIsTransitioning(false)
    }, 300)
  }, [handlePreviousSlide])

  const handleNextSlideWithTransition = useCallback(() => {
    setTransitionDirection('forward')
    setIsTransitioning(true)
    setTimeout(() => {
      handleNextSlide()
      setIsTransitioning(false)
    }, 300)
  }, [handleNextSlide])

  const handleApplyAIEnhancement = useCallback((type: string, data: any) => {
    if (!currentPresentation) return

    switch (type) {
      case 'expand-content':
        handleUpdateSlide({ ...currentPresentation.slides.find(s => s.id === data.slideId)!, content: data.content })
        break
      case 'improve-clarity':
        handleUpdateSlide({ ...currentPresentation.slides.find(s => s.id === data.slideId)!, content: data.content })
        break
      case 'speaker-notes':
        handleUpdateSlide({ ...currentPresentation.slides.find(s => s.id === data.slideId)!, notes: data.notes })
        break
      case 'optimize-title':
        handleUpdateSlide({ ...currentPresentation.slides.find(s => s.id === data.slideId)!, title: data.title })
        break
      case 'add-image':
        toast.success('Image generation feature coming soon!')
        break
      case 'add-diagram':
        toast.success('Diagram template feature coming soon!')
        break
      case 'restructure':
        toast.success('Restructure suggestion noted')
        break
      default:
        break
    }
  }, [currentPresentation, handleUpdateSlide])

  const handleTrackView = useCallback(() => {
    if (!currentPresentation) return

    const viewEvent = trackView(
      currentPresentation.id,
      currentUser.login,
      currentUser.login,
      [currentSlideIndex],
      5000,
      currentPresentation.slides.length
    )

    setViewEvents((current) => [...(current || []), viewEvent])

    const analytics = calculateAnalytics(
      currentPresentation.id,
      [...(viewEvents || []), viewEvent],
      engagementEvents || []
    )

    handlePresentationUpdate({ analytics })
  }, [currentPresentation, currentSlideIndex, currentUser, viewEvents, engagementEvents, setViewEvents, handlePresentationUpdate])

  useEffect(() => {
    if (currentPresentation && activeTab === 'view') {
      const timer = setTimeout(handleTrackView, 3000)
      return () => clearTimeout(timer)
    }
  }, [currentPresentation, currentSlideIndex, activeTab, handleTrackView])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!currentPresentation) return
    const isView = activeTab === 'view'
    switch (e.key) {
      case 'ArrowLeft':
        if (isView) handlePreviousSlide()
        break
      case 'ArrowRight':
        if (isView) handleNextSlide()
        break
      case 'Escape':
        if (isFullscreen) setIsFullscreen(false)
        break
      case 'f':
      case 'F':
        if (isView) setIsFullscreen((v) => !v)
        break
      case 'a':
      case 'A':
        if (isView) setShowAIEnhancements(true)
        break
      case 'd':
      case 'D':
        if (isView) setShowDiagramLibrary(true)
        break
      case 'c':
      case 'C':
        if (isView) setShowComments(true)
        break
      default:
        break
    }
  }, [currentPresentation, activeTab, handlePreviousSlide, handleNextSlide, isFullscreen])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown as any)
    return () => window.removeEventListener('keydown', handleKeyDown as any)
  }, [handleKeyDown])

  if (isGenerating) {
    return (
      <>
        <GeneratingState />
        <Toaster />
      </>
    )
  }

  if (isFullscreen && currentPresentation) {
    const currentSlide = currentPresentation.slides[currentSlideIndex]
    const has3DTransition = currentSlide.transition3D

    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        {has3DTransition ? (
          <Slide3DRenderer
            currentSlide={currentSlide}
            nextSlide={currentPresentation.slides[currentSlideIndex + 1]}
            style={currentPresentation.style}
            transition={currentSlide.transition3D}
            isTransitioning={isTransitioning}
            direction={transitionDirection}
          />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlideIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              <SlidePreview
                slide={currentSlide}
                style={currentPresentation.style}
                isActive={true}
              />
            </motion.div>
          </AnimatePresence>
        )}

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/70 backdrop-blur-sm px-6 py-3 rounded-full">
          <Button
            onClick={has3DTransition ? handlePreviousSlideWithTransition : handlePreviousSlide}
            disabled={currentSlideIndex === 0}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <CaretLeft className="w-6 h-6" />
          </Button>
          <span className="text-white text-sm font-medium">
            {currentSlideIndex + 1} / {currentPresentation.slides.length}
          </span>
          <Button
            onClick={has3DTransition ? handleNextSlideWithTransition : handleNextSlide}
            disabled={currentSlideIndex === currentPresentation.slides.length - 1}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <CaretRight className="w-6 h-6" />
          </Button>
          <Separator orientation="vertical" className="h-6 bg-white/30" />
          <ExportDialog
            presentation={currentPresentation}
            trigger={
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <DownloadSimple className="w-4 h-4 mr-2" />
                Export
              </Button>
            }
          />
          <Button
            onClick={() => setIsFullscreen(false)}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            Exit
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkle className="w-6 h-6 text-white" weight="fill" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">GammaX</h1>
                <p className="text-xs text-muted-foreground">AI Presentation Generator</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowMarketplace(true)} variant="outline">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Templates
              </Button>
              {currentPresentation && (
                <Button onClick={handleNewPresentation} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  New Presentation
                </Button>
              )}
              <Button onClick={() => setShowFileImport(true)} variant="outline">
                <FileArrowUp className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 md:py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'create' | 'view')}>
          <TabsList className="mb-6">
            <TabsTrigger value="create">
              <Sparkle className="w-4 h-4 mr-2" />
              Create
            </TabsTrigger>
            <TabsTrigger value="view" disabled={!currentPresentation}>
              <List className="w-4 h-4 mr-2" />
              View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-foreground mb-3">
                Create Your Presentation
              </h2>
              <p className="text-lg text-muted-foreground">
                Describe your idea and let AI generate beautiful slides
              </p>
            </div>

            <PromptInput onGenerate={handleGenerate} isGenerating={isGenerating} />

            {presentations && presentations.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-foreground">Recent Presentations</h3>
                  <span className="text-sm text-muted-foreground">{presentations.length} total</span>
                </div>
                <PresentationList
                  presentations={presentations || []}
                  onSelect={handleSelectPresentation}
                  onDelete={handleDeletePresentation}
                  selectedId={currentPresentation?.id}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="view">
            {currentPresentation && (
              <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">
                      {currentPresentation.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {currentPresentation.description}
                    </p>
                  </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        onClick={() => setIsFullscreen(true)}
                        variant="default"
                        size="sm"
                        className="bg-gradient-to-r from-primary to-accent shadow-md hover:shadow-lg transition-all"
                      >
                        <Play className="w-4 h-4 mr-2" weight="fill" />
                        Present
                      </Button>

                      <ExportDialog presentation={currentPresentation} />

                      <div className="hidden sm:flex items-center gap-2">
                        <Dialog open={showAIEnhancements} onOpenChange={setShowAIEnhancements}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MagicWand className="w-4 h-4 mr-2" weight="fill" />
                              AI Enhance
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0">
                            <AIEnhancementPanel
                              presentation={currentPresentation}
                              currentSlideIndex={currentSlideIndex}
                              onApplyEnhancement={handleApplyAIEnhancement}
                              onClose={() => setShowAIEnhancements(false)}
                            />
                          </DialogContent>
                        </Dialog>

                        <StyleAnimationPicker
                          currentStyle={currentPresentation.style}
                          currentAnimation={currentPresentation.slides[0]?.animation}
                          onStyleChange={handleChangeStyle}
                          onAnimationChange={handleChangeAnimation}
                        />
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <SlidersHorizontal className="w-4 h-4 mr-2" />
                            Tools
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Presentation Tools</DialogTitle>
                            <DialogDescription>Access all editing and collaboration tools</DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
                            <Button variant="outline" onClick={() => setShowDiagramLibrary(true)} className="justify-start">
                              <FlowArrow className="w-4 h-4 mr-2" /> Diagram Lib
                            </Button>
                            <Button variant="outline" onClick={() => setShowAnimationTiming(true)} className="justify-start">
                              <SlidersHorizontal className="w-4 h-4 mr-2" /> Timing
                            </Button>
                            <Button variant="outline" onClick={() => setShowVoiceOver(true)} className="justify-start">
                              <Microphone className="w-4 h-4 mr-2" /> Voice
                            </Button>
                            <Button variant="outline" onClick={() => setShowCollaboration(true)} className="justify-start">
                              <Users className="w-4 h-4 mr-2" /> Share
                            </Button>
                            <Button variant="outline" onClick={() => setShowComments(true)} className="justify-start">
                              <ChatCircle className="w-4 h-4 mr-2" /> Comments
                            </Button>
                            <Button variant="outline" onClick={() => setShowAnalytics(true)} className="justify-start">
                              <ChartBar className="w-4 h-4 mr-2" /> Analytics
                            </Button>
                            <Button variant="outline" onClick={() => setShowAnnotations(true)} className="justify-start">
                              <PencilSimple className="w-4 h-4 mr-2" /> Annotate
                            </Button>
                            <Button variant="outline" onClick={() => setShowBrandingPresets(true)} className="justify-start">
                              <Buildings className="w-4 h-4 mr-2" /> Branding
                            </Button>
                            <Button variant="outline" onClick={() => setShowAISuggestions(true)} className="justify-start">
                              <Lightbulb className="w-4 h-4 mr-2" /> AI Tips
                            </Button>
                            <Button variant="outline" onClick={() => setShowVersionHistory(true)} className="justify-start">
                              <ClockCounterClockwise className="w-4 h-4 mr-2" /> History
                            </Button>
                            <Button variant="outline" onClick={() => setShow3DTransitions(true)} className="justify-start">
                              <Cube className="w-4 h-4 mr-2" /> 3D Effects
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div className="hidden">
                    <Dialog open={showDiagramLibrary} onOpenChange={setShowDiagramLibrary}>
                      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
                        <DiagramTemplatesLibrary
                          onSelect={(template) => {
                            const newSlide: Slide = {
                              id: `slide-${Date.now()}`,
                              layout: template.data.type as any,
                              title: template.name,
                              content: [template.description],
                              diagram: template.data,
                              animation: 'fade-in'
                            }
                            const updatedPresentation = {
                              ...currentPresentation!,
                              slides: [...currentPresentation!.slides, newSlide],
                              updatedAt: Date.now()
                            }
                            setCurrentPresentation(updatedPresentation)
                            setPresentations((current) =>
                              (current || []).map(p =>
                                p.id === updatedPresentation.id ? updatedPresentation : p
                              )
                            )
                            setShowDiagramLibrary(false)
                            toast.success('Diagram slide added')
                          }}
                          onClose={() => setShowDiagramLibrary(false)}
                        />
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showAnimationTiming} onOpenChange={setShowAnimationTiming}>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
                        <ScrollArea className="max-h-[70vh]">
                          <AnimationTimingControls
                            currentAnimation={currentPresentation.slides[currentSlideIndex].animation || 'fade-in'}
                            currentDuration={currentPresentation.slides[currentSlideIndex].animationDuration}
                            currentDelay={currentPresentation.slides[currentSlideIndex].animationDelay}
                            currentEasing={currentPresentation.slides[currentSlideIndex].animationEasing}
                            onAnimationChange={handleChangeAnimation}
                            onDurationChange={handleAnimationDurationChange}
                            onDelayChange={handleAnimationDelayChange}
                            onEasingChange={handleAnimationEasingChange}
                          />
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showVoiceOver} onOpenChange={setShowVoiceOver}>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
                        <ScrollArea className="max-h-[70vh]">
                          <VoiceOverRecorder
                            slideId={currentPresentation.slides[currentSlideIndex].id}
                            existingVoiceOver={currentPresentation.slides[currentSlideIndex].voiceOver}
                            onSave={handleVoiceOverSave}
                            onDelete={handleVoiceOverDelete}
                          />
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showCollaboration} onOpenChange={setShowCollaboration}>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
                        <ScrollArea className="max-h-[70vh]">
                          <div className="space-y-4 p-1">
                            <CollaborationPanel
                              presentation={currentPresentation}
                              onUpdate={handlePresentationUpdate}
                            />
                            <CollaboratorSimulator
                              currentSlideId={currentPresentation.slides[currentSlideIndex]?.id || ''}
                              onUpdateCursors={(cursors) => setCollaboratorCursors((current) => {
                                const filtered = current.filter(c => !c.id.startsWith('demo-'))
                                return [...filtered, ...cursors]
                              })}
                            />
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showComments} onOpenChange={setShowComments}>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
                        <CommentsPanel
                          slideId={currentPresentation.slides[currentSlideIndex].id}
                          comments={currentPresentation.slides.flatMap(s => s.comments || [])}
                          currentUser={currentUser}
                          onAddComment={handleAddComment}
                          onAddReply={handleAddReply}
                          onResolveComment={handleResolveComment}
                          onDeleteComment={handleDeleteComment}
                        />
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
                      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
                        <ScrollArea className="max-h-[85vh] p-6">
                          <AnalyticsDashboard
                            presentationId={currentPresentation.id}
                            analytics={currentPresentation.analytics || {
                              presentationId: currentPresentation.id,
                              totalViews: 0,
                              uniqueViewers: 0,
                              averageDuration: 0,
                              completionRate: 0,
                              slideEngagement: {},
                              viewsByDay: {},
                              topReferrers: [],
                              deviceBreakdown: { mobile: 0, tablet: 0, desktop: 0 },
                              lastUpdated: Date.now()
                            }}
                            viewEvents={(viewEvents || []).filter(e => e.presentationId === currentPresentation.id)}
                            engagementEvents={(engagementEvents || []).filter(e => e.presentationId === currentPresentation.id)}
                            slideCount={currentPresentation.slides.length}
                          />
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showAnnotations} onOpenChange={setShowAnnotations}>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                        <ScrollArea className="max-h-[75vh]">
                          <AnnotationTools
                            slideId={currentPresentation.slides[currentSlideIndex].id}
                            annotations={currentPresentation.slides.flatMap(s => s.annotations || [])}
                            onAddAnnotation={handleAddAnnotation}
                            onDeleteAnnotation={handleDeleteAnnotation}
                            canvasWidth={800}
                            canvasHeight={450}
                            currentUser={currentUser.login}
                          />
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showBrandingPresets} onOpenChange={setShowBrandingPresets}>
                      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
                        <ScrollArea className="max-h-[85vh] p-6">
                          <BrandingPresetsManager
                            currentPresetId={currentPresentation.brandingPresetId}
                            onApplyPreset={handleApplyBrandingPreset}
                            onClose={() => setShowBrandingPresets(false)}
                          />
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showAISuggestions} onOpenChange={setShowAISuggestions}>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                        <ScrollArea className="max-h-[75vh] p-6">
                          <AISuggestions
                            presentation={currentPresentation}
                            viewEvents={(viewEvents || []).filter(e => e.presentationId === currentPresentation.id)}
                            engagementEvents={(engagementEvents || []).filter(e => e.presentationId === currentPresentation.id)}
                            onApplySuggestion={handleApplyAISuggestion}
                            onDismissSuggestion={handleDismissAISuggestion}
                          />
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
                        <VersionHistory
                          presentation={currentPresentation}
                          versions={(presentationVersions || []).filter(v => v.presentationId === currentPresentation.id)}
                          onRestore={handleRestoreVersion}
                          onCreateVersion={handleCreateVersion}
                        />
                      </DialogContent>
                    </Dialog>

                    <Dialog open={show3DTransitions} onOpenChange={setShow3DTransitions}>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
                        <Transition3DPicker
                          currentTransition={currentPresentation.slides[currentSlideIndex]?.transition3D}
                          onTransitionChange={handle3DTransitionChange}
                          onClose={() => setShow3DTransitions(false)}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col gap-6">
                  {/* Slide Navigation & Preview Area */}
                  <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
                    {/* Sidebar / Thumbnail List */}
                    <div className="flex flex-col gap-4 order-2 lg:order-1">
                      <div className="flex items-center justify-between px-1">
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <List className="w-4 h-4 text-accent" />
                          Slides
                          <Badge variant="secondary" className="ml-1 text-[10px] font-normal">
                            {currentPresentation.slides.length}
                          </Badge>
                        </h4>
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                          {currentPresentation.style}
                        </Badge>
                      </div>

                      {/* Responsive Slide List: Horizontal on mobile, Vertical on desktop */}
                      <ScrollArea className="w-full lg:h-[calc(100vh-280px)] lg:pr-4">
                        <div className="flex lg:flex-col gap-3 pb-4 lg:pb-0">
                          {currentPresentation.slides.map((slide, index) => (
                            <motion.button
                              key={slide.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.03 }}
                              onClick={() => {
                                setCurrentSlideIndex(index)
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }}
                              className={`flex-shrink-0 w-[160px] lg:w-full text-left p-3 rounded-xl border-2 transition-all group ${index === currentSlideIndex
                                ? 'border-accent bg-accent/5 shadow-lg ring-1 ring-accent/20'
                                : 'border-border hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm'
                                }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${index === currentSlideIndex ? 'bg-accent text-white' : 'bg-muted text-muted-foreground'
                                  }`}>
                                  {index + 1}
                                </span>
                                <Badge variant="ghost" className="text-[9px] p-0 opacity-60">
                                  {slide.layout}
                                </Badge>
                              </div>
                              <div className="text-xs font-semibold text-foreground line-clamp-2 group-hover:text-accent transition-colors">
                                {slide.title || 'Untitled Slide'}
                              </div>
                              <div className="mt-2 flex items-center gap-1.5">
                                {slide.imageUrl && <ImageIcon className="w-3 h-3 text-accent/70" />}
                                {slide.diagram && <FlowArrow className="w-3 h-3 text-accent/70" />}
                                {slide.comments && slide.comments.length > 0 && <ChatCircle className="w-3 h-3 text-accent/70" />}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Main Preview Area */}
                    <div className="space-y-4 order-1 lg:order-2">
                      <div className="flex items-center justify-between bg-card/50 backdrop-blur-md border border-border p-3 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
                            <span className="text-xs font-bold text-foreground">{currentSlideIndex + 1}</span>
                            <span className="text-[10px] text-muted-foreground">/</span>
                            <span className="text-[10px] text-muted-foreground font-medium">{currentPresentation.slides.length}</span>
                          </div>
                          <h3 className="text-sm font-semibold text-foreground truncate max-w-[150px] sm:max-w-none">
                            {currentPresentation.slides[currentSlideIndex].title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-accent/10 hover:text-accent"
                            onClick={handlePreviousSlide}
                            disabled={currentSlideIndex === 0}
                          >
                            <CaretLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-accent/10 hover:text-accent"
                            onClick={handleNextSlide}
                            disabled={currentSlideIndex === currentPresentation.slides.length - 1}
                          >
                            <CaretRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentSlideIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="relative group"
                          onMouseMove={handleMouseMoveInSlide}
                        >
                          <div className="rounded-2xl overflow-hidden shadow-2xl border border-border bg-card">
                            <SlidePreview
                              slide={currentPresentation.slides[currentSlideIndex]}
                              style={currentPresentation.style}
                              isActive={true}
                            />
                          </div>
                          {currentPresentation.shareSettings?.isShared && (
                            <CollaborationCursors
                              collaborators={collaboratorCursors}
                              currentSlideId={currentPresentation.slides[currentSlideIndex].id}
                            />
                          )}
                        </motion.div>
                      </AnimatePresence>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <SlideEditor
                          slide={currentPresentation.slides[currentSlideIndex]}
                          style={currentPresentation.style}
                          onSave={handleUpdateSlide}
                          onCancel={() => { }}
                        />

                        {currentPresentation.slides[currentSlideIndex].notes && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-4 bg-accent/5 rounded-xl border border-accent/10"
                          >
                            <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-2 flex items-center gap-2">
                              <PencilLine className="w-3.5 h-3.5" />
                              Speaker Notes
                            </h4>
                            <p className="text-sm text-foreground/80 leading-relaxed italic">
                              "{currentPresentation.slides[currentSlideIndex].notes}"
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showFileImport} onOpenChange={setShowFileImport}>
        <DialogContent className="max-w-2xl">
          <FileImport
            onImport={handleFileImport}
            onCancel={() => setShowFileImport(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showMarketplace} onOpenChange={setShowMarketplace}>
        <DialogContent className="max-w-7xl max-h-[95vh] p-0 overflow-hidden">
          <TemplateMarketplace
            templates={getMarketplaceTemplates()}
            onSelectTemplate={handleTemplateSelect}
            onClose={() => setShowMarketplace(false)}
          />
        </DialogContent>
      </Dialog>

      <Toaster />
    </div >
  )
}

export default App
