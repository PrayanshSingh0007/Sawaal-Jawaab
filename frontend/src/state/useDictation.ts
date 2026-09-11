import { useCallback, useEffect, useRef, useState } from 'react'
import type { LanguageCode } from '../lib/types'
import { listen, listeningAvailable, meterMicrophone } from '../lib/speech'
import type { Listener } from '../lib/speech'

export type DictationProblem = 'denied' | 'unavailable' | 'nothing' | null

/** Dictation with a live level, and a plain-language reason when it can't run. */
export function useDictation(language: LanguageCode, onText: (text: string) => void) {
  const [recording, setRecording] = useState(false)
  const [partial, setPartial] = useState('')
  const [problem, setProblem] = useState<DictationProblem>(null)
  /* Loudness arrives every animation frame. Keeping it out of React state means
     the screen around the waveform never re-renders while someone is speaking. */
  const level = useRef(0)
  const listener = useRef<Listener | null>(null)
  const meter = useRef<{ stop: () => void } | null>(null)
  const onTextRef = useRef(onText)
  onTextRef.current = onText

  const stop = useCallback(() => {
    listener.current?.stop()
    listener.current = null
    meter.current?.stop()
    meter.current = null
    setRecording(false)
    setPartial('')
    level.current = 0
  }, [])

  const start = useCallback(async () => {
    setProblem(null)
    if (!listeningAvailable()) {
      setProblem('unavailable')
      return
    }
    setRecording(true)
    meter.current = await meterMicrophone((v) => {
      level.current = v
    })
    listener.current = listen(language, {
      onPartial: (text) => setPartial(text),
      onFinal: (text) => {
        onTextRef.current(text)
        stop()
      },
      onError: (reason) => {
        setProblem(reason)
        stop()
      },
    })
  }, [language, stop])

  useEffect(() => () => stop(), [stop])

  return {
    recording,
    partial,
    getLevel: () => level.current,
    problem,
    available: listeningAvailable(),
    start,
    stop,
    toggle: () => (recording ? stop() : void start()),
    clearProblem: () => setProblem(null),
  }
}
