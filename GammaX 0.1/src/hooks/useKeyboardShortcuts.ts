import { useEffect, useCallback } from 'react'
import { loadProviderSettings } from './settings'

export type ShortcutCategory = 'essential' | 'additional'

export interface KeyboardShortcut {
  key: string
  label: string
  action: () => void
  category: ShortcutCategory
  condition?: () => boolean
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return

      const isTyping =
        (e.target as HTMLElement)?.tagName?.toLowerCase() === 'input' ||
        (e.target as HTMLElement)?.tagName?.toLowerCase() === 'textarea' ||
        (e.target as HTMLElement)?.isContentEditable

      for (const shortcut of shortcuts) {
        // Check if condition is met
        if (shortcut.condition && !shortcut.condition()) continue

        // Check modifiers
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey
        const altMatch = shortcut.alt ? e.altKey : !e.altKey
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey

        // Check key
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()

        if (ctrlMatch && altMatch && shiftMatch && keyMatch) {
          // Skip non-essential shortcuts when typing (unless Ctrl/Cmd is pressed)
          if (isTyping && !shortcut.ctrl && shortcut.category === 'additional') {
            continue
          }

          e.preventDefault()
          shortcut.action()
          break
        }
      }
    },
    [shortcuts, enabled]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

export function formatShortcut(key: string, ctrl?: boolean, alt?: boolean, shift?: boolean): string {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const ctrlKey = isMac ? '⌘' : 'Ctrl'
  
  const parts: string[] = []
  if (ctrl) parts.push(ctrlKey)
  if (alt) parts.push('Alt')
  if (shift) parts.push('Shift')
  parts.push(key.toUpperCase())
  
  return parts.join('+')
}

export function useShortcutHintsEnabled(): boolean {
  const settings = loadProviderSettings()
  return settings.showShortcutHints !== false // default true
}
