import {
  DotsThree,
  Heart,
  Clock,
  User,
  GridFour,
  List,
  PlusSquare,
  Plus,
  CaretDown,
  DownloadSimple
} from '@phosphor-icons/react'
import { ImportDropdown } from './ImportDropdown'
import { Presentation } from '@/lib/types'
import { formatDistanceToNow } from '@/lib/date-utils'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface PresentationListProps {
  presentations: Presentation[]
  onSelect: (presentation: Presentation) => void
  onNew: () => void
  onOpenNewGammaModal: () => void
  onOpenImportModal?: () => void
}

export function PresentationList({ presentations, onSelect, onNew, onOpenNewGammaModal, onOpenImportModal }: PresentationListProps) {
  const [activeTab, setActiveTab] = useState('all')
  const [isImportOpen, setIsImportOpen] = useState(false)

  const tabs = [
    { id: 'all', label: 'All', icon: null },
    { id: 'recent', label: 'Recently viewed', icon: Clock },
    { id: 'created', label: 'Created by you', icon: User },
    { id: 'favorites', label: 'Favorites', icon: Heart },
  ]

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      {/* Action Buttons */}
      <div className="flex flex-col gap-6 mb-12">
        <div className="flex items-center gap-3">
          <Button
            onClick={onNew}
            className="bg-blue-600 hover:bg-blue-700 h-10 px-6 rounded-xl font-black gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-all w-fit"
          >
            <PlusSquare weight="bold" className="w-5 h-5" />
            Create new AI
          </Button>

          <Button
            onClick={onOpenNewGammaModal}
            variant="outline"
            className="bg-white border-slate-200 h-10 px-6 rounded-xl font-black gap-2 text-slate-700 hover:bg-slate-50 active:scale-95 transition-all w-fit"
          >
            <Plus weight="bold" className="w-5 h-5" />
            New gamma
          </Button>

          <div className="relative">
            <Button
              onClick={() => setIsImportOpen(!isImportOpen)}
              variant="outline"
              className="bg-blue-50/50 border-blue-100 h-10 px-6 rounded-xl font-black gap-2 text-blue-600 hover:bg-blue-100 transition-all w-fit"
            >
              <DownloadSimple weight="bold" className="w-5 h-5 flex-shrink-0" />
              Import
              <CaretDown weight="bold" className="w-3 h-3 ml-1" />
            </Button>
            <ImportDropdown
              isOpen={isImportOpen}
              onClose={() => setIsImportOpen(false)}
              onSelect={(id) => {
                if (id === 'ai') {
                  onOpenImportModal?.()
                }
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex bg-slate-100/50 p-1 rounded-xl border border-slate-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab.icon && <tab.icon className="w-4 h-4" />}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center bg-slate-100/50 p-1 rounded-xl border border-slate-100">
          <button className="p-2 rounded-lg bg-white shadow-sm text-blue-600">
            <GridFour weight="bold" className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600">
            <List weight="bold" className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {presentations.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group cursor-pointer"
          >
            <Card className="aspect-[1.4/1] bg-slate-100/50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 rounded-[2rem] hover:border-blue-300 transition-colors">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-slate-200 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-20">Γ</div>
              </div>
              <p className="text-sm font-bold text-slate-400">Nothing here yet</p>
              <Button variant="outline" onClick={onNew} className="rounded-full border-slate-200">Start creating</Button>
            </Card>
          </motion.div>
        )}

        {presentations.map((pres, idx) => (
          <motion.div
            key={pres.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="group cursor-pointer"
            onClick={() => onSelect(pres)}
          >
            <Card className="aspect-[1.4/1] bg-white border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all rounded-[2rem] overflow-hidden flex flex-col p-6">
              <div className="flex-1 bg-slate-50 rounded-2xl relative overflow-hidden flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                <div className="text-8xl font-black text-white mix-blend-overlay opacity-30 select-none">Γ</div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="secondary" className="h-8 w-8 p-0 rounded-full bg-white/80 backdrop-blur pointer-events-none">
                    <DotsThree weight="bold" className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="mt-5 space-y-1 px-1">
                <h3 className="font-black text-slate-900 line-clamp-1 text-lg tracking-tight">{pres.title}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                      <User weight="fill" className="w-3 h-3 text-blue-600" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">Created by you</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                    {formatDistanceToNow(pres.createdAt)} ago
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
