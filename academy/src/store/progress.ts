import { useSyncExternalStore } from 'react'

export interface Attempt {
  id: string // problem/step id
  module: string
  correct: boolean
  hintsUsed: number
  tags: string[]
  mode: 'guided' | 'independent' | 'exam' | 'prereq' | 'check'
  at: number
}

export interface ProgressState {
  attempts: Attempt[]
  completedSteps: Record<string, true>
  examSessions: { examId: string; startedAt: number; finishedAt?: number; score?: number; max?: number }[]
}

const KEY = 'ci-academy-progress-v1'
const empty: ProgressState = { attempts: [], completedSteps: {}, examSessions: [] }

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...empty, ...JSON.parse(raw) } : empty
  } catch {
    return empty
  }
}

let state: ProgressState = load()
const listeners = new Set<() => void>()

function commit(next: ProgressState) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage unavailable: keep in memory */
  }
  listeners.forEach((l) => l())
}

export const progress = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
  record(a: Omit<Attempt, 'at'>) {
    commit({ ...state, attempts: [...state.attempts, { ...a, at: Date.now() }] })
  },
  complete(stepId: string) {
    if (state.completedSteps[stepId]) return
    commit({ ...state, completedSteps: { ...state.completedSteps, [stepId]: true } })
  },
  startExam(examId: string) {
    commit({ ...state, examSessions: [...state.examSessions, { examId, startedAt: Date.now() }] })
  },
  finishExam(examId: string, score: number, max: number) {
    const sessions = [...state.examSessions]
    for (let i = sessions.length - 1; i >= 0; i--) {
      if (sessions[i].examId === examId && !sessions[i].finishedAt) {
        sessions[i] = { ...sessions[i], finishedAt: Date.now(), score, max }
        break
      }
    }
    commit({ ...state, examSessions: sessions })
  },
  reset() {
    commit(empty)
  },
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(progress.subscribe, progress.get, progress.get)
}

/** Weakness analysis: per prerequisite tag, wrong vs right counts. */
export function tagStats(s: ProgressState): Record<string, { right: number; wrong: number; hinted: number }> {
  const out: Record<string, { right: number; wrong: number; hinted: number }> = {}
  for (const a of s.attempts) {
    for (const t of a.tags) {
      out[t] ??= { right: 0, wrong: 0, hinted: 0 }
      if (a.correct) out[t].right++
      else out[t].wrong++
      if (a.hintsUsed > 0) out[t].hinted++
    }
  }
  return out
}

/** Recommend the next thing to study: the tag with the worst wrong ratio, else the next incomplete step. */
export function recommend(s: ProgressState): { kind: 'prereq' | 'step'; id: string; reason: string } | null {
  const stats = tagStats(s)
  let worst: { id: string; ratio: number; n: number } | null = null
  for (const [id, v] of Object.entries(stats)) {
    const n = v.right + v.wrong
    const ratio = v.wrong / Math.max(1, n)
    if (n >= 2 && ratio >= 0.4 && (!worst || ratio > worst.ratio)) worst = { id, ratio, n }
  }
  if (worst) return { kind: 'prereq', id: worst.id, reason: `${Math.round(worst.ratio * 100)}% of ${worst.n} attempts tagged with this prerequisite were wrong.` }
  return null
}
