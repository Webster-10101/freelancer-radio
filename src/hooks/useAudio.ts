import { useEffect, useRef, useCallback, useState } from 'react'
import { AudioEngine } from '../engine/AudioEngine'

export function useAudio(label?: string) {
  const engineRef = useRef<AudioEngine | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [volume, setVolumeState] = useState(1)
  // Bumped by pause(); a play() that was still awaiting warm-up when the
  // caller paused or stopped must not start afterwards.
  const playGenRef = useRef(0)

  useEffect(() => {
    const engine = new AudioEngine(label)
    engineRef.current = engine

    // Warm up audio context on first user interaction (touch/click/key).
    // iOS requires a user gesture to unlock audio — doing it early means
    // the play button doesn't have to wait for warmUp.
    const earlyWarmUp = () => {
      engine.warmUp()
      window.removeEventListener('touchstart', earlyWarmUp)
      window.removeEventListener('click', earlyWarmUp)
      window.removeEventListener('keydown', earlyWarmUp)
    }
    window.addEventListener('touchstart', earlyWarmUp, { once: true })
    window.addEventListener('click', earlyWarmUp, { once: true })
    window.addEventListener('keydown', earlyWarmUp, { once: true })

    return () => {
      window.removeEventListener('touchstart', earlyWarmUp)
      window.removeEventListener('click', earlyWarmUp)
      window.removeEventListener('keydown', earlyWarmUp)
      engine.destroy()
    }
  }, [label])

  const play = useCallback(async (url: string, seekTo = 0) => {
    const gen = ++playGenRef.current
    setIsLoading(true)
    await engineRef.current?.warmUp() // no-op if already warmed by early interaction
    if (gen !== playGenRef.current) {
      setIsLoading(false)
      return false
    }
    const ok = (await engineRef.current?.play(url, seekTo)) ?? false
    setIsLoading(false)
    setIsPlaying(ok)
    return ok
  }, [])

  const pause = useCallback(() => {
    playGenRef.current++
    engineRef.current?.pause()
    setIsPlaying(false)
  }, [])

  const resume = useCallback(async () => {
    const ok = (await engineRef.current?.resume()) ?? false
    setIsPlaying(ok)
    return ok
  }, [])

  const setVolume = useCallback((v: number) => {
    engineRef.current?.setVolume(v)
    setVolumeState(v)
  }, [])

  const setFade = useCallback((f: number) => {
    engineRef.current?.setFade(f)
  }, [])

  const onTrackEnd = useCallback((callback: () => void) => {
    engineRef.current?.onTrackEnd(callback)
  }, [])

  const getCurrentTime = useCallback(() => {
    return engineRef.current?.getCurrentTime() ?? 0
  }, [])

  const getCurrentSrc = useCallback(() => {
    return engineRef.current?.getCurrentSrc() ?? ''
  }, [])

  return {
    play,
    pause,
    resume,
    setVolume,
    setFade,
    onTrackEnd,
    getCurrentTime,
    getCurrentSrc,
    isPlaying,
    isLoading,
    volume,
  }
}
