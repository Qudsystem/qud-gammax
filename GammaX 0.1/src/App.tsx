import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowCounterClockwise,
  ArrowLeft,
  Cards,
  CaretDown,
  CaretLeft,
  CaretRight,
  ChatCircleText,
  DotsThree,
  DownloadSimple,
  List,
  MagnifyingGlass,
  Play,
  Plus,
  Sparkle,
  TextT,
  Image as ImageIcon,
  Selection as SelectionIcon,
  Globe as GlobeIcon,
  ChartBar,
  Pencil,
  X,
} from '@phosphor-icons/react'

import { AccountSettingsModal } from './components/AccountSettingsModal'
import { AnalyticsView } from './components/AnalyticsView'
import { CommentsSidebar } from './components/CommentsSidebar'
import { CreateAIView } from './components/CreateAIView'
import { DashboardLayout } from './components/DashboardLayout'
import { AIImagesView, SitesView, SharedView, FontsView, TrashView } from './components/EcosystemViews'
import { GeneratingState } from './components/GeneratingState'
import { ImportFileModal } from './components/ImportFileModal'
import { ImportWithAIView } from './components/ImportWithAIView'
import { LandingPage } from './components/LandingPage'
import { MarketplaceView } from './components/MarketplaceView'
import { NewGammaModal } from './components/NewGammaModal'
import { PasteTextView } from './components/PasteTextView'
import { PresentationList } from './components/PresentationList'
import { SearchModal } from './components/SearchModal'
import { SettingsView } from './components/SettingsView'
import { SlideEditor } from './components/SlideEditor'
import { SlidePreview } from './components/SlidePreview'
import { SubscriptionModal } from './components/SubscriptionModal'
import { TemplatesView } from './components/TemplatesView'
import { ThemeEditor } from './components/ThemeEditor'
import { ThemesView } from './components/ThemesView'
import { Button } from './components/ui/button'
import { Presentation, PresentationStyle, AppView, Slide } from './lib/types'
import { generatePresentation } from './lib/aiGenerator'
import { useKV } from './spark-hooks'
import { cn } from './lib/utils'
import { SlideOutline } from './components/SlideOutline'
import { GenerateView } from './components/GenerateView'
import { useShortcutHintsEnabled } from './hooks/useKeyboardShortcuts'
import { loadProviderSettings } from './lib/settings'

type Tool = { id: string; icon: typeof MagnifyingGlass; action: () => void }

