import { useCallback, useEffect, useRef, useState } from 'react'

export const SLEEP_OPTIONS = [15, 30, 45, 60] as const
export type SleepMinutes = (typeof SLEEP_OPTIONS)[number]

// Fade happens over the final stretch of the countdown, so audio is silent
// exactly when the timer hits zero.
const FADE_MS = 20_000
const TICK_MS = 250

interface UseSleepTimerOptions {
  /** Fade multiplier passthrough (AudioEngine.setFade — separate from user volume). */
  setFade: (f: number) => void
  /** Called once when the countdown reaches zero (after the fade-out). */
  onComplete: () => void
}

/**
 * Wall-clock sleep timer for channels: counts down, fades the audio out over
 * the last 20 seconds, then stops playback. Timestamp-based so throttled
 * background intervals self-correct on the next tick.
 */
export function useSleepTimer({ setFade, onComplete }: UseSleepTimerOptions) {
  const [minutes, setMinutes] = useState<SleepMinutes | null>(null)
  const [remainingMs, setRemainingMs] = useState(0)
  const deadlineRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Callbacks live in refs so the running interval never needs re-wiring.
  const setFadeRef = useRef(setFade)
  const onCompleteRef = useRef(onComplete)
  setFadeRef.current = setFade
  onCompleteRef.current = onComplete

  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const cancel = useCallback(() => {
    clearTick()
    setFadeRef.current(1)
    setMinutes(null)
    setRemainingMs(0)
  }, [clearTick])

  const start = useCallback((m: SleepMinutes) => {
    clearTick()
    setFadeRef.current(1)
    deadlineRef.current = Date.now() + m * 60_000
    setMinutes(m)
    setRemainingMs(m * 60_000)

    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, deadlineRef.current - Date.now())
      setRemainingMs(remaining)

      if (remaining <= FADE_MS) {
        // Smoothstep on the fade tail so the last audible moments taper gently
        const t = remaining / FADE_MS
        setFadeRef.current(t * t * (3 - 2 * t))
      }

      if (remaining <= 0) {
        clearTick()
        onCompleteRef.current()
        // Restore after stop so the next play isn't silent
        setFadeRef.current(1)
        setMinutes(null)
        setRemainingMs(0)
      }
    }, TICK_MS)
  }, [clearTick])

  useEffect(() => clearTick, [clearTick])

  return { minutes, remainingMs, isActive: minutes !== null, start, cancel }
}
