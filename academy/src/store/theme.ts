import { useSyncExternalStore } from 'react'

/**
 * Visual theme: accent hue (0–360) and colour mode. Stored separately from learning progress.
 * The tokens in styles.css derive every colour from --hue, following Fuwari's approach.
 */
export type Mode = 'auto' | 'light' | 'dark'
export interface ThemeState { hue: number; mode: Mode }

const KEY = 'ci-academy-theme-v1'
const defaults: ThemeState = { hue: 250, mode: 'auto' }

function load(): ThemeState {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults
  } catch {
    return defaults
  }
}

let state = load()
const listeners = new Set<() => void>()

function apply(s: ThemeState) {
  if (typeof document === 'undefined') return
  const el = document.documentElement
  el.style.setProperty('--hue', String(s.hue))
  if (s.mode === 'auto') el.removeAttribute('data-theme')
  else el.setAttribute('data-theme', s.mode)
}

function commit(next: ThemeState) {
  state = next
  apply(state)
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* in-memory only */ }
  listeners.forEach((l) => l())
}

export const theme = {
  get: () => state,
  subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l) },
  setHue: (hue: number) => commit({ ...state, hue: ((Math.round(hue) % 360) + 360) % 360 }),
  setMode: (mode: Mode) => commit({ ...state, mode }),
  cycleMode: () => commit({ ...state, mode: state.mode === 'auto' ? 'light' : state.mode === 'light' ? 'dark' : 'auto' }),
  init: () => apply(state),
}

export const huePresets: { name: string; hue: number }[] = [
  { name: 'Cyan', hue: 250 }, { name: 'Teal', hue: 200 }, { name: 'Green', hue: 150 }, { name: 'Amber', hue: 70 }, { name: 'Pink', hue: 345 }, { name: 'Violet', hue: 300 },
]

export function useTheme(): ThemeState {
  return useSyncExternalStore(theme.subscribe, theme.get, theme.get)
}
