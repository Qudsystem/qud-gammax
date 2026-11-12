import { ModelProvider, ProviderSettings } from './types'

const SETTINGS_KEY = 'gammax_provider_settings_v1'
let systemThemeMedia: MediaQueryList | null = null
let systemThemeListener: ((ev: MediaQueryListEvent) => any) | null = null

export function applyTheme(mode: 'light' | 'dark' | 'system') {
  if (typeof document === 'undefined') return
  const root = document.documentElement

  const setDark = (enabled: boolean) => {
    root.classList.toggle('dark', enabled)
  }

  // Clean previous system listener
  if (systemThemeMedia && systemThemeListener) {
    try {
      systemThemeMedia.removeEventListener('change', systemThemeListener)
    } catch { }
    systemThemeMedia = null
    systemThemeListener = null
  }

  if (mode === 'dark') {
    setDark(true)
    return
  }
  if (mode === 'light') {
    setDark(false)
    return
  }
  // system
  systemThemeMedia = window.matchMedia('(prefers-color-scheme: dark)')
  const applyFromSystem = () => setDark(!!systemThemeMedia?.matches)
  systemThemeListener = () => applyFromSystem()
  applyFromSystem()
  try {
    systemThemeMedia.addEventListener('change', systemThemeListener)
  } catch { }
}

export function loadProviderSettings(): ProviderSettings {
  if (typeof window === 'undefined') {
    // بيئة غير المتصفح (مثلاً أثناء البناء)
    return {
      provider: 'auto',
      // 6 ثواني كقيمة افتراضية متزنة بين السرعة
      // ومنح كل مزوّد فرصة منطقية للرد
      timeoutMs: 6000,
      themeMode: 'system',
    }
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY)
    if (!raw) {
      return {
        provider: 'auto',
        timeoutMs: 6000,
        themeMode: 'system',
      }
    }
    const parsed = JSON.parse(raw) as ProviderSettings
    const settings: ProviderSettings = {
      provider: parsed.provider || 'auto',
      geminiApiKey: parsed.geminiApiKey,
      claudeApiKey: parsed.claudeApiKey,
      deepseekApiKey: parsed.deepseekApiKey,
      ollamaBaseUrl: parsed.ollamaBaseUrl || 'http://localhost:11434',
      ollamaModel: parsed.ollamaModel || 'llama3.1',
      nvidiaApiKey: parsed.nvidiaApiKey,
      nvidiaModel: parsed.nvidiaModel,
      timeoutMs: parsed.timeoutMs ?? 6000,
      showShortcutHints: parsed.showShortcutHints !== false,
      themeMode: parsed.themeMode || 'system',
      showShortcutHints: parsed.showShortcutHints !== false, // default true
      // Apply theme immediately on load
      applyTheme(settings.themeMode || 'system')
      return settings
    }
  } catch {
    return {
      provider: 'auto',
      themeMode: 'system',
      timeoutMs: 20000,
    }
  }
}

export function saveProviderSettings(settings: ProviderSettings) {
  if (typeof window === 'undefined') return
  const merged: ProviderSettings = {
    provider: settings.provider || 'auto',
    geminiApiKey: settings.geminiApiKey,
    claudeApiKey: settings.claudeApiKey,
    deepseekApiKey: settings.deepseekApiKey,
    ollamaBaseUrl: settings.ollamaBaseUrl || 'http://localhost:11434',
    ollamaModel: settings.ollamaModel || 'llama3.1',
    nvidiaApiKey: settings.nvidiaApiKey,
    nvidiaModel: settings.nvidiaModel,
    showShortcutHints: settings.showShortcutHints !== false,
    themeMode: settings.themeMode || 'system',
    timeoutMs: settings.timeoutMs ?? 6000,
    showShortcutHints: settings.showShortcutHints,
    applyTheme(merged.themeMode || 'system')
  }