export default function App() {
  const [view, setView] = useState<AppView>('landing')
  const [presentations, setPresentations] = useKV<Presentation[]>('presentations', [])
  const [currentPresentation, setCurrentPresentation] = useState<Presentation | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [showLayoutPicker, setShowLayoutPicker] = useState(false)
  const [showVisualEditor, setShowVisualEditor] = useState(false)
  const [isNewGammaModalOpen, setIsNewGammaModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)
  const [isAccountSettingsModalOpen, setIsAccountSettingsModalOpen] = useState(false)
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const [showSlideEditor, setShowSlideEditor] = useState(false)
  const [viewport] = useState<'desktop' | 'mobile' | 'tablet'>('desktop')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
      const isTyping = tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsSearchVisible(true)
        return
      }
      if (!isTyping) {
        if (e.key.toLowerCase() === 'n') {
          setView('generate-ai')
          return
        }
        if (e.key.toLowerCase() === 'g') {
          setView('dashboard')
          return
        }
        if (e.key.toLowerCase() === 'p' && currentPresentation) {
          setIsPreviewMode(prev => !prev)
          return
        }
        if (currentPresentation) {
          if (e.key === 'ArrowRight' || e.key === ']') nextSlide()
          if (e.key === 'ArrowLeft' || e.key === '[') prevSlide()
          if (e.key === 'Home') setCurrentSlideIndex(0)
          if (e.key === 'End') setCurrentSlideIndex(currentPresentation.slides.length - 1)
          // Numeric navigation: 1-9 jump to slides 1-9, 0 jumps to last slide
          const numKey = parseInt(e.key, 10)
          if (!isNaN(numKey) && numKey >= 1 && numKey <= 9) {
            const targetIndex = numKey - 1
            if (targetIndex < currentPresentation.slides.length) {
              setCurrentSlideIndex(targetIndex)
            }
          }
          if (e.key === '0') {
            setCurrentSlideIndex(currentPresentation.slides.length - 1)
          }
        }
      }
      if (e.key === 'Escape') setIsPreviewMode(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPresentation, currentSlideIndex])

  useEffect(() => {
    if (currentPresentation) {
      setPresentations(prev => prev.map(p => (p.id === currentPresentation.id ? currentPresentation : p)))
    }
  }, [currentPresentation, setPresentations])

  const handleSlideChange = (updatedSlide: Slide) => {
    if (!currentPresentation) return
    const updatedSlides = currentPresentation.slides.map((slide, index) =>
      index === currentSlideIndex ? updatedSlide : slide
    )
    setCurrentPresentation({ ...currentPresentation, slides: updatedSlides })
  }

  const handleGenerate = async (
    prompt: string,
    style: PresentationStyle,
    numSlides: number,
    config: { language?: string; ratio?: string; textDensity?: string } = {}
  ) => {
    setIsGenerating(true)
    try {
      const presentation = await generatePresentation(prompt, style, numSlides, config)
      setPresentations(prev => [presentation, ...prev])
      setCurrentPresentation(presentation)
      setView('presentation')
      setCurrentSlideIndex(0)
    } catch (error) {
      console.error(error)
      alert('Failed to generate presentation. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const nextSlide = () => {
    if (currentPresentation && currentSlideIndex < currentPresentation.slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1)
    }
  }

  const tools: Tool[] = useMemo(
    () => [
      { icon: MagnifyingGlass, id: 'search', action: () => setIsSearchVisible(true) },
      { icon: TextT, id: 'text', action: () => setActiveTool(prev => (prev === 'text' ? null : 'text')) },
      { icon: ImageIcon, id: 'image', action: () => setActiveTool(prev => (prev === 'image' ? null : 'image')) },
      { icon: SelectionIcon, id: 'layout', action: () => setShowLayoutPicker(prev => !prev) },
      { icon: GlobeIcon, id: 'visual', action: () => setShowVisualEditor(prev => !prev) },
      { icon: ChartBar, id: 'chart', action: () => setActiveTool(prev => (prev === 'chart' ? null : 'chart')) },
      { icon: SelectionIcon, id: 'selection', action: () => setActiveTool(prev => (prev === 'selection' ? null : 'selection')) },
      { icon: Pencil, id: 'pencil', action: () => setActiveTool(prev => (prev === 'pencil' ? null : 'pencil')) },
      { icon: ChatCircleText, id: 'comments', action: () => setIsCommentsOpen(prev => !prev) },
    ],
    []
  )

  const renderView = () => {
    if (view === 'landing') return <LandingPage onStart={() => setView('dashboard')} />
    if (view === 'theme-editor') return <ThemeEditor onClose={() => setView('themes')} />
    if (view === 'presentation' && currentPresentation) return renderPresentationView()

    if (view === 'create-ai') {
      return (
        <CreateAIView
          onBack={() => setView('dashboard')}
          onAction={(type) => {
            if (type === 'generate') setView('generate-ai')
            else if (type === 'paste') setView('paste-text')
            else if (type === 'import') setIsImportModalOpen(true)
          }}
        />
      )
    }

    if (view === 'import-ai') {
      return (
        <ImportWithAIView
          onBack={() => setView('create-ai')}
          onPasteText={() => setView('paste-text')}
          onImport={(url) => {
            handleGenerate(`Research and summarize the content from: ${url}`, 'creative', 8)
          }}
        />
      )
    }

    if (view === 'generate-ai') {
      return (
        <GenerateView
          onBack={() => setView('create-ai')}
          isGenerating={isGenerating}
          onGenerate={(prompt, config) => {
            const style = config.style === 'Studio' ? 'creative' : 'minimal'
            handleGenerate(prompt, style as PresentationStyle, config.cardCount, {
              language: config.language,
              ratio: config.ratio,
              textDensity: config.textDensity,
            })
          }}
        />
      )
    }

    if (view === 'paste-text') {
      return (
        <PasteTextView
          onBack={() => setView('create-ai')}
          isGenerating={isGenerating}
          onContinue={(content, mode) => {
            const refinedPrompt =
              mode === 'summarize'
                ? `Summarize this content into a presentation: ${content.substring(0, 2000)}`
                : `Convert these notes/outline into a structured presentation: ${content.substring(0, 2000)}`
            handleGenerate(refinedPrompt, 'modern', 10)
          }}
        />
      )
    }

    return (
      <DashboardLayout currentView={view} onViewChange={setView} onOpenNewGammaModal={() => setView('generate-ai')}>
        {view === 'dashboard' && (
          <PresentationList
            presentations={presentations}
            onSelect={(p) => {
              setCurrentPresentation(p)
              setView('presentation')
              setCurrentSlideIndex(0)
            }}
            onNew={() => {
              setCurrentPresentation(null)
              setView('generate-ai')
            }}
            onOpenNewGammaModal={() => setIsNewGammaModalOpen(true)}
            onOpenImportModal={() => setIsImportModalOpen(true)}
          />
        )}
        {view === 'analytics' && <AnalyticsView />}
        {view === 'images' && <AIImagesView />}
        {view === 'sites' && <SitesView />}
        {view === 'settings' && <SettingsView />}
        {view === 'templates' && <TemplatesView />}
        {view === 'themes' && <ThemesView onEditTheme={() => setView('theme-editor')} />}
        {view === 'shared' && <SharedView />}
        {view === 'fonts' && <FontsView />}
        {view === 'trash' && <TrashView />}
        {view === 'marketplace' && <MarketplaceView />}
        <SubscriptionModal isOpen={isSubscriptionModalOpen} onClose={() => setIsSubscriptionModalOpen(false)} />
        <AccountSettingsModal isOpen={isAccountSettingsModalOpen} onClose={() => setIsAccountSettingsModalOpen(false)} />
        <ImportFileModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={(file) => {
            setIsImportModalOpen(false)
            handleGenerate(`Analyze and present the contents of: ${file}`, 'creative', 8)
          }}
        />
        <NewGammaModal
          isOpen={isNewGammaModalOpen}
          onClose={() => setIsNewGammaModalOpen(false)}
          onSelect={() => {
            setIsNewGammaModalOpen(false)
            setView('create-ai')
          }}
        />
      </DashboardLayout>
    )
  }

  const renderPresentationView = () => {
    if (!currentPresentation) return null

    if (isGenerating) {
      return <GeneratingState />
    }

    return (
      <div key={currentPresentation.id} className="h-screen flex flex-col bg-slate-50 overflow-hidden">
        {/* Editor Topbar */}
        <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setView('dashboard')} className="rounded-full hover:bg-slate-100">
              <ArrowLeft weight="bold" className="w-5 h-5 text-slate-600" />
            </Button>
            <div className="h-4 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-2 group cursor-pointer">
              <span className="font-black text-slate-800 tracking-tight">{currentPresentation.title}</span>
              <CaretRight weight="bold" className="w-3 h-3 text-slate-300 group-hover:text-slate-500" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 mr-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
              <Sparkle weight="fill" className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-black text-slate-700">397 credits</span>
            </div>

            <Button variant="ghost" className="h-9 px-3 rounded-lg text-slate-600 font-bold gap-2 hover:bg-slate-50" onClick={() => setShowVisualEditor(!showVisualEditor)}>
              <Sparkle weight="bold" className="w-4 h-4" />
              Theme
            </Button>

            <Button
              variant="ghost"
              className="h-9 px-3 rounded-lg text-slate-600 font-bold gap-2 hover:bg-slate-50"
              onClick={() => {
                const blob = new Blob([JSON.stringify(currentPresentation, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${currentPresentation.title.replace(/\s+/g, '_')}.json`
                a.click()
              }}
            >
              <DownloadSimple weight="bold" className="w-4 h-4" />
              Export
            </Button>

            <Button variant="outline" className="h-9 px-4 rounded-lg border-slate-200 text-slate-700 font-bold gap-2 hover:bg-slate-50" onClick={() => setIsAccountSettingsModalOpen(true)}>
              <Sparkle weight="fill" className="w-4 h-4 text-indigo-600" />
              Agent
              <CaretDown weight="bold" className="w-3 h-3 text-slate-400" />
            </Button>

            <Button variant="ghost" className="h-9 px-3 rounded-lg text-slate-600 font-bold gap-2 hover:bg-slate-50" onClick={() => setShowSlideEditor(prev => !prev)}>
              <Pencil weight="bold" className="w-4 h-4" />
              Edit
            </Button>

            <Button className="bg-blue-600 hover:bg-blue-700 h-9 gap-2 rounded-lg font-black shadow-lg shadow-blue-100 relative group" onClick={() => setIsPreviewMode(true)}>
              <Play weight="fill" className="w-4 h-4" />
              Present
              {useShortcutHintsEnabled() && (
                <kbd className="absolute -top-2 -right-2 bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  P
                </kbd>
              )}
            </Button>

            <Button variant="ghost" className="h-9 px-3 rounded-lg text-slate-600 font-bold gap-2 hover:bg-slate-50" onClick={() => setIsSubscriptionModalOpen(true)}>
              <Plus weight="bold" className="w-4 h-4" />
              Upgrade
            </Button>

            <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-white shadow-md flex items-center justify-center text-[10px] text-white font-black overflow-hidden ml-2">
              HG
            </div>
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden relative">
          <SlideOutline
            slides={currentPresentation.slides}
            currentSlideIndex={currentSlideIndex}
            onSelectSlide={setCurrentSlideIndex}
            style={currentPresentation.style}
          />

          {/* Main Stage */}
          <div className="flex-1 p-20 overflow-y-auto flex items-center justify-center relative bg-white">
            <div
              className={cn(
                "transition-all duration-500 shadow-2xl relative group rounded-2xl overflow-hidden border border-slate-50",
                viewport === 'desktop' ? "w-full max-w-6xl aspect-[16/9]" : "w-[375px] h-[667px]"
              )}
            >
              <SlidePreview slide={currentPresentation.slides[currentSlideIndex]} style={currentPresentation.style} isActive />
            </div>

            {/* Bottom Left Slide Navigator */}
            <div className="absolute bottom-8 left-8 flex items-end gap-3 z-40">
              <div className="bg-white/80 backdrop-blur-md border border-slate-100 p-1.5 rounded-2xl shadow-2xl flex items-center gap-1.5 overflow-hidden">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <Button variant="secondary" size="icon" className="h-6 w-6 rounded-md bg-white shadow-sm shadow-slate-200">
                    <Cards weight="bold" className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md text-slate-400">
                    <List weight="bold" className="w-3 h-3" />
                  </Button>
                </div>

                <div className="flex items-center gap-1.5 px-1.5">
                  <Button
                    variant="outline"
                    className="h-8 px-3 rounded-xl border-slate-100 gap-2 text-slate-600 font-bold text-[10px] bg-white hover:bg-slate-50"
                    onClick={async () => {
                      if (!currentPresentation) return
                      setIsGenerating(true)
                      try {
                        const newSlidesPres = await generatePresentation(`Add one more slide for: ${currentPresentation.title}`, currentPresentation.style, 1)
                        const updatedPres = {
                          ...currentPresentation,
                          slides: [...currentPresentation.slides, ...newSlidesPres.slides],
                          updatedAt: Date.now(),
                        }
                        setCurrentPresentation(updatedPres)
                        setCurrentSlideIndex(updatedPres.slides.length - 1)
                      } finally {
                        setIsGenerating(false)
                      }
                    }}
                  >
                    <Plus weight="bold" className="w-3 h-3" />
                    New
                    <CaretDown weight="bold" className="w-2 h-2 text-slate-300" />
                  </Button>
                </div>

                <div className="flex gap-1.5 pr-1.5 overflow-x-auto max-w-[400px] no-scrollbar">
                  {currentPresentation.slides.map((s, i) => (
                    <div
                      key={s.id}
                      className={cn(
                        "w-16 h-10 rounded-lg border-2 transition-all cursor-pointer overflow-hidden bg-slate-50 flex-shrink-0 relative",
                        currentSlideIndex === i ? "border-blue-500 shadow-md scale-105" : "border-slate-100 hover:border-blue-200"
                      )}
                      onClick={() => setCurrentSlideIndex(i)}
                    >
                      <div className="scale-[0.1] origin-top-left w-[1000%] h-[1000%] pointer-events-none">
                        <SlidePreview slide={s} style={currentPresentation.style} slideNumber={i + 1} />
                      </div>
                      <div
                        className={cn(
                          "absolute inset-0 flex items-center justify-center transition-opacity",
                          currentSlideIndex === i ? "bg-blue-600/5 opacity-100" : "bg-black/5 opacity-0 hover:opacity-100"
                        )}
                      >
                        <span className="text-[8px] font-black text-white bg-black/40 px-1 rounded-sm">{i + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Top Nav (Center) */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/80 backdrop-blur-md border border-slate-100 p-1 rounded-xl shadow-xl z-40">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-50">
                <DotsThree weight="bold" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-50" onClick={() => alert('Undo!')}>
                <ArrowCounterClockwise weight="bold" />
              </Button>
              <div className="h-4 w-[1px] bg-slate-100" />
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-50" onClick={() => setIsSearchVisible(true)}>
                <MagnifyingGlass weight="bold" />
              </Button>
            </div>
          </div>

          {showSlideEditor && (
            <aside className="w-96 bg-white border-l border-slate-100 flex flex-col z-40">
              <SlideEditor
                slide={currentPresentation.slides[currentSlideIndex]}
                onSlideChange={handleSlideChange}
              />
            </aside>
          )}

          <CommentsSidebar
            isOpen={isCommentsOpen}
            onClose={() => setIsCommentsOpen(false)}
            comments={currentPresentation.slides[currentSlideIndex].comments || []}
            onAddComment={(text: string) => {
              if (!currentPresentation) return
              const updatedPres = {
                ...currentPresentation,
                slides: currentPresentation.slides.map((s, idx) =>
                  idx === currentSlideIndex
                    ? {
                      ...s,
                      comments: [
                        ...(s.comments || []),
                        {
                          id: Math.random().toString(36).substr(2, 9),
                          author: 'Hossam Galal',
                          text,
                          timestamp: Date.now(),
                        },
                      ],
                    }
                    : s
                ),
              }
              setCurrentPresentation(updatedPres)
            }}
            onResolve={(id: string) => {
              if (!currentPresentation) return
              const updatedPres = {
                ...currentPresentation,
                slides: currentPresentation.slides.map((s, idx) =>
                  idx === currentSlideIndex
                    ? {
                      ...s,
                      comments: (s.comments || []).map((c) => (c.id === id ? { ...c, resolved: true } : c)),
                    }
                    : s
                ),
              }
              setCurrentPresentation(updatedPres)
            }}
            onDelete={(id: string) => {
              if (!currentPresentation) return
              const updatedPres = {
                ...currentPresentation,
                slides: currentPresentation.slides.map((s, idx) =>
                  idx === currentSlideIndex ? { ...s, comments: (s.comments || []).filter((c) => c.id !== id) } : s
                ),
              }
              setCurrentPresentation(updatedPres)
            }}
          />

          {/* Tool Overlays */}
          <AnimatePresence>
            {showLayoutPicker && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute right-16 top-20 bg-white rounded-2xl shadow-xl border border-slate-100 p-6 w-80 z-50"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-900">Choose Layout</h3>
                  <button onClick={() => setShowLayoutPicker(false)} className="text-slate-400 hover:text-slate-600">
                    <X weight="bold" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Title', id: 'title' },
                    { label: 'Bullets', id: 'bullets' },
                    { label: 'Two Column', id: 'two-column' },
                    { label: 'Quote', id: 'quote' },
                    { label: 'Image', id: 'image-text' },
                    { label: 'Timeline', id: 'timeline' },
                    { label: 'Stats', id: 'stats-grid' },
                  ].map((layout) => (
                    <button
                      key={layout.id}
                      onClick={() => {
                        if (!currentPresentation) return
                        const updated = {
                          ...currentPresentation,
                          slides: currentPresentation.slides.map((s, i) => (i === currentSlideIndex ? { ...s, layout: layout.id as any } : s)),
                        }
                        setCurrentPresentation(updated)
                        setShowLayoutPicker(false)
                      }}
                      className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-xs font-bold text-slate-600 transition-all text-left"
                    >
                      {layout.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {showVisualEditor && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute right-16 top-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-6 w-72 z-50"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-900">Visual Settings</h3>
                  <button onClick={() => setShowVisualEditor(false)} className="text-slate-400 hover:text-slate-600">
                    <X weight="bold" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Theme</label>
                    <select
                      className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold"
                      value={currentPresentation.style}
                      onChange={(e) => {
                        setCurrentPresentation({ ...currentPresentation, style: e.target.value as any })
                      }}
                    >
                      <option value="minimal">Minimal</option>
                      <option value="modern">Modern</option>
                      <option value="glass">Glassmorphism</option>
                      <option value="creative">Creative</option>
                      <option value="dark">Dark Mode</option>
                      <option value="neon">Neon Tech</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Accent Color</label>
                    <div className="flex gap-2">
                      {['bg-blue-500', 'bg-purple-500', 'bg-rose-500', 'bg-emerald-500'].map((bg) => (
                        <button key={bg} className={`w-8 h-8 rounded-full ${bg} ring-2 ring-white shadow-md hover:scale-110 transition-transform`} />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTool === 'text' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-12 left-12 -translate-x-12 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-4"
              >
                <span className="font-bold text-sm">Text Editing Mode Active</span>
                <button onClick={() => setActiveTool(null)} className="bg-white/20 hover:bg-white/30 p-1.5 rounded-full">
                  <X weight="bold" className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Fullscreen Preview */}
        <AnimatePresence>
          {isPreviewMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900 z-50 flex flex-col"
            >
              <div className="p-4 flex justify-end">
                <Button
                  variant="secondary"
                  className="rounded-full bg-white/10 text-white hover:bg-white/20"
                  onClick={() => setIsPreviewMode(false)}
                >
                  <X weight="bold" className="mr-2" />
                  Exit Preview
                </Button>
              </div>
              <div className="flex-1 flex items-center justify-center p-12">
                <div className="aspect-[16/9] w-full max-w-7xl relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlideIndex}
                      initial={{ opacity: 0, x: 200 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -200 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0"
                    >
                      <SlidePreview slide={currentPresentation.slides[currentSlideIndex]} style={currentPresentation.style} isActive />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              <div className="p-6 flex items-center justify-center gap-4 bg-black/20">
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                  onClick={prevSlide}
                  disabled={currentSlideIndex === 0}
                >
                  <CaretLeft weight="bold" />
                </Button>
                <span className="text-white font-bold text-sm">
                  {currentSlideIndex + 1} / {currentPresentation.slides.length}
                </span>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                  onClick={nextSlide}
                  disabled={currentSlideIndex >= currentPresentation.slides.length - 1}
                >
                  <CaretRight weight="bold" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="h-screen flex flex-col"
        >
          {isGenerating && view === 'presentation' ? (
            <GeneratingState key="generating" />
          ) : (
            renderView()
          )}
        </motion.div>
      </AnimatePresence>
      <SearchModal isOpen={isSearchVisible} onClose={() => setIsSearchVisible(false)} />
    </div>
  )
}
