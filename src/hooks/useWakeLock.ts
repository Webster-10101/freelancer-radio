import { useCallback, useRef } from 'react'

export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  const request = useCallback(async () => {
    if (!('wakeLock' in navigator)) return
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen')
    } catch {
      // Wake lock request failed — usually means page not visible
    }
  }, [])

  const release = useCallback(async () => {
    await wakeLockRef.current?.release()
    wakeLockRef.current = null
  }, [])

  return { request, release }
}
