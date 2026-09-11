import type { SymbolDef } from '../lib/types'

/** Twelve pictures, in the order people reach for them most. */
export const SYMBOLS: SymbolDef[] = [
  { id: 'where', label: 'Where', icon: 'pin', word: 'where', kind: 'question' },
  { id: 'when', label: 'When', icon: 'clock', word: 'when', kind: 'question' },
  { id: 'howmuch', label: 'How much', icon: 'coin', word: 'how much', kind: 'question' },
  { id: 'help', label: 'Help', icon: 'hand', word: 'help', kind: 'question' },

  { id: 'toilet', label: 'Toilet', icon: 'toilet', word: 'toilet', kind: 'thing' },
  { id: 'doctor', label: 'Doctor', icon: 'stethoscope', word: 'doctor', kind: 'thing' },
  { id: 'money', label: 'Money', icon: 'wallet', word: 'money', kind: 'thing' },
  { id: 'papers', label: 'Papers', icon: 'papers', word: 'papers', kind: 'thing' },

  { id: 'yes', label: 'Yes', icon: 'check', word: 'yes', kind: 'answer' },
  { id: 'no', label: 'No', icon: 'close', word: 'no', kind: 'answer' },
  { id: 'again', label: 'Again', icon: 'repeat', word: 'please say it again', kind: 'action' },
  { id: 'wait', label: 'Wait', icon: 'pause', word: 'please wait a moment', kind: 'action' },
]

export function symbolById(id: string): SymbolDef | undefined {
  return SYMBOLS.find((s) => s.id === id)
}
