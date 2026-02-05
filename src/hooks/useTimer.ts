import { useState, useCallback, useRef, useEffect } from 'react'
import { TimerEngine, type TimerState } from '../engine/TimerEngine'

export function useTimer() {
  const [state, setState] = useState<TimerState>('idle')
  const [remainingMs, setRemainingMs] = useState(0)
  const [progress, setProgress] = useState(0)
  const engineRef = useRef<TimerEngine | null>(null)

  const start = useCallback((durationMs: number) => {
    engineRef.current?.destroy()

    const engine = new TimerEngine(
      durationMs,
      (remaining, prog) => {
        setRemainingMs(remaining)
        setProgress(prog)
      },
      () => {
        setState('complete')
      },
    )
    engineRef.current = engine
    engine.start()
    setState('running')
  }, [])

  const pause = useCallback(() => {
    engineRef.current?.pause()
    setState('paused')
  }, [])

  const resume = useCallback(() => {
    engineRef.current?.resume()
    setState('running')
  }, [])

  const reset = useCallback(() => {
    engineRef.current?.reset()
    setState('idle')
    setProgress(0)
    setRemainingMs(0)
  }, [])

  useEffect(() => {
    return () => engineRef.current?.destroy()
  }, [])

  return { state, remainingMs, progress, start, pause, resume, reset }
}
