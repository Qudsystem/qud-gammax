import { useEffect, useState } from 'react'
import {
  Users,
  UserPlus,
  Circle,
  Gear,
  Key,
  Camera,
  Globe,
  Plus,
  Sparkle,
  Shuffle,
} from '@phosphor-icons/react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Card } from './ui/card'
import { loadProviderSettings, saveProviderSettings } from '@/lib/settings'
import type { ModelProvider } from '@/lib/types'

export function SettingsView() {
  const [activeTab, setActiveTab] = useState('overview')
  const initialProviderSettings = loadProviderSettings()
  const [provider, setProvider] = useState<ModelProvider>(initialProviderSettings.provider || 'auto')
  const [geminiKey, setGeminiKey] = useState(initialProviderSettings.geminiApiKey || '')
  const [claudeKey, setClaudeKey] = useState(initialProviderSettings.claudeApiKey || '')
  const [deepseekKey, setDeepseekKey] = useState(initialProviderSettings.deepseekApiKey || '')
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState(initialProviderSettings.ollamaBaseUrl || 'http://localhost:11434')
  const [ollamaModel, setOllamaModel] = useState(initialProviderSettings.ollamaModel || 'llama3.1')
  const [ollamaModels, setOllamaModels] = useState<string[]>([])
  const [nvidiaKey, setNvidiaKey] = useState(initialProviderSettings.nvidiaApiKey || '')
  const [nvidiaModel, setNvidiaModel] = useState(initialProviderSettings.nvidiaModel || '')
  const [timeoutMs, setTimeoutMs] = useState(initialProviderSettings.timeoutMs ?? 20000)
  const [showShortcutHints, setShowShortcutHints] = useState(initialProviderSettings.showShortcutHints !== false)

  // محاولة جلب قائمة الموديلات من Ollama المحلي لعرضها في القائمة
  useEffect(() => {
    const base = (ollamaBaseUrl || 'http://localhost:11434').replace(/\/$/, '')
    if (!base) return
    let cancelled = false
    fetch(`${base}/api/tags`)
      .then((res) => {
        if (!res.ok) throw new Error(`Ollama tags error: ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        const models = Array.isArray(data.models) ? data.models.map((m: any) => m.name as string) : []
        if (models.length > 0) {
          setOllamaModels(models)
          if (!ollamaModel && models[0]) {
            setOllamaModel(models[0])
          }
        }
      })
      .catch(() => {
        // تجاهل الخطأ بهدوء، سيبقى الحقل يدوياً
      })
    return () => {
      cancelled = true
    }
  }, [ollamaBaseUrl])

  const handleSaveProviders = () => {
    saveProviderSettings({
      provider,
      geminiApiKey: geminiKey || undefined,
      claudeApiKey: claudeKey || undefined,
      deepseekApiKey: deepseekKey || undefined,
      ollamaBaseUrl: ollamaBaseUrl || undefined,
      ollamaModel: ollamaModel || undefined,
      nvidiaApiKey: nvidiaKey || undefined,
      nvidiaModel: nvidiaModel || undefined,
      timeoutMs,
      showShortcutHints,
    })
    alert('Provider settings saved locally for this browser.')
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings & members</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-transparent border-b border-slate-100 rounded-none w-full justify-start h-auto p-0 mb-8 gap-8">
          <TabsTrigger value="overview" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none py-2 px-0 text-sm font-bold text-slate-500 data-[state=active]:text-blue-600 transition-all gap-2">
            <Gear weight="bold" /> Overview
          </TabsTrigger>
          <TabsTrigger value="members" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none py-2 px-0 text-sm font-bold text-slate-500 data-[state=active]:text-blue-600 transition-all gap-2">
            <Users weight="bold" /> Members
          </TabsTrigger>
          <TabsTrigger value="workspace" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none py-2 px-0 text-sm font-bold text-slate-500 data-[state=active]:text-blue-600 transition-all gap-2">
            <Globe weight="bold" /> Workspace defaults
          </TabsTrigger>
          <TabsTrigger value="api" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none py-2 px-0 text-sm font-bold text-slate-500 data-[state=active]:text-blue-600 transition-all gap-2">
            <Key weight="bold" /> API keys
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <div className="space-y-12">
            <div>
              <h2 className="text-lg font-black text-slate-900 mb-6">Basic info</h2>
              <div className="space-y-8">
                <div className="flex items-start gap-12">
                  <div className="space-y-2 flex-shrink-0">
                    <label className="text-[11px] font-black text-slate-400 capitalize">Workspace logo</label>
                    <p className="text-xs text-slate-400 max-w-[200px]">An image to represent your workspace</p>
                  </div>
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center text-4xl font-bold text-emerald-600 overflow-hidden shadow-sm">
                      HW
                    </div>
                    <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md border border-slate-100 text-slate-500 hover:text-blue-600 transition-colors">
                      <Camera weight="bold" />
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-12">
                  <div className="space-y-2 flex-shrink-0">
                    <label className="text-[11px] font-black text-slate-400 capitalize">Workspace name</label>
                    <p className="text-xs text-slate-400 max-w-[200px]">e.g. your team or company name</p>
                  </div>
                  <Input
                    defaultValue="Hussam Galal's Workspace"
                    className="max-w-md h-12 bg-white border-slate-200 rounded-xl font-bold px-4"
                  />
                </div>

                <div className="flex items-start gap-12">
                  <div className="space-y-2 flex-shrink-0">
                    <label className="text-[11px] font-black text-slate-400 capitalize">Keyboard shortcuts</label>
                    <p className="text-xs text-slate-400 max-w-[200px]">Show shortcut hints on buttons and controls</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowShortcutHints(!showShortcutHints)}
                      className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${showShortcutHints ? 'bg-blue-600' : 'bg-slate-200'}`}
                    >
                      <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${showShortcutHints ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                    <span className="text-sm font-medium text-slate-600">
                      {showShortcutHints ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Card className="bg-gradient-to-r from-[#003B95] to-[#1C64F2] p-8 rounded-[2rem] border-none shadow-xl shadow-blue-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none group-hover:bg-white/20 transition-all duration-700" />
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-white mb-2">Upgrade your workspace</h3>
                <p className="text-white/80 font-medium mb-6">Unlock unlimited AI creations, remove Gamma branding, and more</p>
                <Button className="bg-white text-blue-600 hover:bg-slate-50 rounded-xl px-6 h-12 font-black shadow-lg">
                  See plans
                </Button>
              </div>
              <div className="absolute top-1/2 right-12 -translate-y-1/2 scale-150 opacity-20 group-hover:scale-[1.7] group-hover:rotate-12 transition-all duration-700 text-white pointer-events-none">
                <Sparkle weight="fill" className="w-16 h-16" />
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members" className="mt-0">
          <div className="mb-10">
            <h2 className="text-lg font-black text-slate-900 mb-2">Manage members and invitations</h2>
            <div className="flex gap-4 mt-6">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold border border-blue-100 shadow-sm">
                <Users weight="fill" /> Active members (1)
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-bold transition-colors">
                <UserPlus weight="bold" /> Pending invitations (0)
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Join date</th>
                </tr>
              </thead>
              <tbody>
                <tr className="group hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">HG</div>
                      <div>
                        <div className="text-sm font-black text-slate-900">Hussam Galal (you)</div>
                        <div className="text-xs text-slate-400 font-medium">hussamgalal111@gmail.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">
                      Admin <Circle weight="fill" className="w-2 h-2" />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">Oct 15, 2024, 12:24 PM</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-12 flex flex-col items-center justify-center py-20 text-center">
            <div className="relative w-48 h-48 mb-6">
              <div className="absolute inset-0 bg-blue-50 rounded-[4rem] rotate-3 opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center text-7xl">
                🐻
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">It's a little quiet in here</h3>
            <p className="text-slate-500 max-w-sm font-medium mb-8">Invite your teammates to get the most out of Gamma. Collaborative presentations are 3x more effective.</p>
            <Button className="bg-blue-600 hover:bg-blue-700 rounded-2xl h-14 px-8 font-black gap-2 shadow-lg shadow-blue-200">
              <Plus weight="bold" /> Invite members
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="workspace" className="mt-0">
          <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
            Coming soon: Workspace defaults
          </div>
        </TabsContent>

        <TabsContent value="api" className="mt-0">
          <div className="space-y-10 max-w-3xl">
            <div>
              <h2 className="text-lg font-black text-slate-900 mb-2">Model provider</h2>
              <p className="text-sm text-slate-500 mb-4">
                Choose which AI provider to use when generating presentations.{' '}
                <span className="font-bold">Auto</span> will try the best available option.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'auto', label: 'Auto' },
                  { id: 'gemini', label: 'Gemini' },
                  { id: 'claude', label: 'Claude' },
                  { id: 'deepseek', label: 'DeepSeek' },
                  { id: 'ollama', label: 'Ollama (local)' },
                  { id: 'nvidia', label: 'NVIDIA' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setProvider(opt.id as ModelProvider)}
                    className={`flex items-center justify-center px-4 py-2 rounded-xl border text-sm font-bold transition-all ${provider === opt.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/40'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900">Gemini (Google)</h3>
                <Input
                  type="password"
                  placeholder="VITE_GEMINI_API_KEY or custom key"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="h-10 bg-white border-slate-200 rounded-xl text-sm"
                />
                <p className="text-xs text-slate-400">
                  If empty, the app will still try to use <code>VITE_GEMINI_API_KEY</code> from the environment.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900">Claude (Anthropic)</h3>
                <Input
                  type="password"
                  placeholder="Claude API key"
                  value={claudeKey}
                  onChange={(e) => setClaudeKey(e.target.value)}
                  className="h-10 bg-white border-slate-200 rounded-xl text-sm"
                />
                <p className="text-xs text-slate-400">
                  Stored only in this browser&apos;s local storage. Requests are still sent from the frontend in this version.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900">DeepSeek</h3>
                <Input
                  type="password"
                  placeholder="DeepSeek API key"
                  value={deepseekKey}
                  onChange={(e) => setDeepseekKey(e.target.value)}
                  className="h-10 bg-white border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  Ollama (local)
                  {ollamaModels.length > 0 && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full">
                      {ollamaModels.length} models found
                    </span>
                  )}
                </h3>
                <Input
                  type="text"
                  placeholder="http://localhost:11434"
                  value={ollamaBaseUrl}
                  onChange={(e) => setOllamaBaseUrl(e.target.value)}
                  className="h-10 bg-white border-slate-200 rounded-xl text-sm"
                />
                <div className="flex gap-2">
                  {ollamaModels.length > 0 ? (
                    <select
                      className="flex-1 h-10 bg-white border-slate-200 rounded-xl text-sm px-3 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={ollamaModel}
                      onChange={(e) => setOllamaModel(e.target.value)}
                    >
                      {ollamaModels.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      type="text"
                      placeholder="Model name (e.g. llama3.1)"
                      value={ollamaModel}
                      onChange={(e) => setOllamaModel(e.target.value)}
                      className="flex-1 h-10 bg-white border-slate-200 rounded-xl text-sm"
                    />
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-xl border-slate-200 hover:bg-slate-50"
                    onClick={() => {
                      // إعادة محاولة الجلب يدوياً
                      const base = (ollamaBaseUrl || 'http://localhost:11434').replace(/\/$/, '')
                      fetch(`${base}/api/tags`)
                        .then(res => res.json())
                        .then(data => {
                          const models = Array.isArray(data.models) ? data.models.map((m: any) => m.name as string) : []
                          setOllamaModels(models)
                        })
                        .catch(() => alert('Failed to connect to Ollama. Make sure it is running.'))
                    }}
                  >
                    <Shuffle weight="bold" className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-slate-400">
                  If Ollama is running locally, models will appear here automatically. Otherwise, type a model name manually.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900">NVIDIA</h3>
                <Input
                  type="password"
                  placeholder="NVIDIA API key"
                  value={nvidiaKey}
                  onChange={(e) => setNvidiaKey(e.target.value)}
                  className="h-10 bg-white border-slate-200 rounded-xl text-sm"
                />
                <Input
                  type="text"
                  placeholder="Model ID (e.g. moonshotai/kimi-k2.5)"
                  value={nvidiaModel}
                  onChange={(e) => setNvidiaModel(e.target.value)}
                  className="h-10 bg-white border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900">Timeout</h3>
                <Input
                  type="number"
                  min={5000}
                  max={60000}
                  value={timeoutMs}
                  onChange={(e) => setTimeoutMs(Number(e.target.value) || 0)}
                  className="h-10 bg-white border-slate-200 rounded-xl text-sm"
                />
                <p className="text-xs text-slate-400">Maximum time (ms) to wait for a provider before falling back.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button onClick={handleSaveProviders} className="rounded-xl h-10 px-6 font-black">
                Save provider settings
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
