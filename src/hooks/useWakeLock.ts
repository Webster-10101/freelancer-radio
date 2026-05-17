import { useCallback, useEffect, useRef } from 'react'

export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const wantedRef = useRef(false)

  const acquire = useCallback(async () => {
    if (!('wakeLock' in navigator)) return
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen')
    } catch {
      // Wake lock request failed — usually means page not visible.
      // We'll retry on the next visibilitychange when the page returns.
    }
  }, [])

  const request = useCallback(async () => {
    wantedRef.current = true
    await acquire()
  }, [acquire])

  const release = useCallback(async () => {
    wantedRef.current = false
    await wakeLockRef.current?.release()
    wakeLockRef.current = null
  }, [])

  // Browsers auto-release wake locks when the tab becomes hidden.
  // Re-acquire when it returns, but only if a caller still wants it.
  useEffect(() => {
    const onVisibility = () => {
      if (
        document.visibilityState === 'visible' &&
        wantedRef.current &&
        wakeLockRef.current === null
      ) {
        acquire()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [acquire])

  return { request, release }
}
